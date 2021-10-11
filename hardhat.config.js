require("@nomiclabs/hardhat-waffle");
require('dotenv').config()

const { ALCHEMY_API_URL, PRIVATE_KEY } = process.env

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

module.exports = {
  solidity: "0.8.4",
  networks: {
    rinkeby: {
      url: ALCHEMY_API_URL,
      accounts: [PRIVATE_KEY]
    }
  },
  paths: {
    artifacts: "./client/src/artifacts"
  },
};
