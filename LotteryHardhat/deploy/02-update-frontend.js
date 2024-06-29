const { deployments, network, ethers } = require("hardhat")
const fs = require('fs')
const path = require('path')

const FRONTEND_ADDRESSES_FILE = path.resolve(__dirname, "../../lotteryfrontend/constants/contractAddresses.json")
const FRONTEND_ABI_FILE = path.resolve(__dirname, "../../lotteryfrontend/constants/abi.json")

module.exports = async () => {
    if(process.env.UPDATE_FRONTEND) {
        console.log("Updating front end...")
        await updateContractAddresses()
        await updateContractAbi()
    }
}

updateContractAddresses =  async () => {
    const raffleDeployment = await deployments.get("Raffle")
    const raffle = await ethers.getContractAt("Raffle", raffleDeployment.address)
    const chainId = network.config.chainId.toString()
    let currentAddresses
    try {
        const data = fs.readFileSync(FRONTEND_ADDRESSES_FILE, "utf-8");
        currentAddresses = data ? JSON.parse(data) : {};
    } catch (error) {
        console.error("Error reading or parsing contract addresses file:", error);
        currentAddresses = {};
    }
    if(chainId in currentAddresses){
        if(!currentAddresses[chainId].includes(raffle.target)){
            currentAddresses[chainId].push(raffle.target)
        }
    } else {
        currentAddresses[chainId] = [raffle.target]
    }
    fs.writeFileSync(FRONTEND_ADDRESSES_FILE, JSON.stringify(currentAddresses, null, 2))
}

updateContractAbi = async () => {
    const raffleDeployment = await deployments.get("Raffle")
    const abi = raffleDeployment.abi

    fs.writeFileSync(FRONTEND_ABI_FILE, JSON.stringify(abi, null, 2))
}

module.exports.tags = ["all", "frontend"]