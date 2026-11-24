
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { enforceLimit } from '@/lib/publicSecurity';

const clean = (value: unknown, max = 100): string =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

const notFound = () =>
  NextResponse.json(
    { error: 'No matching repair record found.' },
    { status: 404 }
  );

export async function POST(request: Request) {
  try {
    // Limit public tracking requests.
    const limited = await enforceLimit(request, 'track', 10, 3600);
    if (limited) return limited;

    const body = await request.json();

    // Vehicle registration and phone number only.
    const phone = clean(body?.phone, 50);
    const registration = clean(body?.registration, 20).toUpperCase();
    const state = clean(body?.registrationState, 10).toUpperCase();

    if (!phone || !registration || !state) {
      return NextResponse.json(
        { error: 'Please enter the registration state, registration number and phone number.' },
        { status: 400 }
      );
    }

    const validStates = new Set([
      'WA', 'NSW', 'VIC', 'QLD',
      'SA', 'TAS', 'ACT', 'NT'
    ]);

    if (!validStates.has(state)) {
      return NextResponse.json(
        { error: 'Please select a valid registration state.' },
        { status: 400 }
      );
    }

    // Find customers with the matching phone number.
    const customers = await supabaseAdmin
      .from('customers')
      .select('id')
      .eq('phone', phone)
      .limit(100);

    if (customers.error) throw customers.error;

    const customerIds = (customers.data ?? []).map(
      (customer) => customer.id
    );

    if (!customerIds.length) return notFound();

    // Only find vehicles belonging to those customers.
    const vehicles = await supabaseAdmin
      .from('vehicles')
      .select('id')
      .in('customer_id', customerIds)
      .eq('registration', registration)
      .eq('state', state)
      .limit(100);

    if (vehicles.error) throw vehicles.error;

    const vehicleIds = (vehicles.data ?? []).map(
      (vehicle) => vehicle.id
    );

    if (!vehicleIds.length) return notFound();

    // Find bookings associated with matching vehicles.
    const bookings = await supabaseAdmin
      .from('bookings')
      .select(`
        id,
        booking_number,
        booking_date,
        booking_time,
        status,
        booking_type,
        customer_id,
        vehicle_id,
        vehicles(year,make,model,registration,state)
      `)
      .in('vehicle_id', vehicleIds)
      .in('customer_id', customerIds)
      .order('booking_date', { ascending: false })
      .order('booking_time', { ascending: false })
      .limit(100);

    if (bookings.error) throw bookings.error;

    const candidates = (bookings.data ?? []).filter(
      (booking) =>
        !['cancelled', 'canceled'].includes(
          String(booking.status ?? '').trim().toLowerCase()
        )
    );

    if (!candidates.length) return notFound();

    // Get the latest job-card status for each booking.
    const jobs = await supabaseAdmin
      .from('job_cards')
      .select('booking_id,status,updated_at')
      .in(
        'booking_id',
        candidates.map((booking) => booking.id)
      )
      .order('updated_at', { ascending: false })
      .limit(200);

    if (jobs.error) throw jobs.error;

    const jobByBooking = new Map<
      string,
      { status: string | null; updated_at: string | null }
    >();

    for (const job of jobs.data ?? []) {
      if (job.booking_id && !jobByBooking.has(job.booking_id)) {
        jobByBooking.set(job.booking_id, job);
      }
    }

    const completed = new Set([
      'collected',
      'completed',
      'complete',
      'cancelled',
      'canceled'
    ]);

    // Prefer an ongoing repair.
    // Otherwise use the latest non-cancelled booking.
    const booking =
      candidates.find((candidate) => {
        const job = jobByBooking.get(candidate.id);

        return (
          job &&
          !completed.has(
            String(job.status ?? '').trim().toLowerCase()
          )
        );
      }) ??
      candidates.find(
        (candidate) =>
          !completed.has(
            String(candidate.status ?? '').trim().toLowerCase()
          )
      ) ??
      candidates[0];

    if (!booking) return notFound();

    // Get the latest status for the selected booking.
    const jobResult = await supabaseAdmin
      .from('job_cards')
      .select('status,updated_at')
      .eq('booking_id', booking.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (jobResult.error) throw jobResult.error;

    const vehicle = booking.vehicles as unknown as {
      year: number | null;
      make: string | null;
      model: string | null;
      registration: string | null;
    } | null;

    return NextResponse.json({
      result: {
        bookingNumber: booking.booking_number || '—',
        bookingStatus: booking.status || '—',
        repairStatus:
          jobResult.data?.status ||
          booking.status ||
          'Status unavailable',
        service: booking.booking_type || '—',
        date: booking.booking_date || '—',
        time: booking.booking_time || '—',
        vehicle: vehicle
          ? [vehicle.year, vehicle.make, vehicle.model]
              .filter(Boolean)
              .join(' ')
          : 'Vehicle',
        registration: vehicle?.registration || '—',
        updatedAt: jobResult.data?.updated_at || null
      }
    });
  } catch (error) {
    console.error('Public tracking API failed:', error);

    return NextResponse.json(
      { error: 'Unable to check repair status.' },
      { status: 500 }
    );
  }
}
