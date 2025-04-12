"use client";

import { addRpcUrlOverrideToChain, PrivyProvider } from "@privy-io/react-auth";
import { rootstockTestnet } from "viem/chains";


export function Providers({ children }: { children: React.ReactNode }) {

  const rootstock_testnet = addRpcUrlOverrideToChain(rootstockTestnet, 'https://rootstock-testnet.g.alchemy.com/v2/LFPBwGlJy3ohBxtSfMNW7iPvnTXf4cgf');
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
      config={{
        embeddedWallets: {
          createOnLogin: "all-users",
        },
        appearance: {
          walletList: ["detected_wallets"],
        },
        defaultChain: rootstockTestnet,
        supportedChains: [rootstock_testnet]
      }}
    >
      {children}
    </PrivyProvider>
  );
}
