import { FC } from "react";

interface WaitingForTransactionMessageProps {
  txHash: string;
}

export const WaitingForTransactionMessage: FC<
  WaitingForTransactionMessageProps
> = ({ txHash }) => {
  return (
    <div>
      Waiting for transaction: <strong>{txHash}</strong>
    </div>
  );
};
