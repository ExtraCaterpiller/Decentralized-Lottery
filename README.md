# Decentralized Lottery Application

This repository contains the code for a decentralized lottery application built with Solidity, Hardhat, Chainlink VRF and a Next.js frontend. The application allows users to enter a raffle by paying a specified entrance fee. A winner is selected randomly at regular intervals using Chainlink VRF to ensure fairness.

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Smart Contract](#smart-contract)
- [Frontend](#frontend)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Introduction
The Decentralized Lottery Application is an automated raffle system where users can participate by paying an entry fee. The smart contract, written in Solidity, handles the logic for entering the raffle, selecting a random winner using Chainlink VRF and distributing the prize. The frontend, built with Next.js, provides an interface for users to interact with the raffle.

## Features
- Decentralized and transparent lottery system
- Fair winner selection using Chainlink VRF
- Automated processes with Chainlink Automation
- User-friendly interface built with Next.js
- Secure and efficient contract design

## Technologies Used
- **Solidity**: Smart contract programming language
- **Hardhat**: Ethereum development environment
- **Chainlink VRF**: Verifiable random function for fair randomness
- **Next.js**: React framework for building the frontend
- **Ethers.js**: Library for interacting with the Ethereum blockchain

## Smart Contract
The smart contract is located in the `contracts` directory. It is implemented using Solidity and Hardhat.

### Key Components
- **Raffle Contract**: The main contract that handles the raffle logic.
- **Chainlink VRF Integration**: Ensures fair and random winner selection.
- **Automation**: Utilizes Chainlink Automation for periodic winner selection.

## Frontend
The frontend is built using Next.js and is located in the frontend directory.

## Key Components
- Homepage: Allows users to enter the raffle, view current number of participant and last winner
- Winner Announcement: Displays the recent winner of the raffle.
- User Interaction: Provides a seamless interface for interacting with the smart contract.

## Installation
### Prerequisites
- Node.js
- npm or yarn
### Clone the Repository
```
git clone https://github.com/ExtraCaterpiller/Decentralized-Lottery
cd decentralized-lottery
```

### Install Dependencies
#### Smart Contract
```
cd LotteryHardhat
npm install
```
#### Frontend
open a new terminal and execute the following:
```
cd lotteryfrontend
npm install
```

## Usage
### Deploy Smart Contract
1. Configure your environment variables in .env.
2. Deploy the contract using Hardhat
```
npx hardhat deploy --network <your-network>
```

### Run the Frontend
1. start the Next.js development server:
```
npm run dev
```
2. Open your browser and navigate to http://localhost:3000

## Contributing
Contributions are welcome! Please fork the repository and create a pull request with your changes.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
