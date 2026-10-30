import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { enforceLimit } from '@/lib/publicSecurity';
function validQuoteToken(token: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token);
}

export async function GET(_request: Request, context: { params: Promise<{ token: string }> }) {
  try {
    const limited = await enforceLimit(_request, 'quotes-view', 30, 3600);
    if (limited) return limited;

    const { token } = await context.params;
    if (!validQuoteToken(token)) {
  return NextResponse.json(
    { error: 'Invalid quote link.' },
    { status: 400 }
  );
}
    const { data, error } = await supabaseAdmin.from('quotes').select(`
      id, quote_number, status, notes, subtotal, gst, total, expiry_date, terms,
      gst_included, created_at, job_card_id,
      customers(first_name,last_name),
      vehicles(year,make,model,registration)
    `).eq('public_token', token).maybeSingle();
    if (error) throw error;
    if (!data || data.status === 'Draft') return NextResponse.json({ error:'Quote not available.' }, { status:404 });

    const [labour, parts, job] = await Promise.all([

supabaseAdmin.from('quote_labour').select('description,hours,rate').eq('quote_id',data.id).order('created_at'),
supabaseAdmin.from('quote_parts').select('part_number,description,quantity,unit_price').eq('quote_id',data.id).order('created_at'),
      data.job_card_id ? supabaseAdmin.from('job_cards').select('diagnosis').eq('id',data.job_card_id).maybeSingle() : Promise.resolve({data:null,error:null} as any),
    ]);
    if (labour.error) throw labour.error; if (parts.error) throw parts.error; if (job.error) throw job.error;

const { id, job_card_id, ...publicQuote } = data;

return NextResponse.json({
  quote: {
    ...publicQuote,
    diagnosis: job.data?.diagnosis || '',
  },
  labour: labour.data || [],
  parts: parts.data || [],
});

  } catch(error) {
    console.error('Public quote GET failed:',error);
    return NextResponse.json({error:'Unable to load quote.'},{status:500});
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ token: string }> }) {
  try {
    const limited = await enforceLimit(request, 'quote-response', 5, 3600);
    if (limited) return limited;

    const { token } = await context.params;
    if (!validQuoteToken(token)) {
      return NextResponse.json(
        { error: 'Invalid quote link.' },
        { status: 400 }
      );
    }
    const body = await request.json();
    if (body.status !== 'Approved' && body.status !== 'Declined')
      return NextResponse.json({error:'Invalid response.'},{status:400});
    const { data: quote, error: lookupError } = await supabaseAdmin.from('quotes').select('id,status').eq('public_token',token).maybeSingle();
    if (lookupError) throw lookupError;
    if (!quote) return NextResponse.json({error:'Quote not found.'},{status:404});
    if (quote.status !== 'Sent')
      return NextResponse.json({error:'This quote has already been responded to.'},{status:409});
    const { data: updated, error } = await supabaseAdmin.from('quotes').update({status:body.status}).eq('id',quote.id).eq('status','Sent').select('id').maybeSingle();
    if (error) throw error;
    if (!updated) return NextResponse.json({error:'This quote is no longer awaiting a response.'},{status:409});
    return NextResponse.json({ok:true,status:body.status});
  } catch(error) {
    console.error('Public quote PATCH failed:',error);
    return NextResponse.json({error:'Unable to update quote.'},{status:500});
  }
}
