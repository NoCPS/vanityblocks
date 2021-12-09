const { expect } = require("chai");
const { ethers, network} = require("hardhat");
const hre = require("hardhat");

describe("log test()", function () {
    it("checking all types of mints", async function () {

        await network.provider.send("evm_setAutomine", [true]);


        const logTesterF = await hre.ethers.getContractFactory("logTester");
        const logTester = await logTesterF.deploy();


        let t = await logTester.check({gasLimit: 30 * 10 ** 6});
        console.log((await t.wait()).events[0].args);
    });
});
