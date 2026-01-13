# Zenroth

## Overview
Zenroth is a read-only inspection repository that validates Base Mainnet visibility, RPC responsiveness, and explorer reachability. It focuses on safe diagnostics and repeatable outputs that can be pasted into issues, reports, or review notes.

Built for Base.

## What this repository is for
Zenroth exists to provide a simple, side-effect-free way to confirm that:
- your RPC endpoint responds and matches the expected chain
- block and fee signals are readable and consistent
- wallet addresses (when available) can be inspected without signing
- contract presence can be validated using bytecode existence checks
- explorer links are easy to generate for reviewers

## What Zenroth does
- performs a lightweight JSON-RPC health check (eth_chainId)
- initializes Coinbase Wallet SDK for optional wallet address discovery
- reads ETH balances for discovered addresses (if running in a browser)
- reads latest block number and timestamp
- reads gas price and prints a quick value in gwei
- checks getBytecode for a small list of target addresses
- prints Basescan links for addresses, blocks, and code pages

## What Zenroth never does
- it does not send transactions
- it does not sign messages
- it does not write onchain state

## Internal flow
1) Load Base Mainnet constants (RPC and explorer root)  
2) Run an RPC chainId check to confirm endpoint liveness  
3) Initialize Coinbase Wallet SDK provider  
4) Create viem clients for public reads and wallet discovery  
5) Load targets from samples/targets.json  
6) Read balances if wallet addresses are available  
7) Read latest block and gas data  
8) Check bytecode for targets and print code links  

## Base mainnet details
- Network: Base Mainnet  
- chainId (decimal): 8453  
- Explorer: https://basescan.org  

## Repository structure
- README.md  
- app/Zenroth.mjs  
- package.json  
- contracts/ZenrothConfigAnchor.sol
- contracts/ZenrothProbe.sol
- config/base-mainnet.json  
- samples/targets.json  
- reports/latest.json  

## License
BSD 2-Clause License

## testnet deployment (base sepolia)
the following deployments are used only as validation references.

network: base sepolia  
chainId (decimal): 84532  
explorer: https://sepolia.basescan.org  

contract ZenrothProbe.sol address:  
0x2F8C1A7D4E0B6A3C9D5E7F1A4B8D2C6E0A3F5B7C 

deployment and verification:
- https://sepolia.basescan.org/address/0x2F8C1A7D4E0B6A3C9D5E7F1A4B8D2C6E0A3F5B7C
- https://sepolia.basescan.org/0x2F8C1A7D4E0B6A3C9D5E7F1A4B8D2C6E0A3F5B7C/0#code  

contract ZenrothConfigAnchor.sol address:  
0x9B1D6E8C4A2F5B7C0D3E9A1F8C2B6D4E0A7C3F5B 

deployment and verification:
- https://sepolia.basescan.org/address/0x9B1D6E8C4A2F5B7C0D3E9A1F8C2B6D4E0A7C3F5B
- https://sepolia.basescan.org/0x9B1D6E8C4A2F5B7C0D3E9A1F8C2B6D4E0A7C3F5B/0#code
  
these deployments provide a controlled environment for validating base tooling and read-only onchain access prior to base mainnet usage.

## Author

- GitHub: https://github.com/softies-cologne
  
- X: https://x.com/Alethia37457538
  
- Email: softies.cologne-0f@icloud.com 
