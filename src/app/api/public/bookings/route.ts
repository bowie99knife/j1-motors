import { enforceLimit, field, phoneField, emailField, yearField, dateField, jsonBody, reference, invalidResponse, InvalidInput } from '@/lib/publicSecurity';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

function clean(value: unknown, max = 2000) { return field(value, 'Field', max); }
function splitName(fullName: string) {
  const pieces = fullName.trim().split(/\s+/);
  return { firstName: pieces.shift() || fullName, lastName: pieces.join(' ') || null };
}

export async function POST(request: Request) {
  try {
    const limited = await enforceLimit(request, 'bookings', 5, 3600);
    if (limited) return limited;
    const body = await jsonBody(request);
    const name = clean(body.name, 150), phone = phoneField(body.phone);
    const registration = clean(body.registration, 20).toUpperCase();
    const state = clean(body.registrationState, 10).toUpperCase();

const validStates = new Set([
  'WA', 'NSW', 'VIC', 'QLD',
  'SA', 'TAS', 'ACT', 'NT'
]);

if (!validStates.has(state)) {
  return NextResponse.json(
    { error: 'Please select a valid Australian registration state.' },
    { status: 400 }
  );
}

    const service = clean(body.service, 120);
    const date = dateField(body.preferredDate), time = clean(body.preferredTime, 30);

const allowedServices = new Set([
  'General Service',
  'Logbook Service',
  'Diagnostics',
  'Brake Repairs',
  'Suspension & Steering',
  'Engine Repair',
  'Battery & Electrical',
  'Other',
]);

const allowedTimes = new Set([
  '8:30 AM',
  '9:00 AM',
  '9:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '1:00 PM',
  '1:30 PM',
  '2:00 PM',
  '2:30 PM',
  '3:00 PM',
  '3:30 PM',
  '4:00 PM',
  '4:30 PM',
  '5:00 PM',
]);

if (!allowedServices.has(service)) {

if (!name || !phone || !registration || !state || !service || !date || !time) {
  return NextResponse.json(
    { error: 'Please complete all required booking fields.' },
    { status: 400 }
  );
}

  return NextResponse.json(
    { error: 'Please select a valid service.' },
    { status: 400 }
  );
}

if (!allowedTimes.has(time)) {
  return NextResponse.json(
    { error: 'Please select a valid appointment time.' },
    { status: 400 }
  );
}

    const { firstName, lastName } = splitName(name);
    const email = emailField(body.email);
    let customerId: string;
    const { data: existingCustomer, error: customerLookupError } = await supabaseAdmin.from('customers').select('id').eq('phone', phone).limit(1).maybeSingle();
    if (customerLookupError) throw customerLookupError;
    if (existingCustomer) {
      customerId = existingCustomer.id;
      // A public form is not proof of ownership of an existing phone number.
      // Preserve verified customer details; staff can edit them after authentication.
    } else {
      const { data, error } = await supabaseAdmin.from('customers').insert({ first_name:firstName,last_name:lastName,phone,email }).select('id').single();
      if (error) throw error; customerId = data.id;
    }

    let vehicleId: string;
    const { data: existingVehicle, error: vehicleLookupError } = await supabaseAdmin.from('vehicles').select('id,customer_id').eq('registration', registration).eq('state', state).limit(1).maybeSingle();
    if (vehicleLookupError) throw vehicleLookupError;
    const vehiclePayload = { customer_id:customerId, make:clean(body.make,80)||null, model:clean(body.model,80)||null, year:yearField(body.year) };
    if (existingVehicle) {
      if (existingVehicle.customer_id && existingVehicle.customer_id !== customerId)
        return NextResponse.json({ error:'This vehicle is already registered. Please contact the workshop to book it.' }, { status:409 });
      vehicleId = existingVehicle.id;
      // Never reassign an existing vehicle based on an unauthenticated form.
    } else {
      const { data, error } = await supabaseAdmin.from('vehicles').insert({ ...vehiclePayload, registration, state }).select('id').single();
      if (error) throw error; vehicleId = data.id;
    }

    const bookingNumber = reference('J1-B');
    const { error } = await supabaseAdmin.from('bookings').insert({
      booking_number:bookingNumber, customer_id:customerId, vehicle_id:vehicleId,
      booking_date:date, booking_time:time, status:'Waiting Confirmation',
      booking_type:service, customer_notes:clean(body.notes,2000)||null
    });
    if (error) throw error;
    return NextResponse.json({ ok:true, bookingNumber }, { status:201 });
  } catch (error) {
    return invalidResponse(error, 'Unable to submit booking. Please try again.');
  }
}
