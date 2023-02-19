import { FC } from "react";
import { DismissButton } from "./buttons/DismissButton";
import { MessageAndDismissProps } from "../types/propTypes";

export const TransactionErrorMessage: FC<MessageAndDismissProps> = ({
  message,
  dismiss,
}) => {
  return (
    <div className="bg-red-500">
      TX error: {message}
      <DismissButton dismiss={dismiss} />
    </div>
  );
};
