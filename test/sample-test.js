const { expect } = require("chai");
const { assert } = require("chai");
const { ethers } = require("hardhat");

describe("Prime ERC20 Interactions", function () {

  let alice;
  let bob_PUSD_Owner;
  let vaultContract;
  let pusdContract;
  let primeContract;

  
  
  before(async function(){
    [alice, bob_PUSD_Owner] = await ethers.getSigners();
    const Prime = await ethers.getContractFactory("Prime", alice);
    primeContract = await Prime.deploy(1000);
    await primeContract.deployed();

    const PUSD = await ethers.getContractFactory("PUSD", bob_PUSD_Owner);
    pusdContract = await PUSD.deploy(1000);
    await pusdContract.deployed();

    const Vault = await ethers.getContractFactory("Vault", alice);
    vaultContract = await Vault.deploy(primeContract.address, pusdContract.address);
    await vaultContract.deployed();
  })


  it("Should test that owner recieves 1000 Prime tokens", async function () { 
    const alice_address = alice.address;
    alice_balance = await primeContract.balanceOf(alice_address)
    expect(alice_balance.toString()).to.equal("1000");
  });

  it("Should test that owner recieves 1000 PUSD tokens", async function () {
    const bob_PUSD_Owner_address = bob_PUSD_Owner.address;
    bob_balance = await pusdContract.balanceOf(bob_PUSD_Owner_address);
    expect(bob_balance.toString()).to.equal("1000");
  });

  it("should test that the Vault interest function works", async function(){  

    await primeContract.connect(alice).approve(vaultContract.address, 100);
    await vaultContract.connect(alice).deposit(100);
    const old_balance_alice = await vaultContract.connect(alice).balances(alice.address);
    console.log(old_balance_alice);
    await ethers.provider.send("evm_increaseTime", [24*60*60*365]);
    await ethers.provider.send("evm_mine");

    const new_balance_alice = await vaultContract.connect(alice).checkBalance();
    console.log(new_balance_alice);
    const diff = new_balance_alice.sub(old_balance_alice);

    assert(diff.gt(0));
  })

  
});
