const { network, getNamedAccounts, deployments, ethers } = require('hardhat')
const { developmentChains } = require('../../helper-hardhat-config')
const assert = require('assert')
const { expect } = require('chai')

developmentChains.includes(network.name)
    ?   describe.skip
    :   describe("Raffle Staging Tests", () => {
            let raffle, raffleEntranceFee, deployer

            beforeEach(async () => {
                const accounts = await getNamedAccounts()
                deployer = accounts.deployer

                //await deployments.fixture(["all"])

                const raffleDeployment = await deployments.get("Raffle")
                raffle = await ethers.getContractAt("Raffle", raffleDeployment.address)

                raffleEntranceFee = await raffle.getEntranceFee()
            })

            describe("fullfillRandomWords", () => {
                it("works with live Chainlink keepers and Chainlink VRF, we get a random winner", async () => {
                    const startingTimeStamp = await raffle.getLastTimeStamp()
                    const accounts = await ethers.getSigners()
                    let winnerStartingBalance
                    
                    await new Promise(async (resolve, reject) => {
                        raffle.once("WinnerPicked", async () => {
                            console.log("WinnerPicked event fired!")
                            try {
                                const recentWinner = await raffle.getRecentWinner()
                                const raffleState = await raffle.getRaffleState()
                                const winnerEndingBalance = await ethers.provider.getBalance(accounts[0])
                                const endingTimeStamp = await raffle.getLastTimeStamp()

                                await expect(raffle.getPlayer(0)).to.be.reverted
                                assert.equal(recentWinner.toString(), accounts[0].address)
                                assert.equal(raffleState.toString(), "0")
                                assert.equal(
                                    (winnerEndingBalance).toString(), 
                                    (winnerStartingBalance + raffleEntranceFee).toString()
                                )
                                assert(endingTimeStamp > startingTimeStamp)

                                resolve()
                            } catch (error) {
                                console.log(error.message)
                                reject(e)
                            }
                        })

                        const tx = await raffle.enterRaffle({ value: raffleEntranceFee })
                        await tx.wait(1)

                        winnerStartingBalance = await ethers.provider.getBalance(accounts[0])
                    })
                })
            })
        })