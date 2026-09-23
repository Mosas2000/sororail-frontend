import Link from "next/link";
import type { ReactNode } from "react";

import {
  ConnectWalletCard,
  PositionCount,
  SubscriptionCount,
} from "@/components/OverviewInteractive";
import { BATCH_PAYOUT_CONTRACT, explorerContract } from "@/lib/network";

export default function OverviewPage() {
  return (
    <div className="stack">
      <div>
        <h1>Overview</h1>
        <p className="muted page-intro">
          A reference application for the SoroRail payment contracts. Everything
          shown here is read from the chain.
        </p>
      </div>

      <ConnectWalletCard />

      <div className="grid">
        <Tile
          href="/payroll"
          title="Payroll"
          body="Pay many recipients in one transaction, or set up a recurring charge."
        />
        <Tile
          href="/streams"
          title="Streams"
          count={<PositionCount kind="stream" />}
          body="Continuous per-second transfer. Withdraw, top up, extend or cancel."
        />
        <Tile
          href="/vesting"
          title="Vesting"
          count={<PositionCount kind="vesting" />}
          body="Scheduled release with a cliff. Claim what has vested, or revoke."
        />
        <Tile
          href="/escrow"
          title="Escrow"
          count={<PositionCount kind="escrow" />}
          body="Funds held until a condition is met, with an optional arbiter."
        />
      </div>

      <div className="card stack stack--tight">
        <h2>How this app finds your positions</h2>
        <p className="small muted m-0">
          Each escrow, stream, grant and subscription is its own deployed
          contract, holding exactly one position for its whole life. There is no
          on-chain index tying them to your account, so this app keeps a list of
          addresses you have told it about, in this browser only.
        </p>
        <p className="small muted m-0">
          That list is a convenience, not a record. Every balance and state you
          see is read from the contract itself, and removing an address from the
          list changes nothing on chain.
        </p>
        <p className="small muted m-0">
          <SubscriptionCount />{" "}
          <code className="addr">batch_payout</code> is the exception — it is
          stateless, so one shared deployment serves everybody:{" "}
          <a
            href={explorerContract(BATCH_PAYOUT_CONTRACT)}
            target="_blank"
            rel="noreferrer"
            className="addr"
          >
            {BATCH_PAYOUT_CONTRACT.slice(0, 8)}…
          </a>
        </p>
      </div>

      <div className="notice notice--warn">
        <div className="notice__title">Not yet built</div>
        <div className="notice__detail">
          The indexer, unified history feed and CSV export described in the spec
          are not implemented. There is no database and no backend — this app is
          entirely client-side against Soroban RPC.
        </div>
      </div>
    </div>
  );
}

function Tile({
  href,
  title,
  count,
  body,
}: {
  href: string;
  title: string;
  count?: ReactNode;
  body: string;
}) {
  return (
    <Link href={href} className="card card--link">
      <div className="spread">
        <h2>{title}</h2>
        {count}
      </div>
      <p className="small muted mb-0">
        {body}
      </p>
    </Link>
  );
}
