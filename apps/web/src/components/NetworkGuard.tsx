"use client";

import { rpc } from "@stellar/stellar-sdk";
import { useEffect, useState, type ReactNode } from "react";

import { NETWORK_PASSPHRASE, RPC_URL } from "@/lib/network";

export function NetworkGuard({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<"checking" | "ready" | "error">("checking");

  useEffect(() => {
    let mounted = true;
    void new rpc.Server(RPC_URL)
      .getNetwork()
      .then((network) => {
        if (!mounted) return;
        if (network.passphrase !== NETWORK_PASSPHRASE) {
          console.error("Configured RPC network does not match testnet.");
          setStatus("error");
          return;
        }
        setStatus("ready");
      })
      .catch((error: unknown) => {
        console.error("Unable to validate the configured RPC network.", error);
        if (mounted) setStatus("error");
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (status === "checking") return <p>Validating testnet connection…</p>;
  if (status === "error") {
    return (
      <p role="alert">
        This app is unavailable because the configured RPC endpoint is not the
        Stellar testnet. Check NEXT_PUBLIC_RPC_URL and try again.
      </p>
    );
  }
  return children;
}
