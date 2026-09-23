import React, { useEffect, useRef, useState } from 'react';
import { useLinkAccount, useModalStatus, usePrivy } from '@privy-io/react-auth';
import type { PasskeyWithMetadata, PrivyErrorCode, User } from '@privy-io/react-auth';
import Button from '../shared/Button';
import { KeyIcon } from '../shared/icons';
import { describePasskey, isPasskey, signInMethods } from '../../utils/linkedAccounts';

interface PasskeysSectionProps {
  user: User;
}

/**
 * What went wrong, in words. The three cases the owner asked to tell apart —
 * cancelled, unsupported device, anything else — plus the two Privy codes a
 * passkey link can plausibly hit. The codes are the string values of
 * `PrivyErrorCode` in @privy-io/react-auth (a type-only `declare enum`, so
 * the literals are compared here); never shown raw.
 */
function describeLinkError(code: PrivyErrorCode | unknown): string {
  switch (code) {
    case 'exited_link_flow':
    case 'exited_auth_flow':
      return 'Setup cancelled. Nothing changed on your account.';
    case 'passkey_not_allowed':
    case 'not_supported':
      return 'This device or browser cannot create a passkey. Try Safari on an iPhone or Mac, or Chrome on Android.';
    case 'linked_to_another_user':
      return 'That passkey already belongs to another account.';
    case 'too_many_requests':
      return 'Too many attempts. Wait a minute and try again.';
    default:
      return 'Passkey setup failed. Nothing changed on your account; try again.';
  }
}

