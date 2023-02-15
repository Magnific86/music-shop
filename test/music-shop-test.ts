import { expect } from "./chai-setup";
import { ethers, deployments, getNamedAccounts } from "hardhat";
import { MusicShop } from "../typechain-types";
import { BigNumber } from "ethers";
const MusicShopAbi = require("../artifacts/contracts/MusicShop.sol/MusicShop.json");

declare let window: any;

describe("MusicShop", () => {
  let deployer: any;
  let user: string;
  let musicShop: MusicShop;
  let musicShopAsUser: MusicShop;
  // let deployContract: any;

  const addAlbum = async () => {
    const tx = await musicShop.addAlbum(
      "weferhtjree3242wdes",
      "Album Title",
      100,
      5
    );
    await tx.wait();
  };

  const addSecondAlbum = async () => {
    const tx = await musicShop.addAlbum(
      "af7s8f7sd7fgd8",
      "Second Album Title",
      200,
      10
    );
    await tx.wait();
  };

  const addAlbumAsUser = async () => {
    const tx = await musicShopAsUser.addAlbum(
      "fsff3244sgdvv",
      "User Title",
      100,
      5
    );
    await tx.wait();
  };

  beforeEach(async () => {
    await deployments.fixture(["MusicShop"]);

    ({ deployer, user } = await getNamedAccounts());

    musicShop = await ethers.getContract<MusicShop>("MusicShop", deployer);

    musicShopAsUser = await ethers.getContract<MusicShop>("MusicShop", user);
  });

  it("Sets correct owner", async () => {
    expect(await musicShop.owner()).to.eq(deployer);
  });

  describe("addAlbum()", () => {
    it("allow to owner add album", async () => {
      await addAlbum();
      const newAlbum = await musicShop.albums(0);

      expect(newAlbum.uuid).to.eq("weferhtjree3242wdes");
      expect(newAlbum.title).to.eq("Album Title");
      expect(newAlbum.price).to.eq(100);
      expect(newAlbum.quantity).to.eq(5);
      expect(newAlbum.index).to.eq(0);
      expect(await musicShop.currentIndex()).to.eq(1);
    });
    it("doesnt allow other address to add album", async () => {
      await expect(addAlbumAsUser()).to.be.revertedWith("Only owner!");
    });
    it("doesnt allows to buy, invalid sum", async () => {
      await addAlbum();
      await expect(musicShop.buy(0, 3, { value: 200 })).to.be.revertedWith(
        "Invalid price!"
      );
    });
  });

  describe("buy()", () => {
    it("allows to buy from owner", async () => {
      await addAlbum();
      const tx = await musicShop.buy(0, 2, { value: 200 });
      await tx.wait();

      const album = await musicShop.albums(0);
      const order = await musicShop.orders(0);

      const timestamp = (await ethers.provider.getBlock(<number>tx.blockNumber))
        .timestamp;

      expect(order.albumUuid).to.eq("weferhtjree3242wdes");
      expect(order.customer).to.eq(deployer);
      expect(order.orderedAt).to.eq(timestamp);
      expect(order.status).to.eq(0);
      expect(album.quantity).to.eq(3);

      await expect(tx)
        .to.emit(musicShop, "AlbumBought")
        .withArgs(order.albumUuid, order.albumUuid, deployer, timestamp, 2);

      await expect(tx).to.changeEtherBalance(musicShop, 200);
    });
    it("allows to buy from user", async () => {
      await addAlbum();
      const tx = await musicShopAsUser.buy(0, 3, { value: 300 });
      await tx.wait();

      const album = await musicShopAsUser.albums(0);
      const order = await musicShopAsUser.orders(0);

      const timestamp = (await ethers.provider.getBlock(<number>tx.blockNumber))
        .timestamp;

      expect(order.albumUuid).to.eq("weferhtjree3242wdes");
      expect(album.title).to.eq("Album Title");
      expect(order.customer).to.eq(user);
      expect(order.orderedAt).to.eq(timestamp);
      expect(order.status).to.eq(0);
      expect(album.quantity).to.eq(2);
      expect(order.quantity).to.eq(3);
      expect(await musicShop.currentOrderId()).to.eq(1);

      await expect(tx)
        .to.emit(musicShopAsUser, "AlbumBought")
        .withArgs(order.albumUuid, order.albumUuid, user, timestamp, 3);

      await expect(tx).to.changeEtherBalance(musicShop, 300);
    });
    it("doesnt allows to buy invalid price", async () => {
      await addAlbum();
      await expect(
        musicShopAsUser.buy(0, 2, { value: 150 })
      ).to.be.revertedWith("Invalid price!");
    });
    it("doesnt allow to buy more copies than is available", async () => {
      await addAlbum();
      await expect(
        musicShopAsUser.buy(0, 6, { value: 600 })
      ).to.be.revertedWith("Out of stock!");
    });
  });
  describe("allAlbums()", () => {
    it("show all albums", async () => {
      await addAlbum();
      await addSecondAlbum();
      const memoryAlbums = await musicShopAsUser.allAlbums();
      expect(memoryAlbums[0].title).to.eq("Album Title");
      expect(memoryAlbums[1].price).to.eq(200);
    });
  });
  describe("delivered()", () => {
    it("delivered order for deployer", async () => {
      await addAlbum();
      await musicShop.buy(0, 2, { value: 200 });
      const order = await musicShop.orders(0);
      expect(order.status).to.eq(0);
      expect(order.customer).to.eq(deployer);

      const tx = await musicShop.delivery(0);
      await tx.wait();

      const orderAfter = await musicShop.orders(0);

      expect(orderAfter.status).to.eq(1);

      const timestamp = (await ethers.provider.getBlock(<number>tx.blockNumber))
        .timestamp;

      await expect(tx)
        .to.emit(musicShop, "OrderDelivered")
        .withArgs(orderAfter.albumUuid, deployer, timestamp);
    });
    it("delivered order for user", async () => {
      await addAlbum();
      await musicShopAsUser.buy(0, 2, { value: 200 });
      const order = await musicShop.orders(0);
      expect(order.status).to.eq(0);
      expect(order.customer).to.eq(user);
      const tx = await musicShop.delivery(0);
      await tx.wait();

      const timestamp = (await ethers.provider.getBlock(<number>tx.blockNumber))
        .timestamp;

      const orderAfter = await musicShop.orders(0);
      expect(orderAfter.status).to.eq(1);
      await expect(tx)
        .to.emit(musicShopAsUser, "OrderDelivered")
        .withArgs(orderAfter.albumUuid, user, timestamp);
    });
  });
  describe("withdraw()", () => {
    it("allows to withdraw", async () => {
      const transact = await musicShop.fund({ value: 1000 });
      await transact.wait();
      const tx = await musicShop.withDraw(1000, deployer);
      await tx.wait();
      await expect(tx).to.changeEtherBalance(musicShop, -1000);
    });
    it("doesnt allows to withdraw", async () => {
      const transact = await musicShop.fund({ value: 1000 });
      await transact.wait();
      await expect(musicShopAsUser.withDraw(1000, user)).to.be.revertedWith(
        "Only owner!"
      );
    });
    it("doesnt allows to withdraw more than om contract", async () => {
      const transact = await musicShop.fund({ value: 1000 });
      await transact.wait();
      await expect(musicShop.withDraw(2000, deployer)).to.be.revertedWith(
        "Not enough funds!"
      );
    });
    it("doesnt allows to transfer by receive func, only buy an album", async () => {
      const deployContract = await musicShop.deployed();

      await deployContract.deployed();

      const [owner] = await ethers.getSigners();
      console.log(owner);

      // const contract = new ethers.Contract(
      //   deployContract.address,
      //   MusicShopAbi.abi,
      //   deployer
      // );

      // const transactionHash =

      await expect(
        owner.sendTransaction({
          to: deployContract.address,
          value: ethers.utils.parseEther("1.0"),
        })
      ).to.be.revertedWith("Pls, use buy func to choose album!");
      // await deployContract.connect(deployer).receive({ value: 1000 });
    });
  });
});
//  await contract.sendTransaction({
//           to: deployContract.address,
//           value: ethers.utils.parseEther("1.0"),
//         })
