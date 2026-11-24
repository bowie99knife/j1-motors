
import { createHash, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BUCKET = 'quote-photos';
const BATCH_SIZE = 25;
const LOCK_SECONDS = 3600;
const DELETE_TIMEOUT_MS = 30_000;

type CleanupItem = {
  upload_id: string;
  storage_path: string;
  attempt_id: string;
};

function reply(
  body: Record<string, unknown>,
  status = 200
) {
  return NextResponse.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}

function isAuthorized(request: Request): boolean {
  const expected = process.env.QUOTE_CLEANUP_SECRET;

  if (!expected || expected.length < 32) {
    return false;
  }

  const authorization =
    request.headers.get('authorization');

  if (!authorization?.startsWith('Bearer ')) {
    return false;
  }

  const provided = authorization.slice(7);

  const a = createHash('sha256')
    .update(provided)
    .digest();

  const b = createHash('sha256')
    .update(expected)
    .digest();

  return timingSafeEqual(a, b);
}

async function stillOwnsLock(
  lockToken: string
): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('quote_photo_cleanup_lock')
    .select('lock_token, locked_until')
    .eq('id', 1)
    .single();

  if (error || !data) {
    throw error ?? new Error('Cleanup lock missing');
  }

  return (
    data.lock_token === lockToken &&
    new Date(data.locked_until).getTime() >
      Date.now() + 60_000
  );
}

async function stillOwnsAttempt(
  item: CleanupItem
): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('quote_photo_uploads')
    .select('id')
    .eq('id', item.upload_id)
    .eq('status', 'cleaning')
    .eq('cleanup_attempt_id', item.attempt_id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data !== null;
}

async function markForReview(
  item: CleanupItem
): Promise<void> {
  const { data, error } = await supabaseAdmin
    .from('quote_photo_uploads')
    .update({ status: 'needs_review' })
    .eq('id', item.upload_id)
    .eq('status', 'cleaning')
    .eq('cleanup_attempt_id', item.attempt_id)
    .select('id')
    .maybeSingle();

  if (error) {
    console.error(
      'Failed to mark cleanup item for review',
      item.upload_id,
      error
    );
    return;
  }

  if (!data) {
    console.error(
      'Cleanup review update did not match an active attempt',
      item.upload_id
    );
  }
}


async function removeStorageObject(
  storagePath: string
): Promise<void> {
  const deletion = supabaseAdmin.storage
    .from(BUCKET)
    .remove([storagePath]);

  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(
        new Error('Storage deletion timed out after 30 seconds')
      );
    }, DELETE_TIMEOUT_MS);
  });

  try {
    const { error } = await Promise.race([
      deletion,
      timeout,
    ]);

    if (error) {
      throw error;
    }
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return reply(
      {
        ok: false,
        error: 'Unauthorized',
      },
      401
    );
  }

  let lockToken: string | null = null;

  try {
    // Acquire the global cleanup lock.
    const { data: acquired, error: lockError } =
      await supabaseAdmin.rpc(
        'j1_acquire_quote_cleanup_lock',
        {
          p_lease_seconds: LOCK_SECONDS,
        }
      );

    if (lockError) {
      throw lockError;
    }

    if (!acquired) {
      return reply({
        ok: true,
        skipped: true,
        reason: 'Cleanup already running',
      });
    }

    lockToken = acquired;

    // Recover abandoned verification attempts.
    const { data: recovered, error: recoveryError } =
      await supabaseAdmin.rpc(
        'j1_recover_stale_quote_verifications',
        {
          p_limit: BATCH_SIZE,
        }
      );

    if (recoveryError) {
      throw recoveryError;
    }

    // Retry eligible interrupted cleanup attempts.
    const { data: retried, error: retryError } =
      await supabaseAdmin.rpc(
        'j1_acquire_quote_photo_cleanup',
        {
          p_limit: BATCH_SIZE,
        }
      );

    if (retryError) {
      throw retryError;
    }

    const retries = (retried ?? []) as CleanupItem[];

    const remaining = Math.max(
      0,
      BATCH_SIZE - retries.length
    );

    let newlyClaimed: CleanupItem[] = [];

    // Claim new abandoned reservations.
    if (remaining > 0) {
      const { data, error } = await supabaseAdmin.rpc(
        'j1_claim_abandoned_quote_photos',
        {
          p_limit: remaining,
        }
      );

      if (error) {
        throw error;
      }

      newlyClaimed = (data ?? []) as CleanupItem[];
    }

    const items = [
      ...retries,
      ...newlyClaimed,
    ];

    let removed = 0;
    let failed = 0;

    for (const item of items) {
      try {
        // Renew global lock ownership.
        const { data: renewed, error: renewError } =
          await supabaseAdmin.rpc(
            'j1_renew_quote_cleanup_lock',
            {
              p_lock_token: lockToken,
              p_lease_seconds: LOCK_SECONDS,
            }
          );

        if (renewError) {
          throw renewError;
        }


if (
  !renewed ||
  !lockToken ||
  !(await stillOwnsLock(lockToken))
) {

          return reply(
            {
              ok: false,
              error: 'Cleanup lock ownership lost',
              removed,
              failed,
            },
            409
          );
        }

        // Confirm this worker still owns the attempt.
        if (!(await stillOwnsAttempt(item))) {
          failed++;
          continue;
        }

        // Never delete a verified photo.
        const {
          data: verified,
          error: verifiedError,
        } = await supabaseAdmin
          .from('quote_photos')
          .select('id')
          .eq('storage_path', item.storage_path)
          .limit(1);

        if (verifiedError) {
          throw verifiedError;
        }

        if (verified?.length) {
          console.error(
            'Cleanup skipped verified photo',
            item.upload_id
          );

          failed++;
          continue;
        }

        // Delete the abandoned Storage object.
        await removeStorageObject(item.storage_path);

        // Finalize only if this worker still owns
        // the cleanup attempt and global lock.
        const {
          data: finalized,
          error: finalizeError,
        } = await supabaseAdmin.rpc(
          'j1_finalize_quote_photo_cleanup',
          {
            p_upload_id: item.upload_id,
            p_attempt_id: item.attempt_id,
            p_lock_token: lockToken,
          }
        );

        if (finalizeError) {
          throw finalizeError;
        }

        if (!finalized) {
          throw new Error(
            'Cleanup finalization rejected'
          );
        }

        removed++;
      } catch (itemError) {
        failed++;

        console.error(
          'Quote photo cleanup item failed',
          item.upload_id,
          itemError
        );

        // Prevent ordinary retries of uncertain failures.
        await markForReview(item);
      }
    }

    return reply(
      {
        ok: failed === 0,
        recovered: recovered ?? 0,
        retried: retries.length,
        claimed: newlyClaimed.length,
        removed,
        failed,
      },
      failed > 0 ? 207 : 200
    );
  } catch (error) {
    console.error(
      'Quote photo cleanup failed',
      error
    );

    return reply(
      {
        ok: false,
        error: 'Cleanup failed',
      },
      500
    );
  } finally {
    if (lockToken) {
      const { error } = await supabaseAdmin.rpc(
        'j1_release_quote_cleanup_lock',
        {
          p_lock_token: lockToken,
        }
      );

      if (error) {
        console.error(
          'Cleanup lock release failed',
          error
        );
      }
    }
  }
}
