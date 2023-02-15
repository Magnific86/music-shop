import { FC } from "react";
import { DismissButton } from "./buttons/DismissButton";
import { NetworkErrorMessage } from "./NetworkErrorMessage";
import { ConnectWalletProps } from "../types/propTypes";

export const ConnectWallet: FC<ConnectWalletProps> = ({
  connectWallet,
  networkError,
  dismiss,
}) => {
  return (
    <>
      <div>
        {networkError && (
          <NetworkErrorMessage message={networkError} dismiss={dismiss} />
        )}
      </div>
      <p>Please, connect your wallet...</p>
      <DismissButton text="Connect Wallet" dismiss={connectWallet} />
    </>
  );
};
