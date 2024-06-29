const { network, ethers } = require('hardhat')
const { developmentChains } = require('../helper-hardhat-config')

const BASE_FEE = ethers.parseEther("1")
const GAS_PRICE = 1000000000
const WEI_PER_UNIT_LINK = 3889810000000000
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    if(developmentChains.includes(network.name)){
        log("Local network detected! Deploying mocks...")
        await deploy("VRFCoordinatorV2_5Mock", {
            from: deployer,
            args: [BASE_FEE, GAS_PRICE, WEI_PER_UNIT_LINK],
            log: true
        })
        log("Mock deployed")
        log("------------------------------")
    } else {
        log("Not deploying mocks as network is not local")
    }
}

module.exports.tags = ["all", "mocks"]