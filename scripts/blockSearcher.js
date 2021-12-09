// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const {network} = require("hardhat");
const math = require('mathjs');
const fs = require('fs');
import { ethers } from 'ethers';


async function main() {

    const data = fs.readFileSync('scripts/1tx_blocks.csv').toString().split('\n');

    const provider = new ethers.providers.JsonRpcBatchProvider('https://mainnet.infura.io/v3/f5fbbc46013e4a88b248c5a55c353d52')

    for (let i = 0; i < 100000; i++) {
        console.log(data[i]);


        let b = await provider.getBlockWithTransactions(parseInt(data[i]));
        let tr = await provider.getTransactionReceipt(b.transactions[0].hash);


        if (tr.logs.length > 0)
            console.log(tr);

    }
    return;
    // Hardhat always runs the compile task when running scripts with its command
    // line interface.
    //
    // If this script is run directly using `node` you may want to call compile
    // manually to make sure everything is compiled
    // await hre.run('compile');

    // We get the contract to deploy

    console.log("starting deploy script");

    const Greeter = await hre.ethers.getContractFactory("logTester");
    /*
    const greeter = await Greeter.deploy({gasPrice: 3 * 10 ** 9, gasLimit: 168157});

    await greeter.deployed();
    */
    const greeter = await Greeter.attach("0x154d83E31037BaFeA4459127928003A05B3a14D2");

    const latestBlockNumber = await hre.ethers.provider.getBlockNumber();

    console.log(latestBlockNumber);

    console.log();
    console.log(await hre.ethers.provider.getTransactionReceipt("0x0db79bd3c4ad4056cbe8d77d4ba38669741d0c78aff02d3329cabb813336cd92"));
    return;

    let gl = (await hre.ethers.provider.getBlock(latestBlockNumber)).gasLimit;

    console.log(gl);

    let t = await greeter.check({gasLimit: math.floor(gl - gl / 1024), gasPrice: 3 * 10 ** 10});

    console.log(t);

    let tr = await t.wait();
    console.log(tr);
    console.log(tr.events[0].args);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
