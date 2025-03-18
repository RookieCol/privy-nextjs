import { useEffect, useState } from "react";
import frameSdk from "@farcaster/frame-sdk";

import { usePrivy } from "@privy-io/react-auth";
import { useLoginToFrame } from "@privy-io/react-auth/farcaster";

import { FullScreenLoader } from "~/components/FullScreenLoader";
import FruitNinja from "~/components/FruitNinja"


export default function Demo() {
  const { ready, authenticated, user, createWallet } = usePrivy();

  console.log('user', user)

  const { initLoginToFrame, loginToFrame } = useLoginToFrame();

  // Loading states
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  // Initialize the frame SDK
  useEffect(() => {
    const load = async () => {
      frameSdk.actions.ready({});
    };
    if (frameSdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);

  // Login to Frame with Privy automatically
  useEffect(() => {
    if (ready && !authenticated) {
      const login = async () => {
        const { nonce } = await initLoginToFrame();
        const result = await frameSdk.actions.signIn({ nonce: nonce });
        await loginToFrame({
          message: result.message,
          signature: result.signature,
        });
      };
      login();
    }
  }, [ready, authenticated, initLoginToFrame, loginToFrame]);

  useEffect(() => {
    if (
      authenticated &&
      ready &&
      user &&
      user.linkedAccounts.filter(
        (account) =>
          account.type === "wallet" && account.walletClientType === "privy",
      ).length === 0
    ) {
      createWallet();
    }
  }, [authenticated, ready, user, createWallet]);

  if (!ready || !isSDKLoaded || !authenticated) {
    return <FullScreenLoader />;
  }

  return (
    <FruitNinja />
  );
}
