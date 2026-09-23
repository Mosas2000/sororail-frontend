import type { ReactNode } from "react";

import { explorerContract } from "@/lib/network";

/**
 * A contract address that links to the block explorer when the configured
 * network has one, and renders as plain text when it does not.
 */
export function ContractLink({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: ReactNode;
}) {
  const href = explorerContract(id);
  if (!href) return <span className={className}>{children}</span>;
  return (
    <a className={className} href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}
