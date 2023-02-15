import { FC } from "react";
import { DismissButton } from "./buttons/DismissButton";
import { MessageAndDismissProps } from "../types/propTypes";

export const TransactionErrorMessage: FC<MessageAndDismissProps> = ({
  message,
  dismiss,
}) => {
  return (
    <div>
      TX error: {message}
      <DismissButton dismiss={dismiss} />
    </div>
  );
};
