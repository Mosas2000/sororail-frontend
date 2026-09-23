/**
 * Loading placeholder shown while a card is waiting on-chain data.
 *
 * Reserves roughly the same shape as the resolved card so the real content
 * doesn't shift the layout when it renders, and exposes `aria-busy` plus a
 * polite live-region announcement so assistive tech knows something is
 * loading instead of seeing nothing update.
 */
export function CardSkeleton({ label = "Reading from the chain…" }: { label?: string }) {
  return (
    <div className="stack stack--tight" aria-busy="true" role="status">
      <span className="sr-only">{label}</span>
      <div className="skeleton-line skeleton-line--narrow" aria-hidden="true" />
      <div className="skeleton-line skeleton-line--full" aria-hidden="true" />
      <div className="skeleton-line skeleton-line--wide" aria-hidden="true" />
    </div>
  );
}
