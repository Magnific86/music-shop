import { FormEvent, useEffect, useRef, useState } from "react";
import { ethers } from "ethers";

declare let window: any;

export const Utils = () => {
  const [balance, setBalance] = useState(0);
  const [addr, setAddr] = useState("");
  const [error, setError] = useState("");
  const addrRef = useRef<HTMLInputElement>(null);
  const moneyRef = useRef<HTMLInputElement>(null);

  const handleConnect = async () => {
    if (typeof window !== undefined && typeof window.ethereum !== undefined) {
      console.log("exist mm");

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
    } else {
      setError("Pls, install MetaMask!");
    }
  };

  useEffect(() => {
    (async () => {
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      const signer = provider.getSigner();
      setAddr(await signer.getAddress());
      setBalance(Number(await signer.getBalance()));
    })();
  });

  const handleSearchSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const address = addrRef.current?.value;
    const money = moneyRef.current?.value;
    console.table({ address, money });

    try {
      const provider = new ethers.providers.Web3Provider(window?.ethereum);
      const signer = provider.getSigner();
      console.log(signer);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="container mx-auto w-full">
      <h1 className="text-center text-7xl text-red-500">{error}</h1>
      {addr && <h1>Address: {addr}</h1>}
      {balance && (
        <h1 className="text-5xl text-center py-10">
          {" "}
          Balance: {balance / 1e18}
        </h1>
      )}
      <button onClick={handleConnect}>connect</button>
      <form
        className="flex flex-col container mx-auto border border-purple-800 w-1/2"
        onSubmit={handleSearchSubmit}
      >
        <label className="text-5xl mt-6 text-center" htmlFor="address">
          Address
        </label>
        <input
          ref={addrRef}
          type="text"
          id="address"
          name="address"
          className="bg-transparent border-b border-purple-800 text-3xl py-5 px-2 outline-none"
        />
        <label className="text-5xl mt-6 text-center" htmlFor="money">
          Money
        </label>
        <input
          ref={moneyRef}
          type=""
          id="money"
          name="money"
          className="bg-transparent border-b border-purple-800 text-3xl py-5 px-2 outline-none"
        />
        <button
          className="text-5xl my-6 text-center bg-slate-800
         text-teal-400 dark:bg-teal-400 dark:text-slate-800 rounded-full w-1/2 px-6 py-3 mx-auto"
        >
          Scan
        </button>
      </form>
    </div>
  );
};
