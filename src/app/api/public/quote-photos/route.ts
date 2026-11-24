import { createHash, randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import {
  enforceLimit,
  field,
  jsonBody,
  invalidResponse,
  InvalidInput,
} from '@/lib/publicSecurity';

export const runtime = 'nodejs';

const BUCKET = 'quote-photos';
const MAX_PHOTOS = 6;
const MAX_BYTES = 10 * 1024 * 1024;

const fileTypes: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif',
};

function respond(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

function isValidImage(bytes: Uint8Array, mime: string): boolean {
  if (bytes.length < 16) return false;

  if (mime === 'image/jpeg') {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (mime === 'image/png') {
    const signature = [137, 80, 78, 71, 13, 10, 26, 10];
    return signature.every((value, index) => bytes[index] === value);
  }

  if (mime === 'image/webp') {
    const header = Buffer.from(bytes);
    return (
      header.toString('ascii', 0, 4) === 'RIFF' &&
      header.toString('ascii', 8, 12) === 'WEBP'
    );
  }

  if (mime === 'image/heic' || mime === 'image/heif') {
    const header = Buffer.from(bytes);
    if (header.toString('ascii', 4, 8) !== 'ftyp') return false;

    const brand = header.toString('ascii', 8, 12);
    const heicBrands = new Set(['heic', 'heix', 'hevc', 'hevx']);
    const heifBrands = new Set(['mif1', 'msf1']);

    return mime === 'image/heic'
      ? heicBrands.has(brand)
      : heifBrands.has(brand);
  }

  return false;
}

async function getUploadSession(token: string) {
  if (!/^[a-f0-9]{64}$/.test(token)) {
    throw new InvalidInput('Invalid or expired photo upload session.');
  }

  const tokenHash = createHash('sha256').update(token).digest('hex');
  const { data, error } = await supabaseAdmin
    .from('quote_upload_sessions')
    .select('id, quote_id, expires_at')
    .eq('token_hash', tokenHash)
    .maybeSingle();

  if (error) throw error;
  if (!data || Date.parse(data.expires_at) <= Date.now()) {
    throw new InvalidInput('Photo upload session has expired.');
  }

  return data;
}

async function reservePhoto(quoteId: string, mime: string) {
  const extension = fileTypes[mime];
  if (!extension) throw new InvalidInput('Unsupported image format.');

  for (let slot = 1; slot <= MAX_PHOTOS; slot++) {
    const path = `${quoteId}/${randomUUID()}.${extension}`;
    const { data, error } = await supabaseAdmin
      .from('quote_photo_uploads')
      .insert({
        quote_id: quoteId,
        slot,
        storage_path: path,
        status: 'reserved',
      })
      .select('id, storage_path')
      .single();

    if (!error && data) return data;
    if (error?.code === '23505') continue;
    throw error || new Error('Unable to reserve photo.');
  }

  throw new InvalidInput('Maximum of six photo uploads reached.');
}

async function createUpload(quoteId: string, mime: string) {
  const reservation = await reservePhoto(quoteId, mime);
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUploadUrl(reservation.storage_path, { upsert: false });

  if (error || !data) {
    const { error: cleanupError } = await supabaseAdmin
      .from('quote_photo_uploads')
      .delete()
      .eq('id', reservation.id)
      .eq('status', 'reserved');

    if (cleanupError) {
      console.error('Unable to remove failed photo reservation:', cleanupError);
    }

    throw error || new Error('Unable to authorise photo upload.');
  }

  return respond({
    ok: true,
    uploadId: reservation.id,
    path: reservation.storage_path,
    signedToken: data.token,
  });
}

async function verifyUpload(quoteId: string, uploadId: string) {
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      uploadId
    )
  ) {
    throw new InvalidInput('Invalid photo upload ID.');
  }

  const { data: reservation, error: lookupError } = await supabaseAdmin
    .from('quote_photo_uploads')
    .select('id, storage_path, status')
    .eq('id', uploadId)
    .eq('quote_id', quoteId)
    .maybeSingle();

  if (lookupError) throw lookupError;
  if (!reservation) throw new InvalidInput('Photo upload was not found.');

  if (reservation.status === 'verified') {
    return respond({ ok: true, verified: true });
  }

  if (reservation.status !== 'reserved') {
    throw new InvalidInput('This photo upload cannot be verified.');
  }

  const { data: attemptId, error: claimError } = await supabaseAdmin.rpc(
    'j1_claim_quote_photo_verification',
    {
      p_upload_id: reservation.id,
      p_quote_id: quoteId,
    }
  );

  if (claimError) throw claimError;
  if (!attemptId) {
    throw new InvalidInput('This photo upload is already being processed.');
  }

  // Only errors after a successful claim should release this attempt.
  try {
    const extension = reservation.storage_path.split('.').pop()?.toLowerCase();
    const mimeByExtension: Record<string, string> = {
      jpg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      heic: 'image/heic',
      heif: 'image/heif',
    };
    const expectedMime = mimeByExtension[extension || ''];

    if (!expectedMime) {
      throw new InvalidInput('Unsupported photo format.');
    }

    const { data: file, error: downloadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .download(reservation.storage_path);

    if (downloadError || !file) {
      throw new InvalidInput('Photo was not uploaded successfully.');
    }

    if (file.size === 0 || file.size > MAX_BYTES) {
      throw new InvalidInput('Photo must be no larger than 10 MB.');
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!isValidImage(bytes, expectedMime)) {
      throw new InvalidInput(
        'Photo contents do not match the selected image format.'
      );
    }

    const { data: finalized, error: finalizeError } = await supabaseAdmin.rpc(
      'j1_finalize_quote_photo',
      {
        p_upload_id: reservation.id,
        p_quote_id: quoteId,
        p_attempt_id: attemptId,
      }
    );

    if (finalizeError) throw finalizeError;
    if (finalized !== true) {
      throw new InvalidInput(
        'This photo upload could not be verified. Please contact the workshop.'
      );
    }

    return respond({ ok: true, verified: true });
  } catch (error) {
    // Release only this verification attempt, not a newer attempt.
    try {
      const { error: releaseError } = await supabaseAdmin.rpc(
        'j1_release_quote_photo_attempt',
        {
          p_upload_id: reservation.id,
          p_quote_id: quoteId,
          p_attempt_id: attemptId,
        }
      );

      if (releaseError) {
        console.error('Unable to release failed photo verification:', releaseError);
      }
    } catch (releaseFailure) {
      console.error('Unable to release failed photo verification:', releaseFailure);
    }

    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const limited = await enforceLimit(request, 'quote-photos', 60, 3600);
    if (limited) return limited;

    const body = await jsonBody(request);
    const action = field(body.action, 'Action', 20, true);
    const uploadToken = field(body.uploadToken, 'Upload token', 64, true);
    const session = await getUploadSession(uploadToken);

    if (action === 'reserve') {
      const mime = field(body.mime, 'Image format', 50, true);
      return await createUpload(session.quote_id, mime);
    }

    if (action === 'verify') {
      const uploadId = field(body.uploadId, 'Upload ID', 50, true);
      return await verifyUpload(session.quote_id, uploadId);
    }

    throw new InvalidInput('Invalid photo upload action.');
  } catch (error) {
    return invalidResponse(error, 'Unable to process photo upload.');
  }
}
