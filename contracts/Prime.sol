pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Prime is ERC20 {

    constructor(uint initialSupply) ERC20("PRIME", "PR") {
        _mint(msg.sender, initialSupply);
    }
}