/** Safari on iOS has no install prompt API, so explain the manual steps. */
export function IosInstallHint({ onClose }: { onClose: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ios-install-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="panel w-full max-w-sm rounded-3xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="ios-install-title" className="font-display text-xl">
          Install Eatventure Handbook
        </h2>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-soft">
          <li>
            Tap the <strong>Share</strong> button in Safari's toolbar.
          </li>
          <li>
            Choose <strong>Add to Home Screen</strong>.
          </li>
          <li>
            Tap <strong>Add</strong>. The app then opens full-screen and works
            offline.
          </li>
        </ol>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-xl border border-line-strong py-2 text-sm text-gold"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
