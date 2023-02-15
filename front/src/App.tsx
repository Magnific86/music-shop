import { ChangeEvent, FormEvent, useState } from "react";
import { ethers } from "ethers";

import MusicShopArtifacts from "./contracts/MusicShop.json";
import type { MusicShop } from "./typechain";
import { MusicShop__factory } from "./typechain/factories";
import { ConnectWallet } from "./components/ConnectWallet";
import { WaitingForTransactionMessage } from "./components/WaitingForTransactionMessage";
import { TransactionErrorMessage } from "./components/TransactionErrorMessage";
import { Web3Provider } from "@ethersproject/providers";
import {
  IAlbum,
  IAlbumListInitial,
  IAlbumLoad,
  IState,
} from "./types/mainTypes";

const HARDHAT_NETWORK_ID = "31337";

declare let window: any;

export const App = () => {
  let provider: Web3Provider;
  let musicShop: MusicShop;
  const initialState: IState = {
    selectedAccount: null,
    txBeingSent: null,
    networkError: null,
    transactionError: null,
    balance: null,
    isOwner: null,
  };
  const [state, setState] = useState(initialState);
  const [album, setAlbum] =
    useState<IAlbum>(/* {
    uuid: "",
    title: "",
    price: 0,
    quantity: 0,
  } */);
  // const initialList: IAlbumListInitial = [];
  const [list, setList] = useState<IAlbumLoad[]>();

  const connectWallet = async () => {
    if (window.ethereum === undefined) {
      setState({ ...state, networkError: "Please, install Metamask!" });
      return;
    }
    const [selectedAccount] = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    if (!checkNetwork()) {
      return;
    }
    initialize(selectedAccount);
    window.ethereum.on(
      "accountsChanged",
      ([newAddress]: [newAddress: string]) => {
        if (!newAddress) {
          return resetState();
        }
        initialize(newAddress);
      }
    );
    window.ethereum.on("chainChanged", ([_networkId]: any) => {
      resetState();
    });
  };

  const initialize = async (selectedAccount: string) => {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    musicShop = MusicShop__factory.connect(
      MusicShopArtifacts.contracts.MusicShop.address,
      provider.getSigner(0)
    );

    const owner = await musicShop.owner();
    setState({
      ...state,
      selectedAccount: selectedAccount,
      balance: await updateBalance(selectedAccount),
      isOwner: owner.toUpperCase() === selectedAccount.toUpperCase(),
    });
    const albums = await getAlbums();
     setList(albums);
  };

  const resetState = () => {
    setState(initialState);
  };

  const checkNetwork = () => {
    if (window.ethereum.networkVersion === HARDHAT_NETWORK_ID) {
      return true;
    } else {
      setState({
        ...state,
        networkError: "Please, connect to Hardhat network!",
      });
      return false;
    }
  };

  const dismissNetworkError = () => {
    setState({
      ...state,
      networkError: null,
    });
  };

  const dismissTransationError = () => {
    setState({
      ...state,
      transactionError: null,
    });
  };

  const getRpcErrorMessage = (error) => {
    if (error.data) {
      return error.data.message;
    }
    return error.message;
  };

  const updateBalance = async (selectedAccount?: string | undefined) => {
    const numberBalance = await provider.getBalance(
      selectedAccount === undefined ? state.selectedAccount : selectedAccount
    );
    return numberBalance.toString();
  };

  const getAlbums = async () => {
    const albums = await musicShop.allAlbums();
    return albums.map(({ index, uuid, title, price, quantity }) => {
      return {
        index: index.toString(),
        uuid,
        title,
        price,
        quantity,
      };
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const tx = await musicShop.addAlbum(
        album.uuid,
        album.title,
        album.price,
        album.quantity
      );
      await tx.wait();
      setState({
        ...state,
        txBeingSent: tx.hash,
      });
    } catch (e) {
      console.error(e);
      setState({
        ...state,
        transactionError: e,
      });
    } finally {
      setState({
        ...state,
        txBeingSent: null,
        balance: await updateBalance(),
      });
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const name = e.target.name;
    setAlbum({ ...album, [name]: value });
  };

  const fields = ["uuid", "title", "price", "quantity"];

  if (!state.selectedAccount) {
    return (
      <ConnectWallet
        connectWallet={connectWallet}
        networkError={state.networkError}
        dismiss={dismissNetworkError}
      />
    );
  }

  return (
    <>
      {state.txBeingSent && (
        <WaitingForTransactionMessage txHash={state.txBeingSent} />
      )}
      {state.transactionError && (
        <TransactionErrorMessage
          message={getRpcErrorMessage(dismissTransationError)}
          dismiss={dismissTransationError}
        />
      )}
      {state.balance && (
        <p className="text-3xl">
          Your balance: {ethers.utils.formatEther(state.balance)} ETH
        </p>
      )}
      {state.isOwner && (
        <form
          className="flex flex-col border border-slate-800 dark:border-teal-400 rounded-xl p-6"
          onSubmit={handleSubmit}
        >
          {fields.map((el) => (
            <div className="flex flex-col">
              <label className="text-3xl text-center">{el}</label>
              <input
                type="text"
                className="bg-transparent outline-none border-b border-purple-800 text-2xl py-4 px-2"
                name={el}
                onChange={handleChange}
              />
            </div>
          ))}
        </form>
      )}
      {/* {getAlbums() && getAlbums()} */}
    </>
  );
};
