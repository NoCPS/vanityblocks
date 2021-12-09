// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

//todo: find artist
    //todo: design website
    //todo: build website

//todo: create a github
//todo: get a code review

//todo: write code to figure out mempool best price to bid
//todo: figure out how to integrate with flashbots

//todo: check prev blocks events

//todo: figure out how to get the minted by who with the domain right

//todo: figure out how to have the art also apear under the artist's work
//todo: check if there are any api endpoints that read of off the eth chain -> seems like there are none, but maybe
//          the contract can call some chainlink api that creates an IPFS file or arw?

//note: figure out how to send type 2 txns -> test on rinkeby and see if it's type
//note: figure out who needs to depoly the contract and if you can depoly a hardhat txn from ledger ->
//          need to setup a temp account -> mint -> set owner to the ledger account, next mint set the owner to temp..

//todo: test that all expected exceptions part are the right exceptions before deployment

contract VanityBlocksV1 is Ownable, ERC721URIStorage {

    uint64 private constant GAS_TO_LEAVE = 21 * 1000;

    uint256 public numTokens = 0;

    //note: some of these do not meet the naming convention, in order to appear the same as in the json descriptor
    //for a specific token
    mapping(uint256 => uint256) public BlockNumber;     // mint blocknumber (tokenId)
    mapping(uint256 => uint32) public OneOfInBlock;
    mapping(uint256 => string) public blockName;        // the name
    mapping(uint256 => bool) public tokenURIFinal;
    mapping(uint256 => bytes) public blockData;

    mapping(uint256 => uint256) public mintGasPrice;
    mapping(uint256 => uint256) public targetGasSpend;

    mapping(uint256 => uint256) public wastedStorage;

    constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol)  {
    }

    //return value is in ETH
    function ApproxMintCost(uint256 tokenId) public view returns (uint256) {
        return mintGasPrice[tokenId] * targetGasSpend[tokenId];
    }

    function mint(uint _targetBlockNumber,
        uint32 _numTokensToMint,
        address _targetMintAddress,
        string[] calldata _blockNames,
        string calldata _uri,
        bool _isUriFinal,
        bytes calldata _blockData,
        uint256 _txnGasLimit)
    public onlyOwner {

        require(block.number == _targetBlockNumber, "WRONG_BLOCK_NUMBER");
        require(block.gaslimit == _txnGasLimit, "TXN_AND_BLOCK_GAS_LIMIT_MISMATCH");

        for (uint32 i = 0; i < _numTokensToMint; i++) {
            uint256 newTokenId = numTokens;

            BlockNumber[newTokenId] = block.number;
            OneOfInBlock[newTokenId] = _numTokensToMint;
            blockName[newTokenId] = _blockNames[i];
            blockData[newTokenId] = _blockData;
            tokenURIFinal[newTokenId] = _isUriFinal;
            mintGasPrice[newTokenId] = tx.gasprice;
            //note: division rounds to zero
            targetGasSpend[newTokenId] = _txnGasLimit / _numTokensToMint;

            if (address(0) == _targetMintAddress) {
                _mint(msg.sender, newTokenId);
            } else {
                _mint(_targetMintAddress, newTokenId);
            }

            _setTokenURI(newTokenId, _uri);

            numTokens += 1;
        }

        uint256 sum = 0;
        while(gasleft() >= GAS_TO_LEAVE) {
            wastedStorage[uint256(blockhash(block.number - 1)) + sum] = sum;
            sum += 1;
        }

    }

    function setTokenUris(
        uint256[] calldata _tokenIds,
        string[] calldata _uris) public {

        for (uint256 i = 0; i < _tokenIds.length; i++) {
            require(msg.sender == ownerOf(_tokenIds[i]), "ONLY_OWNER_CAN_SET_URI");
            require(!tokenURIFinal[_tokenIds[i]], "TOKEN_URI_FINALLY_SET");
            _setTokenURI(_tokenIds[i], _uris[i]);
            tokenURIFinal[_tokenIds[i]] = true;
        }
    }
}