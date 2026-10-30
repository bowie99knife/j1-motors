
import { createHash, randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import {
  enforceLimit,
  reference,
  field,
  phoneField,
  emailField,
  yearField,
  jsonBody,
  invalidResponse,
} from '@/lib/publicSecurity';

function clean(value: unknown, max = 2000): string {
  return field(value, 'Field', max);
}

function splitName(fullName: string) {
  const pieces = fullName.trim().split(/\s+/);

  return {
    firstName: pieces.shift() || fullName,
    lastName: pieces.join(' ') || null,
  };
}

const validStates = new Set([
  'WA', 'NSW', 'VIC', 'QLD',
  'SA', 'TAS', 'ACT', 'NT',
]);

const allowedCategories = new Set([
  'Engine',
  'Transmission',
  'Brakes',
  'Suspension',
  'Electrical',
  'Air Conditioning',
  'Diagnostics',
  'General Repair',
  'Other',
]);

export async function POST(request: Request) {
  try {
    const limited = await enforceLimit(
      request,
      'quote-requests',
      5,
      3600
    );

    if (limited) return limited;

    const body = await jsonBody(request);

    const name = clean(body.name, 150);
    const phone = phoneField(body.phone);
    const registration = clean(body.registration, 20).toUpperCase();
    const state = clean(body.registrationState, 10).toUpperCase();
    const category = clean(body.category, 100);
    const description = clean(body.description, 2000);
    const email = emailField(body.email);

    const contactMethod = field(
      body.contactMethod,
      'Preferred contact method',
      10,
      true
    );

    if (contactMethod !== 'phone' && contactMethod !== 'email') {
      return NextResponse.json(
        { error: 'Please select a valid contact method.' },
        { status: 400 }
      );
    }

    if (contactMethod === 'email' && !email) {
      return NextResponse.json(
        { error: 'Email address is required for email contact.' },
        { status: 400 }
      );
    }

    if (
      !name ||
      !phone ||
      !registration ||
      !state ||
      !category ||
      !description
    ) {
      return NextResponse.json(
        { error: 'Please complete all required quote fields.' },
        { status: 400 }
      );
    }

    if (!validStates.has(state)) {
      return NextResponse.json(
        {
          error: 'Please select a valid Australian registration state.',
        },
        { status: 400 }
      );
    }

    if (!allowedCategories.has(category)) {
      return NextResponse.json(
        { error: 'Please select a valid repair category.' },
        { status: 400 }
      );
    }

    const { firstName, lastName } = splitName(name);

    // Find an existing customer without overwriting their details.
    let customerId: string;

    const {
      data: existingCustomer,
      error: customerLookupError,
    } = await supabaseAdmin
      .from('customers')
      .select('id')
      .eq('phone', phone)
      .limit(1)
      .maybeSingle();

    if (customerLookupError) throw customerLookupError;

    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      const { data, error } = await supabaseAdmin
        .from('customers')
        .insert({
          first_name: firstName,
          last_name: lastName,
          phone,
          email,
        })
        .select('id')
        .single();

      if (error) throw error;

      customerId = data.id;
    }

    // Find or create the vehicle without changing its owner.
    let vehicleId: string;

    const {
      data: existingVehicle,
      error: vehicleLookupError,
    } = await supabaseAdmin
      .from('vehicles')
      .select('id,customer_id')
      .eq('registration', registration)
      .eq('state', state)
      .limit(1)
      .maybeSingle();

    if (vehicleLookupError) throw vehicleLookupError;

    const vehiclePayload = {
      customer_id: customerId,
      make: clean(body.make, 80) || null,
      model: clean(body.model, 80) || null,
      year: yearField(body.year),
    };

    if (existingVehicle) {
      if (
        existingVehicle.customer_id &&
        existingVehicle.customer_id !== customerId
      ) {
        return NextResponse.json(
          {
            error:
              'This vehicle is already registered. Please contact the workshop.',
          },
          { status: 409 }
        );
      }

      vehicleId = existingVehicle.id;
    } else {
      const { data, error } = await supabaseAdmin
        .from('vehicles')
        .insert({
          ...vehiclePayload,
          registration,
          state,
        })
        .select('id')
        .single();

      if (error) throw error;

      vehicleId = data.id;
    }

    // Create the quote and retrieve its internal UUID.
    const ref = reference('J1Q-');

    const { data: createdQuote, error: quoteError } =
      await supabaseAdmin
        .from('quotes')
        .insert({
          quote_number: ref,
          customer_id: customerId,
          vehicle_id: vehicleId,
          status: 'Draft',
          subtotal: 0,
          gst: 0,
          total: 0,
          notes: `${category}: ${description}\nPreferred contact: ${
            contactMethod === 'email' ? 'Email' : 'Phone'
          }${
            contactMethod === 'email' ? ` (${email})` : ''
          }`,
        })
        .select('id')
        .single();

    if (quoteError) throw quoteError;

    // Create a random credential for this quote's photo uploads.
    const uploadToken = randomBytes(32).toString('hex');

    const uploadTokenHash = createHash('sha256')
      .update(uploadToken)
      .digest('hex');

    const expiresAt = new Date(
      Date.now() + 15 * 60 * 1000
    ).toISOString();

    const { error: sessionError } = await supabaseAdmin
      .from('quote_upload_sessions')
      .insert({
        quote_id: createdQuote.id,
        token_hash: uploadTokenHash,
        expires_at: expiresAt,
      });

    if (sessionError) {
      // Best-effort rollback if the upload session cannot be created.
      const { error: cleanupError } = await supabaseAdmin
        .from('quotes')
        .delete()
        .eq('id', createdQuote.id);

      if (cleanupError) {
        console.error(
          'Unable to clean up quote after upload session failure:',
          cleanupError
        );
      }

      throw sessionError;
    }

    return NextResponse.json(
      {
        ok: true,
        reference: ref,
        uploadToken,
      },
      {
        status: 201,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    return invalidResponse(
      error,
      'Unable to submit quote request. Please try again.'
    );
  }
}
