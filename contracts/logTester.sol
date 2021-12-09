// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

contract logTester {

    event gasLeft(uint256 gas);

    mapping(uint256 => uint256) public wastedStorage;

    constructor() {
    }

    function check() public {
        uint256 g = gasleft();
        wastedStorage[uint256(blockhash(block.number - 1))] = 1;
        emit gasLeft(g);
    }

}
