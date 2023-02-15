import { HardhatUserConfig } from "hardhat/types";
import "hardhat-deploy";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "@typechain/hardhat";
import "solidity-coverage";

const config: HardhatUserConfig = {
  solidity: "0.8.13",
  namedAccounts: {
    deployer: 0,
    user: 1,
    skamer: 2,
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
  },
};

export default config;

//"@nomiclabs/hardhat-ethers": "^2.2.2",
