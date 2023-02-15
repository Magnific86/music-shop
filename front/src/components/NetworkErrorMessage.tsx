import { FC } from "react";
import { DismissButton } from "./buttons/DismissButton";
import { MessageAndDismissProps } from "../types/propTypes";

export const NetworkErrorMessage: FC<MessageAndDismissProps> = ({
  message,
  dismiss,
}) => {
  return (
    <div>
      {message}
      <DismissButton dismiss={dismiss} text="X" />
    </div>
  );
};
