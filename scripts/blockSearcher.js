// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const {network} = require("hardhat");
const math = require('mathjs');
const fs = require('fs');
const ethers = require('ethers');


async function main() {

    const data = fs.readFileSync('scripts/1tx_blocks.csv').toString().split('\n');

    const provider = new ethers.providers.JsonRpcBatchProvider('https://mainnet.infura.io/v3/f5fbbc46013e4a88b248c5a55c353d52')

    console.log(data.length);

    const queriesIn1Go = 300;

    for (let i = 1614; i < data.length / queriesIn1Go; i++) {
        console.log(i, data[i * queriesIn1Go]);

        let ps = [];

        for (let i2 = i * queriesIn1Go; i2 < (i + 1) * queriesIn1Go; i2++) {
            ps.push(provider.getBlockWithTransactions(parseInt(data[i2])));
        }

        let res = await Promise.all(ps);

        ps = [];

        for (let i2 = 0; i2 < queriesIn1Go; i2++) {
            ps.push(provider.getTransactionReceipt(res[i2].transactions[0].hash));
        }

        res = await Promise.all(ps);

        for (let i2 = 0; i2 < queriesIn1Go; i2++) {

            for (let i3 = 0; i3 < res[i2].logs.length; i3++) {
                if ((4 == res[i2].logs[i3].topics.length) &&
                ("0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef" == res[i2].logs[i3].topics[0])) {
                        console.log(res[i2].transactionHash);
                }
            }
        }
    }
    return;


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
