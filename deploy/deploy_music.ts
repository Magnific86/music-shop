import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  await deploy("MusicShop", {
    from: deployer,
    log: true,
  });
};

export default func;
func.tags = ["MusicShop"];
