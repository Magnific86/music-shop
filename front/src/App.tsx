import { ChangeEvent, FormEvent, useState } from "react";
import { BigNumber, ethers } from "ethers";

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

let musicShop: MusicShop;
let provider: any;
declare let window: any;

export const App = () => {
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
    const blockNumber = await provider.getBlockNumber();
    await getAlbums();
    musicShop.on("AlbumBought", async (args: any[]) => {
      const event = args[args.length - 1];
      if (event.blockNumber >= blockNumber) {
        console.log("ALbumBought event args", args);
        await getAlbums();
      }
    });
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

  const albumList =
    list &&
    list.map(({ index, uuid, title, price, quantity }) => {
      console.log(`price for ${title}`, price);
      console.log(`quantity for ${title}`, quantity);
      console.log(BigNumber.from(0));

      return (
        <div className="flex flex-col text-2xl mx-auto text-center" key={index}>
          <h1 className="text-4xl py-4">
            {title} #{index}
          </h1>
          <p>Price: {String(price)}</p>
          <p>Quantity: {String(quantity)}</p>
          {quantity !== BigNumber.from(0) && (
            <button
              onClick={(e) => handleBuyAlbum(e, Number(index), Number(price))}
              className="bg-slate-800 mx-auto text-teal-400 dark:text-slate-800 dark:bg-teal-400 px-4 py-2 text-2xl my-2 text-center rounded-full"
            >
              buy 1 copy
            </button>
          )}

          {quantity === BigNumber.from(0) && (
            <p className="text-center text-red-800">Out os stock...</p>
          )}
        </div>
      );
    });

  const getAlbums = async () => {
    const albums = await musicShop.allAlbums();
    setList([
      ...albums.map(({ index, uuid, title, price, quantity }) => {
        return {
          index: index.toString(),
          uuid,
          title,
          price,
          quantity,
        };
      }),
    ]);
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
      await getAlbums();
      setAlbum({
        uuid: "",
        title: "",
        price: 0,
        quantity: 0,
      });
    }
  };

  const handleBuyAlbum = async (
    e: FormEvent<HTMLButtonElement>,
    index: number,
    price: number
  ) => {
    e.preventDefault();
    try {
      const tx = await musicShop.buy(index, 1, { value: price });
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
      await getAlbums();
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

      <div className="flex gap-8 mx-auto justify-around container w-full">
        {state.isOwner && (
          <form
            className="flex flex-col border border-slate-800 dark:border-teal-400 rounded-xl p-6"
            onSubmit={handleSubmit}
          >
            {fields.map((el, index) => (
              <div className="flex flex-col">
                <label className="text-3xl text-center">{el}</label>
                <input
                  type="text"
                  className="bg-transparent outline-none border-b border-purple-800 text-2xl py-4 px-2"
                  name={el}
                  onChange={handleChange}
                  // value={albumList.find(al => {
                  //   if(al.toString() === el) {
                  //     return al
                  //   }
                  // })}
                />
              </div>
            ))}
            <button className="bg-slate-800 my-6 text-teal-400 dark:text-slate-800 dark:bg-teal-400 px-6 py-3 text-3xl text-center rounded-full">
              add
            </button>
          </form>
        )}
        <ul className="flex flex-wrap gap-8 self-start">
          {albumList && albumList}
        </ul>
      </div>
    </>
  );
};
