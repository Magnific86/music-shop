import { BigNumber } from "ethers";

export interface IState {
  selectedAccount: string;
  txBeingSent: string;
  networkError: string;
  transactionError: string;
  balance: string;
  isOwner: boolean;
}

export interface IAlbum {
  uuid: string;
  title: string;
  price: number;
  quantity: number;
}

export interface IAlbumLoad {
  index: string;
  uuid: string;
  title: string;
  price: BigNumber;
  quantity: BigNumber | undefined;
}

export interface IAlbumListInitial {
  list: IAlbumLoad[];
}