function formatAdded(date: Date | null): string | null {
  if (!date) return null;
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

interface PasskeyRowProps {
  passkey: PasskeyWithMetadata;
  isNew: boolean;
  /** Null when removal is allowed; otherwise the reason it is not. */
  blockedReason: string | null;
  onRemove: (credentialId: string) => Promise<unknown>;
}

/**
 * One passkey, with its own Remove: a confirm step, its own pending flag, its
 * own error. Nothing here is shared with the row above or below.
 */
const PasskeyRow: React.FC<PasskeyRowProps> = ({ passkey, isNew, blockedReason, onRemove }) => {
  const [confirming, setConfirming] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = async () => {
    setRemoving(true);
    setError(null);
    try {
      await onRemove(passkey.credentialId);
      // On success the row leaves the list with the next `user`; nothing to reset.
    } catch {
      setError('Could not remove this passkey. It is still on your account; try again.');
    } finally {
      setRemoving(false);
      setConfirming(false);
    }
  };

  const added = formatAdded(passkey.firstVerifiedAt);

  return (
    <li className="py-3">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-inset text-content-secondary">
          <KeyIcon className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="mb-0 flex items-center gap-2 text-[15px] leading-tight text-content-primary">
            <span className="truncate">{describePasskey(passkey)}</span>
            {isNew && (
              <span className="shrink-0 rounded-chip bg-eth-blue-wash px-1.5 py-0.5 text-[11px] text-eth-blue-text">New</span>
            )}
          </p>
          <p className="mb-0 mt-0.5 text-xs text-content-muted">
            {added ? `Added ${added}` : 'Added date not recorded'}
            {passkey.enrolledInMfa ? ' · also used for MFA' : ''}
          </p>
        </div>
        {!confirming && (
          <Button variant="outline" size="small" onClick={() => setConfirming(true)} disabled={blockedReason !== null}>
            Remove
          </Button>
        )}
      </div>

      {confirming && (
        <div className="mt-3 rounded-control bg-surface-inset p-3">
          <p className="mb-2 text-sm text-content-secondary">Remove this passkey? You will not be able to sign in with it.</p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="small" onClick={() => setConfirming(false)} disabled={removing}>
              Keep
            </Button>
            <Button variant="destructive" size="small" onClick={remove} disabled={removing}>
              {removing ? 'Removing…' : 'Remove'}
            </Button>
          </div>
        </div>
      )}

      {blockedReason && !confirming && (
        <p className="mb-0 mt-2 text-xs text-content-muted">{blockedReason}</p>
      )}
      {error && (
        <p className="mb-0 mt-2 text-sm text-signal-reverted" role="alert">
          {error}
        </p>
      )}
    </li>
  );
};

/**
 * Passkeys: the list, and the way to add one.
 *
 * `linkPasskey` from `useLinkAccount` opens Privy's modal and returns nothing;
 * the result comes back through the hook's `onSuccess` / `onError` callbacks
 * (docs.privy.io/user-management/users/linking-accounts). So `submitting` is
 * set on click and released by whichever fires. Two more releases guard the
 * gaps: the modal closing with neither callback (`useModalStatus`), and the
 * modal never opening at all (a timer). Same rule as an onchain button with a
 * `finally` — something always releases it.
 */
const PasskeysSection: React.FC<PasskeysSectionProps> = ({ user }) => {
  const { unlinkPasskey } = usePrivy();
  const { isOpen } = useModalStatus();

  const accounts = user.linkedAccounts ?? [];
  const passkeys = accounts.filter(isPasskey);
  const otherMethods = signInMethods(accounts).length - passkeys.length;

  // Removing a passkey is blocked when it is the only thing that can sign you in.
  const blockedReason =
    passkeys.length === 1 && otherMethods === 0
      ? 'This is your only way to sign in. Add an email or a second passkey before removing it.'
      : null;

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);

  // WebAuthn availability, read after mount so the static HTML matches the
  // first client render. `null` until then: the button waits rather than lies.
  const [supported, setSupported] = useState<boolean | null>(null);
  useEffect(() => {
    setSupported(typeof window !== 'undefined' && typeof window.PublicKeyCredential !== 'undefined');
  }, []);

  const modalSeen = useRef(false);
  const neverOpened = useRef<number>();

  const release = () => {
    window.clearTimeout(neverOpened.current);
    setSubmitting(false);
  };

  const { linkPasskey } = useLinkAccount({
    onSuccess: ({ linkMethod, linkedAccount }) => {
      if (linkMethod !== 'passkey') return;
      if (linkedAccount.type === 'passkey') setAddedId(linkedAccount.credentialId);
      release();
    },
    onError: (code, { linkMethod }) => {
      if (linkMethod !== 'passkey') return;
      setError(describeLinkError(code));
      release();
    },
  });

  // Modal watcher: once the modal has been open and is now closed while we are
  // still pending, the person dismissed it without a callback — release.
  useEffect(() => {
    if (!submitting) {
      modalSeen.current = false;
      return;
    }
    if (isOpen) {
      modalSeen.current = true;
      window.clearTimeout(neverOpened.current);
      return;
    }
    if (modalSeen.current) setSubmitting(false);
  }, [isOpen, submitting]);

  // Nothing pending may outlive the component.
  useEffect(() => () => window.clearTimeout(neverOpened.current), []);

  const start = () => {
    setError(null);
    setAddedId(null);
    setSubmitting(true);
    window.clearTimeout(neverOpened.current);
    neverOpened.current = window.setTimeout(() => {
      if (!modalSeen.current) setSubmitting(false);
    }, 6000);
    try {
      linkPasskey();
    } catch (e) {
      setError(describeLinkError(e));
      release();
    }
  };

  const unsupported = supported === false;

  return (
    <section className="rounded-card border border-line-hairline bg-surface-slab p-5" aria-labelledby="settings-passkeys">
      <h2 id="settings-passkeys" className="text-lg font-bold text-content-primary">
        Passkeys
      </h2>
      <p className="mb-0 mt-1 text-sm text-content-muted">
        Sign in with Face ID, Touch ID or your device PIN instead of an email code.
      </p>

      {passkeys.length > 0 && (
        <ul className="mt-2 divide-y divide-line-hairline">
          {passkeys.map((p) => (
            <PasskeyRow
              key={p.credentialId}
              passkey={p}
              isNew={p.credentialId === addedId}
              blockedReason={blockedReason}
              onRemove={unlinkPasskey}
            />
          ))}
        </ul>
      )}

      <div className="mt-4 space-y-2">
        <Button onClick={start} disabled={submitting || supported !== true} fullWidth className="md:w-auto">
          {submitting ? 'Waiting for your device…' : passkeys.length > 0 ? 'Add another passkey' : 'Set up a passkey'}
        </Button>
        {unsupported && <p className="mb-0 text-xs text-content-muted">This browser does not support passkeys.</p>}
      </div>

      {error && (
        <p className="mb-0 mt-3 text-sm text-signal-reverted" role="alert">
          {error}
        </p>
      )}
      {addedId && !error && (
        <p className="mb-0 mt-3 text-sm text-content-primary" role="status">
          Passkey added. It is in the list above and works the next time you sign in.
        </p>
      )}
    </section>
  );
};

export default PasskeysSection;
