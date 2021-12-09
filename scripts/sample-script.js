// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const {network} = require("hardhat");
var math = require('mathjs');


async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy

    let address0 = hre.ethers.utils.getAddress( "0x0000000000000000000000000000000000000000" );

    console.log("starting deploy script");

    const Greeter = await hre.ethers.getContractFactory("VanityBlocksV1");


    //const greeter = await Greeter.deploy("Test", "T");
    //await greeter.deployed();


    const greeter = await Greeter.attach("0x4eFf75E0C0f8A8FB1E3d28417ad0fbbE250eE85f");


    const latestBlockNumber = await hre.ethers.provider.getBlockNumber();
    console.log(latestBlockNumber);


    //let tx = await greeter.setTokenUris([1], ['ipfs://Qmdur93RKuN6DUZm6dqMx4e1YeBX1rVqYLupH3hLLxnDZL'], {gasLimit: 100000});
    //console.log(await tx.wait());
    //return;


    let tx = await greeter.mint(latestBlockNumber + 1,
        2, address0, ["b1", "b2"], "https://ipfs.io/ipfs/Qmdur93RKuN6DUZm6dqMx4e1YeBX1rVqYLupH3hLLxnDZL", false,
        '0x6D736720626567696E3A20746869732069732061207465737420666F7220612075746638206D6573736167652E2E2E2E', 30*10**6,
        {gasLimit: 1 * 10 ** 6});

    console.log(await tx.wait());

    return;
    console.log(await hre.ethers.provider.getBlock(latestBlockNumber));
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
