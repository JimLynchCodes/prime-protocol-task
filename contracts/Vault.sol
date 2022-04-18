pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./Prime.sol";
import "./PUSD.sol";

contract Vault {

    Prime primeInterface;
    PUSD pusdInterface;
    mapping(address => uint) public balances;
    mapping(address => uint) public depositTime;

    constructor(address _addressPrime, address _addressPusd){
        primeInterface = Prime(_addressPrime);
        pusdInterface = PUSD(_addressPusd);
    }

    function deposit(uint amount) public {
        primeInterface.allowance(msg.sender, address(this));
        primeInterface.transferFrom(msg.sender, address(this), amount);
        balances[msg.sender] += amount;
        depositTime[msg.sender] = block.timestamp;
    }

    function interestCalc(address _address) public view returns(uint) {
        uint diff = block.timestamp - depositTime[_address];
        uint principal = balances[msg.sender];
        uint secsPerYear = 60 *60 *24 *365;
        uint interest = (principal * 1 * diff)/1e2 ;
        uint interestDue = interest / secsPerYear;
        return interestDue;
    }

    function checkBalance() public view returns(uint) {
        return balances[msg.sender] + interestCalc(msg.sender);
    }
    
    // function withdraw(uint amount) public {
    //     uint new_balance = checkBalance();
    //     depositTime[msg.sender] = block.timestamp;
    //     balances[msg.sender] = new_balance;
    //     balances[msg.sender] -= amount;
        
    //     pusdInterface.approve(address(this), amount);
    //     pusdInterface.transferFrom(from, to, amount);

    // }



    
    
}