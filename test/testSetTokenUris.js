const { expect } = require("chai");
const { ethers } = require("hardhat");
const hre = require("hardhat");
const {getSigners} = require("@nomiclabs/hardhat-ethers/internal/helpers");

/*

    mapping(uint256 => bool) public tokenURIFinal;

    function setTokenUris(
            uint256[] calldata _tokenIds,
            string[] calldata _uris)

 */


describe("setTokenUri()", function () {
    it("checking all setTokenUris use cases", async function () {

        const TX_GAS_LIMIT = 30 * 10 ** 6;

        const vanityBlocksF = await hre.ethers.getContractFactory("VanityBlocksV1");
        const vanityBlocks = await vanityBlocksF.deploy("T", "T2");

        await vanityBlocks.deployed();
        console.log("VB deployed to:", vanityBlocks.address);

        let address0 = hre.ethers.utils.getAddress( "0x0000000000000000000000000000000000000000" );

        console.log("----------- #1 testing setTokenUri param                                      -----------------")
        console.log("Minting 2 tokens")
        await vanityBlocks.mint(await hre.ethers.provider.getBlockNumber() + 1,
            4, address0, ["vanityBlock1", "vanityBlock1", "vanityBlock1", "vanityBlock1"], "0", false, [12, 12, 34]
            , TX_GAS_LIMIT);

        console.log("Settings 2 uris and checking that tokenURI() returns it, and that tokenURIFinal is set")
        await vanityBlocks.setTokenUris([0, 1], ["blabla", "blublu"]);
        expect(await vanityBlocks.tokenURI(0)).to.equal("blabla");
        expect(await vanityBlocks.tokenURI(1)).to.equal("blublu");

        expect(await vanityBlocks.tokenURIFinal(0)).to.equal(true);
        expect(await vanityBlocks.tokenURIFinal(1)).to.equal(true);
        expect(await vanityBlocks.tokenURIFinal(2)).to.equal(false);
        expect(await vanityBlocks.tokenURIFinal(3)).to.equal(false);


        console.log("Trying to set uris the second time, expecting exception");

        let gotException = false;
        try {
            await vanityBlocks.setTokenUris([0], ["blabla"]);
        } catch (e) {
            gotException = true;
        }
        expect(gotException).to.equal(true);

        console.log("----------- #2  Minting to a different owner, trying to set uri should work -----------------")

        let signers = await getSigners(hre);
        await vanityBlocks.mint(await hre.ethers.provider.getBlockNumber() + 1,
            2, signers[1].address, ["vanityBlock1", "vanityBlock1"], "4", false, [12, 12, 34], TX_GAS_LIMIT);

        let vanityBlocksNewSigner = vanityBlocks.connect(signers[1]);
        await vanityBlocksNewSigner.setTokenUris([4], ["lala"]);
        expect(await vanityBlocks.tokenURI(4)).to.equal("lala");

        console.log("Trying to set tokenURI by original minter that's not the token owner, expecting exception");
        gotException = false;
        try {
            await vanityBlocks.setTokenUris([5], ["blabla"]);
        } catch (e) {
            gotException = true;
        }
        expect(gotException).to.equal(true);

        console.log("----------- #3  trying to set for tokenURI that has been set in mint          -----------------")

        await vanityBlocks.mint(await hre.ethers.provider.getBlockNumber() + 1,
            2, address0, ["vanityBlock1", "vanityBlock1"], "4", true, [12, 12, 34], TX_GAS_LIMIT);

        gotException = false;
        try {
            await vanityBlocks.setTokenUris([6], ["blabla"]);
        } catch (e) {
            gotException = true;
        }
        expect(gotException).to.equal(true);
    });
});
