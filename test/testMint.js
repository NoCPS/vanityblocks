const { expect } = require("chai");
const { ethers, network} = require("hardhat");
const hre = require("hardhat");
var math = require('mathjs');
const {BigNumber} = require("ethers");


/*
 * check that value is spent to the miner                               <--- feature reducted
 * check if we get a stackoverflow with big data buffer                 <--- checked in #5
 * test minting 1000 tokens                                             <--- checked in #5
 * test if the gas burn works                                           <--- checked in most of the tests

    uint256 public numTokens = 0;                                       <--- checked in #2

    mapping(uint256 => uint) public BlockNumber;                        <--- checked in #2
    mapping(uint256 => uint32) public OneOfInBlock;                     <--- checked in #2 and #3
    mapping(uint256 => string) public blockName;                        <--- checked in #2
    mapping(uint256 => bool) public tokenURIFinal;                      <--- checked in #2 and #3
    mapping(uint256 => bytes) public blockData;                         <--- checked in #2

    mapping(uint256 => uint256) public mintGasPrice;                    <--- checked in #2
    mapping(uint256 => uint256) public targetGasSpend;                  <--- checked in #2

    mapping(uint256 => uint256) public wastedStorage;                   <--- no need to check

    mint(uint _targetBlockNumber,                                       <--- checked in #1
            uint32 _numTokensToMint,                                    <--- checked in #2
            address _targetMintAddress,                                 <--- checked in #3
            string[] calldata _blockName,                               <--- checked in #2
            string calldata _uri,                                       <--- checked in #2
            bytes calldata _blockData,                                  <--- checked in #2
            uint256 _txnGasLimit)                                       <--- checked in #4

    ApproxMintCost(uint256 tokenId);                                    <--- checked in #2

 */

let gasUsed = async function(txn) {
    const tr = await txn.wait();
    return tr.gasUsed.toNumber();
}

