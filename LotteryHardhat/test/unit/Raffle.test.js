const { network, getNamedAccounts, deployments, ethers } = require('hardhat')
const { developmentChains, networkConfig } = require('../../helper-hardhat-config')
const assert = require('assert')
const { expect } = require('chai')
const { time } = require('@nomicfoundation/hardhat-network-helpers')

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Unit Tests", () => {
        let raffle, vrfCoordinatorV2Mock, deployer, raffleEntranceFee, interval, player
        const chainId = network.config.chainId

        beforeEach(async ()=>{
            const accounts = await getNamedAccounts()
            deployer = accounts.deployer
            player = accounts.player

            await deployments.fixture(["all"])

            const raffleDeployment = await deployments.get("Raffle")
            raffle = await ethers.getContractAt("Raffle", raffleDeployment.address)

            const vrfMockDeployment =  await deployments.get("VRFCoordinatorV2_5Mock")
            vrfCoordinatorV2Mock = await ethers.getContractAt("VRFCoordinatorV2_5Mock", vrfMockDeployment.address)

            raffleEntranceFee = await raffle.getEntranceFee()
            interval = await raffle.getInterval()
        })

        describe("constructor", () => {
            it("Initializes the raffle correctly", async ()=> {
                const raffleState = (await raffle.getRaffleState())
                assert.equal(raffleState.toString(), "0")
                assert.equal(interval.toString(), networkConfig[chainId]["interval"])
            })
        })

        describe("enterRaffle", () => {
            it("reverts when you don't pay enough", async()=>{
                await expect(raffle.enterRaffle()).to.be.rejectedWith("Raffle__NotEnoughETHEntered")
            })
            it("records player when entered", async ()=> {
                await raffle.enterRaffle({value: raffleEntranceFee})
                const playerFromContract = await raffle.getPlayer(0)
                assert.equal(playerFromContract, deployer)
            })
            it("emits an event", async ()=> {
                await expect(raffle.enterRaffle({value: raffleEntranceFee})).to.emit(raffle, "RaffleEnter")
            })
            /* it("doesn't allow entrance when raffle is calculating", async ()=>{
                await raffle.enterRaffle({ value: raffleEntranceFee })
        
                await network.provider.send("evm_increaseTime", [Number(interval) + 1])
                await network.provider.request({method:"evm_mine", params:[]})
                
                // We pretend to be a Chainlink Keeper
                await raffle.performUpkeep("0x")
                await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.be.reverted
            }) */
            it("doesn't allow entrance when raffle is calculating", async ()=>{
                await raffle.enterRaffle({ value: raffleEntranceFee })
                
                await time.increase(Number(interval)+1)
                
                await raffle.performUpkeep("0x")
                await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.be.rejectedWith("Raffle__NotOpen")
            })
        })

        describe("checkUpkeep", () => {
            it("returns false if people haven't sent any ETH", async () => {
                await network.provider.send("evm_increaseTime", [Number(interval) + 1])
                await network.provider.request({ method: "evm_mine", params: [] })
                const { upkeepNeeded } = await raffle.checkUpkeep.staticCall("0x")
                assert(!upkeepNeeded)
            })
            it("returns false if raffle isn't open", async () => {
                await raffle.enterRaffle({ value: raffleEntranceFee })
                await network.provider.send("evm_increaseTime", [Number(interval) + 1])
                await network.provider.request({ method: "evm_mine", params: [] })
                await raffle.performUpkeep("0x") // changes the state to calculating
                const raffleState = await raffle.getRaffleState() // stores the new state
                const { upkeepNeeded } = await raffle.checkUpkeep.staticCall("0x")
                assert.equal(raffleState.toString() == "1", upkeepNeeded == false)
            })
            it("returns false if enough time hasn't passed", async () => {
                await raffle.enterRaffle({ value: raffleEntranceFee })
                await network.provider.send("evm_increaseTime", [Number(interval) - 5])
                await network.provider.request({ method: "evm_mine", params: [] })
                const { upkeepNeeded } = await raffle.checkUpkeep.staticCall("0x")
                assert(!upkeepNeeded)
            })
            it("returns true if enough time has passed, has players, eth and is open", async () => {
                await raffle.enterRaffle({ value: raffleEntranceFee })
                await network.provider.send("evm_increaseTime", [Number(interval) + 1])
                await network.provider.request({ method: "evm_mine", params: [] })
                const { upkeepNeeded } = await raffle.checkUpkeep.staticCall("0x")
                assert(upkeepNeeded)
            })
        })

        describe("performUpkeep", () => {
            it("can only run if checkupkeep is true", async () => {
                await raffle.enterRaffle({ value: raffleEntranceFee })
                await network.provider.send("evm_increaseTime", [Number(interval) + 1])
                await network.provider.request({ method: "evm_mine", params: [] })
                const tx = await raffle.performUpkeep("0x") 
                assert(tx)
            })
            it("reverts if checkUpKeep is false", async () => {
                try {
                    await raffle.performUpkeep("0x");
                    assert.fail("Expected performUpkeep to revert");
                } catch (error) {
                    assert(error.message.includes("Raffle__UpkeepNotNeeded"), `Expected revert reason ${error.message}`);
                }
            })
            it("updates the raffle state and emits a requestId", async () => {
                await raffle.enterRaffle({ value: raffleEntranceFee })
                await network.provider.send("evm_increaseTime", [Number(interval) + 1])
                await network.provider.send("evm_mine", [])
                const txResponse = await raffle.performUpkeep("0x") // emits requestId
                const txReceipt = await txResponse.wait(1)
                const raffleState = await raffle.getRaffleState()
                const requestId = txReceipt.logs[1].args.requestId
                assert(Number(requestId) > 0)
                assert(raffleState == 1)
            })
        })

        describe("fulfillRandomWords", () => {
            beforeEach(async () => {
                await raffle.enterRaffle({ value: raffleEntranceFee })
                await network.provider.send("evm_increaseTime", [Number(interval) + 1])
                await network.provider.request({ method: "evm_mine", params: [] })
            })
            it("can only be called after performupkeep", async () => {
                try {
                    await vrfCoordinatorV2Mock.fulfillRandomWords(0, raffle.target)
                    assert.fail("Expected fulfillRandomWords to revert");
                } catch (error) {
                    assert(error.message.includes("InvalidRequest"), `Expected revert reason ${error.message}`);
                }
                try {
                    await vrfCoordinatorV2Mock.fulfillRandomWords(1, raffle.target)
                    assert.fail("Expected fulfillRandomWords to revert");
                } catch (error) {
                    assert(error.message.includes("InvalidRequest"), `Expected revert reason ${error.message}`);
                }
            })

          // This test simulates users entering the raffle and wraps the entire functionality of the raffle
          // inside a promise that will resolve if everything is successful.
          // An event listener for the WinnerPicked is set up
          // Mocks of chainlink keepers and vrf coordinator are used to kickoff this winnerPicked event
          // All the assertions are done once the WinnerPicked event is fired
            it("picks a winner, resets and sends money", async () => {
                const accounts = await ethers.getSigners()
                const additionalEntrances = 3
                const startingIndex = 2
                let startingBalance
                for (let i = startingIndex; i < startingIndex + additionalEntrances; i++) {
                    const raffleConnectedContract = await raffle.connect(accounts[i])
                    await raffleConnectedContract.enterRaffle({ value: raffleEntranceFee })
                }
                const startingTimeStamp = await raffle.getLastTimeStamp()
                
                await new Promise(async (resolve, reject) => {
                    raffle.once("WinnerPicked", async () => {
                        console.log("WinnerPicked event fired!")
                        // assert throws an error if it fails, so we need to wrap
                        // it in a try/catch so that the promise returns event
                        // if it fails.
                        try {
                            const recentWinner = await raffle.getRecentWinner()
                            const raffleState = await raffle.getRaffleState()
                            const winnerBalance = await ethers.provider.getBalance(accounts[2])
                            const endingTimeStamp = await raffle.getLastTimeStamp()
                    
                            await expect(raffle.getPlayer(0)).to.be.reverted
                            assert.equal(recentWinner.toString(), accounts[2].address)
                            assert.equal(raffleState.toString(), "0")
                            assert.equal(
                                winnerBalance.toString(), 
                                (startingBalance + (raffleEntranceFee * BigInt(additionalEntrances)) + raffleEntranceFee).toString()
                            )
                            assert(endingTimeStamp > startingTimeStamp)
                            resolve()
                        } catch (e) { 
                            reject(e)
                        }
                    })

                    // kicking off the event by mocking the chainlink keepers and vrf coordinator
                    try {
                      const tx = await raffle.performUpkeep("0x")
                      const txReceipt = await tx.wait(1)
                      startingBalance = await ethers.provider.getBalance(accounts[2])
                      await vrfCoordinatorV2Mock.fulfillRandomWords(
                          txReceipt.logs[1].args.requestId,
                          raffle.target
                      )
                    } catch (e) {
                        reject(e)
                    }
                })
            })
        })
    })