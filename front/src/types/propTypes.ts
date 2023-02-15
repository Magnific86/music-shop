import { MouseEventHandler, ReactNode } from "react";

export interface MessageAndDismissProps {
  message: string;
  dismiss: MouseEventHandler<HTMLButtonElement>;
}

export interface ConnectWalletProps {
  connectWallet: MouseEventHandler<HTMLButtonElement>;
  dismiss: MouseEventHandler<HTMLButtonElement>;
  networkError: string;
}

export interface DismissButtonProps {
  dismiss?: MouseEventHandler<HTMLButtonElement>;
  onClick?: () => void;
  text?: string;
}

export interface ChildrenProps {
  children: ReactNode;
}