describe("mint()", function () {
    it("checking all types of mints", async function () {

        const vanityBlocksF = await hre.ethers.getContractFactory("VanityBlocksV1");
        let vanityBlocks = await vanityBlocksF.deploy("T", "T2");

        const GAS_PRICE_TO_TEST = 1000 * 10 ** 9;
        const TX_GAS_LIMIT = 30 * 10 ** 6;
        const ACCEPTABLE_GAS_SPEND_MARGIN = 21000;

        await vanityBlocks.deployed();
        console.log("VB deployed to:", vanityBlocks.address);

        let address0 = hre.ethers.utils.getAddress( "0x0000000000000000000000000000000000000000" );

        console.log("------ #1 trying to mint for wrong blocknumber and wrong gas limit expecting exception -----");
        let gotException = false;
        try {
            await vanityBlocks.mint(await hre.ethers.provider.getBlockNumber(),
                2, address0, ["vanityBlock1", "vanityBlock2"], "t2uri1", true, [12, 12, 34], TX_GAS_LIMIT,
                {gasLimit: TX_GAS_LIMIT});
        } catch (e) {
            gotException = true;
        }
        expect(gotException).to.equal(true);

        console.log("testing gas limit assert in the contract");
        gotException = false;
        try {
            await vanityBlocks.mint(await hre.ethers.provider.getBlockNumber() + 1,
                2, address0, ["vanityBlock1", "vanityBlock2"], "t2uri1", true, [12, 12, 34], TX_GAS_LIMIT - 1,
                {gasLimit: TX_GAS_LIMIT});
        } catch (e) {
            gotException = true;
        }
        expect(gotException).to.equal(true);

        console.log("------------ #2 testing _numTokensToMint param                             -----------------");
        console.log("Minting 2 tokens");
        console.log("!!!!!!!!!!$$$$$$!!!!!!!!!!! Manually check that all the gas was spent [TODO]");

        let tx = await vanityBlocks.mint(await hre.ethers.provider.getBlockNumber() + 1,
            2, address0, ["vanityBlock1", "vanityBlock2"], "uri1", true, '0x0c0c22', TX_GAS_LIMIT,
            {gasPrice: GAS_PRICE_TO_TEST, gasLimit: TX_GAS_LIMIT});

        console.log("Checking gas spend was alright");
        expect(TX_GAS_LIMIT - await gasUsed(tx)).to.lessThan(ACCEPTABLE_GAS_SPEND_MARGIN);

        console.log("checking ApproxMintCost()");
        expect(await vanityBlocks.ApproxMintCost(0)).to.equal(
            BigNumber.from(GAS_PRICE_TO_TEST).mul(TX_GAS_LIMIT).div(2));

        console.log("checking mintGasPrice");
        expect(await vanityBlocks.mintGasPrice(0)).to.equal(GAS_PRICE_TO_TEST);
        expect(await vanityBlocks.mintGasPrice(1)).to.equal(GAS_PRICE_TO_TEST);

        console.log("checking targetGasSpend");
        expect((await vanityBlocks.targetGasSpend(0)).toNumber()).to.equal(TX_GAS_LIMIT / 2);
        expect((await vanityBlocks.targetGasSpend(1)).toNumber()).to.equal(TX_GAS_LIMIT / 2);

        console.log("checking OneOfInBlock");
        expect(await vanityBlocks.OneOfInBlock(0)).to.equal(2);
        expect(await vanityBlocks.OneOfInBlock(1)).to.equal(2);

        console.log("Checking uris");
        expect(await vanityBlocks.tokenURI(0)).to.equal("uri1");
        expect(await vanityBlocks.tokenURI(1)).to.equal("uri1");

        console.log("Checking uri final");
        expect(await vanityBlocks.tokenURIFinal(0)).to.equal(true);
        expect(await vanityBlocks.tokenURIFinal(1)).to.equal(true);

        console.log("Checking blockname");
        expect(await vanityBlocks.blockName(0)).to.equal("vanityBlock1");
        expect(await vanityBlocks.blockName(1)).to.equal("vanityBlock2");

        console.log("Checking numTokens() is 2");
        expect(await vanityBlocks.numTokens()).to.equal(2);

        console.log("Checking blockData");
        expect(await vanityBlocks.blockData(0)).to.equal('0x0c0c22');
        expect(await vanityBlocks.blockData(1)).to.equal('0x0c0c22');

        console.log("checking owner of block");
        expect(await vanityBlocks.ownerOf(0)).to.equal(vanityBlocks.signer.address);
        expect(await vanityBlocks.ownerOf(1)).to.equal(vanityBlocks.signer.address);

        console.log("checking blockMintedAt");
        expect(await vanityBlocks.BlockNumber(0)).to.equal(await hre.ethers.provider.getBlockNumber());
        expect(await vanityBlocks.BlockNumber(1)).to.equal(await hre.ethers.provider.getBlockNumber());

        console.log("minting 1 token a second time");

        //let preMinerBalance = await hre.ethers.provider.getBalance((await hre.ethers.provider.getBlock(await hre.ethers.provider.getBlockNumber()))['miner']);

        tx = await vanityBlocks.mint(await hre.ethers.provider.getBlockNumber() + 1,
            1, address0, ["vanityBlock2"], "t2uri1", true, '0x0c0c33', TX_GAS_LIMIT, {gasLimit: TX_GAS_LIMIT, gasPrice: GAS_PRICE_TO_TEST});

        console.log("Checking gas spend was alright");
        expect(TX_GAS_LIMIT - await gasUsed(tx)).to.lessThan(ACCEPTABLE_GAS_SPEND_MARGIN);

        console.log("checking mintGasPrice");
        expect(await vanityBlocks.mintGasPrice(2)).to.equal(GAS_PRICE_TO_TEST);

        console.log("checking ApproxMintCost()");
        expect(await vanityBlocks.ApproxMintCost(2)).to.equal(BigNumber.from(GAS_PRICE_TO_TEST).mul(TX_GAS_LIMIT));


        //let postMinerBalance = await hre.ethers.provider.getBalance((await hre.ethers.provider.getBlock(await hre.ethers.provider.getBlockNumber()))['miner']);

        //let deltaWithoutBlockRewards = postMinerBalance.sub(preMinerBalance).sub(hre.ethers.BigNumber.from(2).mul(hre.ethers.BigNumber.from(10).pow(18)));

        //expect(deltaWithoutBlockRewards).to.equal(1000);

        console.log("checking OneOfInBlock")
        expect(await vanityBlocks.OneOfInBlock(2)).to.equal(1);

        console.log("checking targetGasSpend");
        expect((await vanityBlocks.targetGasSpend(2)).toNumber()).to.equal(TX_GAS_LIMIT);

        console.log("Checking uris")
        expect(await vanityBlocks.tokenURI(2)).to.equal("t2uri1");

        console.log("Checking blockname");
        expect(await vanityBlocks.blockName(2)).to.equal("vanityBlock2");

        console.log("Checking blockData");
        expect(await vanityBlocks.blockData(2)).to.equal('0x0c0c33');

        console.log("checking numTokens() is legit");
        expect(await vanityBlocks.numTokens()).to.equal(3);

        console.log("checking owner of the new token");
        expect(await vanityBlocks.ownerOf(2)).to.equal(vanityBlocks.signer.address);

        console.log("Checking BlockNumber")
        expect(await vanityBlocks.BlockNumber(2)).to.equal(await hre.ethers.provider.getBlockNumber());

        console.log("----------- #3 testing _targetMintAddress param                           -----------------")

        let address1 = hre.ethers.utils.getAddress( "0x1100000000000000000000000000000000000000" );
        console.log("minting to different address and checking if they got it");
        tx = await vanityBlocks.mint(await hre.ethers.provider.getBlockNumber() + 1,
            3, address1, ["vanityBlock1", "vanityBlock2", "vanityBlock3"], "t2uri1", false, [12, 12, 34],
            TX_GAS_LIMIT, {gasLimit: TX_GAS_LIMIT});

        console.log("Checking gas spend was alright");
        expect(TX_GAS_LIMIT - await gasUsed(tx)).to.lessThan(ACCEPTABLE_GAS_SPEND_MARGIN);

        expect(await vanityBlocks.ownerOf(3)).to.equal(address1);
        expect(await vanityBlocks.ownerOf(4)).to.equal(address1);
        expect(await vanityBlocks.ownerOf(5)).to.equal(address1);

        console.log("Checking uri final");
        expect(await vanityBlocks.tokenURIFinal(3)).to.equal(false);
        expect(await vanityBlocks.tokenURIFinal(4)).to.equal(false);
        expect(await vanityBlocks.tokenURIFinal(5)).to.equal(false);

        console.log("checking OneOfInBlock")
        expect(await vanityBlocks.OneOfInBlock(3)).to.equal(3);
        expect(await vanityBlocks.OneOfInBlock(4)).to.equal(3);
        expect(await vanityBlocks.OneOfInBlock(5)).to.equal(3);

        console.log("----------- #4 testing   _txnGasLimit                                       -----------------")

        console.log("Trying to mint with wrong gas limit, expecting exception")

        gotException = false;
        try
        {
            await vanityBlocks.mint(await hre.ethers.provider.getBlockNumber() + 1,
            1, address0, ["vanityBlock1"], "t2uri1", false, '0xee', TX_GAS_LIMIT - 1, {gasLimit: TX_GAS_LIMIT});
        } catch (e) {
            gotException = true;
        }

        expect(gotException).to.equal(true);

        console.log("----------- #5 testing the limits of the contract and ownership               -----------------")

        console.log("minting to different checking and then checking if they got it");

        const numBlocksToMint = 160;
        console.log("Testing if its possible to mint " + numBlocksToMint + " tokens");

        let nameArray = [];
        for (let i = 0; i < numBlocksToMint; i++) {
            nameArray.push("vanityblocks");
        }

        tx = await vanityBlocks.mint(await hre.ethers.provider.getBlockNumber() + 1,
            numBlocksToMint, address0, nameArray, "t2uri1", false, [12, 12, 34], TX_GAS_LIMIT, {gasLimit: TX_GAS_LIMIT});

        console.log("Checking gas spend was alright");
        expect(TX_GAS_LIMIT - await gasUsed(tx)).to.lessThan(ACCEPTABLE_GAS_SPEND_MARGIN);

        console.log("Testing the limits of the extra data buffer");
        let bigarray = [100];
        for (let i = 0; i < 19903; i++) {
            bigarray.push(100);
        }

        tx = await vanityBlocks.mint(await hre.ethers.provider.getBlockNumber() + 1,
            1, address0, ["vanityBlock1"], "t2uri1", false, bigarray, TX_GAS_LIMIT, {gasLimit: TX_GAS_LIMIT});

        console.log("Checking gas spend was alright");
        expect(TX_GAS_LIMIT - await gasUsed(tx)).to.lessThan(ACCEPTABLE_GAS_SPEND_MARGIN);

        const signers = await hre.ethers.getSigners();

        console.log("Assigning ownership to second signer")
        await vanityBlocks.transferOwnership(signers[1].address);

        console.log("Trying to mint from second signer")
        vanityBlocks = vanityBlocks.connect(signers[1]);

        tx = await vanityBlocks.mint(await hre.ethers.provider.getBlockNumber() + 1,
            1, address0, ["vanityBlock1"], "t2uri1", false, bigarray, TX_GAS_LIMIT, {gasLimit: TX_GAS_LIMIT});

        console.log("Checking gas spend was alright");
        expect(TX_GAS_LIMIT - await gasUsed(tx)).to.lessThan(ACCEPTABLE_GAS_SPEND_MARGIN);

        console.log("Renouncing ownership of the contract, so no contract can mint no more");
        await vanityBlocks.renounceOwnership();

        console.log("Now trying to mint, expecting exception")
        gotException = false;
        try {
            await vanityBlocks.mint(await hre.ethers.provider.getBlockNumber() + 1,
                1, address0, ["vanityBlock1"], "t2uri1", false, [12, 12, 34], TX_GAS_LIMIT, {gasLimit: TX_GAS_LIMIT});
        } catch (e) {
            gotException = true;
        }
        expect(gotException).to.equal(true);

        console.log("Reconnecting the first signer");
        vanityBlocks = vanityBlocks.connect(signers[0]);

        console.log("Checking if you can still transfer tho");
        await vanityBlocks.transferFrom(vanityBlocks.signer.address, address1, 0);
        expect(await vanityBlocks.ownerOf(0)).to.equal(address1);

    });
});
