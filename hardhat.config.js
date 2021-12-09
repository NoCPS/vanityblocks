require("@nomiclabs/hardhat-waffle");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  networks: {
    hardhat: {
      accounts: [{privateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff22",
                  balance: "10000000000000000000000"},
                  {privateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f21111",
                  balance: "10000000000000000000000"}]
    },
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/f5fbbc46013e4a88b248c5a55c353d52",
      accounts: ["0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff22"]
    },
    mainnet: {
      url: "https://mainnet.infura.io/v3/f5fbbc46013e4a88b248c5a55c353d52",
      accounts: ["0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff22"]
    },
    frame: {
      url: "http://127.0.0.1:1248"
    }
  }
};
