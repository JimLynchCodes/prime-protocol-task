const { expect } = require("chai");
const { assert } = require("chai");
const { ethers } = require("hardhat");

describe("Prime ERC20 Interactions", function () {

  let alice;
  let bob;
  let vaultContract;
  let pusdContract;
  let primeContract;



  before(async function () {
    [alice,    // PRIME owner
      bob,      // PUSD owner
      charlie,
      david
    ] = await ethers.getSigners();

    const Prime = await ethers.getContractFactory("Prime", alice);
    primeContract = await Prime.deploy(1000);
    await primeContract.deployed();

    const PUSD = await ethers.getContractFactory("PUSD", bob);
    pusdContract = await PUSD.deploy(1000);
    await pusdContract.deployed();

    const Vault = await ethers.getContractFactory("Vault", alice);
    vaultContract = await Vault.deploy(primeContract.address, pusdContract.address);
    await vaultContract.deployed();
  })


  it("Should test that owner recieves 1000 Prime tokens, others start with 0", async function () {
    const alice_address = alice.address;
    alice_balance = await primeContract.balanceOf(alice_address)
    expect(alice_balance.toString()).to.equal("1000");

    bob_balance = await primeContract.balanceOf(bob_address)
    expect(bob_balance.toString()).to.equal("0");

    charlie_balance = await primeContract.balanceOf(charlie_address)
    expect(charlie_balance.toString()).to.equal("0");

    david_balance = await primeContract.balanceOf(david_address)
    expect(david_balance.toString()).to.equal("0");
  });

  it("Should test that owner recieves 1000 PUSD tokens", async function () {
    const bob_address = bob.address;
    bob_balance = await pusdContract.balanceOf(bob_address);
    expect(bob_balance.toString()).to.equal("1000");
  });

  describe('check balances of deposits', () => {

    beforeEach(() => {

      // charlie (not the owner) starts with 100 PRIME
      pusdContract.transferFrom(alice.address, charlie.address, 100);

    }

    it('keeps track of deposited PRIME and earned PUSD interest', () => {

      const [charlie_prime_balance_before_deposit,
        charlie_pusd_balance_before_deposit] = await vaultContract.connect(charlie).balances(charlie.address);
      console.log(charlie_prime_balance);

      expect(charlie_prime_balance_before_deposit).to.equal(0)
      expect(charlie_pusd_balance_before_deposit).to.equal(0)

      await primeContract.connect(charlie).approve(vaultContract.address, 100);
      await vaultContract.connect(charlie).deposit(100);

      const [charlie_prime_balance_after_deposit,
        charlie_pusd_balance_after_deposit] = await vaultContract.connect(charlie).balances(charlie.address);
      console.log(charlie_prime_balance);

      expect(charlie_prime_balance_before_deposit).to.equal(100)
      expect(charlie_pusd_balance_before_deposit).to.equal(0)


      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60 * 365]);
      await ethers.provider.send("evm_mine");

      const [charlie_prime_balance_after_one_epoch,
        charlie_pusd_balance_after_one_epoch] = await vaultContract.connect(charlie).balances(charlie.address);
      console.log(charlie_prime_balance);

      expect(charlie_prime_balance_before_deposit).to.equal(100)
      expect(charlie_pusd_balance_before_deposit).to.equal(1)


      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60 * 365]);
      await ethers.provider.send("evm_mine");

      const [charlie_prime_balance_after_two_epoch,
        charlie_pusd_balance_after_two_epoch] = await vaultContract.connect(charlie).balances(charlie.address);
      console.log(charlie_prime_balance);

      expect(charlie_prime_balance_before_deposit).to.equal(100)
      expect(charlie_pusd_balance_before_deposit).to.equal(2)

    })

  })

  describe('users are able to withdraw prime & pusd', () => {

    beforeEach(() => {
      await primeContract.connect(charlie).approve(vaultContract.address, 100);
      await vaultContract.connect(charlie).deposit(100);
 
      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60 * 365]);
      await ethers.provider.send("evm_mine");
  
      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60 * 365]);
      await ethers.provider.send("evm_mine");
  
      expect(charlie_prime_balance_before_deposit).to.equal(100)
      expect(charlie_pusd_balance_before_deposit).to.equal(2)
    })

    it('withdraws correctly', () => {

      await vaultContract.connect(charlie).withdraw(100);
      
      const [charlie_prime_balance_after_prime_withdraw,
        charlie_pusd_balance_after_prime_withdraw] = await vaultContract.connect(charlie).balances(charlie.address);
      console.log(charlie_prime_balance);

      expect(charlie_prime_balance_before_deposit).to.equal(0)
      expect(charlie_pusd_balance_before_deposit).to.equal(2)

      await vaultContract.connect(charlie).claimInterest(100);

      const [charlie_prime_balance_after_interest_claimed,
        charlie_pusd_balance_after_interest_claimed] = await vaultContract.connect(charlie).balances(charlie.address);
      console.log(charlie_prime_balance);

      expect(charlie_prime_balance_before_deposit).to.equal(0)
      expect(charlie_pusd_balance_before_deposit).to.equal(0)

    })

  })

  it("should test that the Vault interest function works", async function () {

    await primeContract.connect(alice).approve(vaultContract.address, 100);
    await vaultContract.connect(alice).deposit(100);
    const old_balance_alice = await vaultContract.connect(alice).balances(alice.address);
    console.log(old_balance_alice);
    await ethers.provider.send("evm_increaseTime", [24 * 60 * 60 * 365]);
    await ethers.provider.send("evm_mine");

    const new_balance_alice = await vaultContract.connect(alice).checkBalance();
    console.log(new_balance_alice);
    const diff = new_balance_alice.sub(old_balance_alice);

    assert(diff.gt(0));
  })


});
