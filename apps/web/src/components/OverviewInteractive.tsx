"use client";

import { usePositions } from "@/components/PositionRegistry";
import type { PositionKind } from "@/lib/positions";
import { useWallet } from "@/lib/wallet";

export function ConnectWalletCard() {
  const { address, connect, connecting } = useWallet();

  if (address) return null;

  return (
    <div className="card stack stack--tight">
      <h2>Connect a wallet to begin</h2>
      <p className="small muted m-0">
        Signing happens entirely in your wallet. This app never sees a
        secret key, and there is no server here that could store one.
      </p>
      <div>
        <button
          type="button"
          className="button--primary"
          onClick={() => void connect()}
          disabled={connecting}
        >
          {connecting ? "Connecting…" : "Connect wallet"}
        </button>
      </div>
    </div>
  );
}

export function PositionCount({ kind }: { kind: PositionKind }) {
  const positions = usePositions(kind);

  return <span className="pill">{positions.length} tracked</span>;
}

export function SubscriptionCount() {
  const subscriptions = usePositions("recurring");

  return (
    <>
      <strong>{subscriptions.length}</strong> subscription
      {subscriptions.length === 1 ? "" : "s"} tracked.
    </>
  );
}
