import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';

// Full bytecode with 0x prefix
const EXECUTOR_BYTECODE = "0x608060405234801561000f575f80fd5b50335f806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555061001f565b610c948061002d5f395ff3fe608060405234801561000f575f80fd5b5060043610610091575f3560e01c80638da5cb5b116100645780638da5cb5b14610113578063945cfa3514610131578063affed0e01461014d578063c7f758a81461016b578063c85803041461017557610091565b80630c53c51c146100955780633644e515146100c55780635a64ad99146100e35780637ecebe00146100ff575b5f80fd5b6100af60048036038101906100aa9190610627565b61017f565b6040516100bc91906106b2565b60405180910390f35b6100cd610472565b6040516100da9190610703565b60405180910390f35b6100fd60048036038101906100f89190610746565b6104df565b005b61011960048036038101906101149190610746565b6106b1565b604051610126919061081f565b60405180910390f35b6101436106c6565b604051610150919061081f565b60405180910390f35b6101556106ea565b604051610162919061081f565b60405180910390f35b61017361070e565b005b61017d6108d6565b005b5f8073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff16036101e6576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016101dd906108a4565b60405180910390fd5b5f8573ffffffffffffffffffffffffffffffffffffffff1663dd62ed3e87306040518363ffffffff1660e01b81526004016102229291906108c3565b602060405180830381865afa15801561023d573d5f803e3d5ffd5b505050506040513d601f19601f8201168201806040525081019061026191906108fe565b9050848110156102765780610270575f5b5f81111561046957600160015f8973ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f828254019250508190555042841015610306576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016102fd90610975565b60405180910390fd5b5f61030f610472565b90505f604051806080016040528089815260200188815260200187815260200186815250905073ffffffffffffffffffffffffffffffffffffffff8916610359886109c2565b73ffffffffffffffffffffffffffffffffffffffff16146103af576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016103a6906109db565b60405180910390fd5b8673ffffffffffffffffffffffffffffffffffffffff166323b872dd89305f8b6040518563ffffffff1660e01b81526004016103ee9493929190610a0a565b6020604051808303815f875af115801561040a573d5f803e3d5ffd5b505050506040513d601f19601f8201168201806040525081019061042e9190610a69565b50600160025f8a73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f82825401925050819055505b5050949350505050565b5f7f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f6040518060400160405280600f81526020017f4d6574614172624578656375746f7200000000000000000000000000000000008152506040518060400160405280600181526020017f3100000000000000000000000000000000000000000000000000000000000000815250463060405160200161051795949392919061... <truncated>

const EXECUTOR_ABI = [
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

// Store contract address in a JSON file (universal storage)
const CONTRACT_STORAGE_PATH = path.join(process.cwd(), 'data', 'contract-address.json');

function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function saveContractAddress(address: string) {
  ensureDataDirectory();
  const data = {
    address,
    updatedAt: new Date().toISOString()
  };
  fs.writeFileSync(CONTRACT_STORAGE_PATH, JSON.stringify(data, null, 2));
}

export async function POST(request: NextRequest) {
  try {
    const relayerKey = process.env.RELAYER_PRIVATE_KEY;
    const rpcUrl = process.env.BSC_RPC_URL;

    if (!relayerKey || !rpcUrl) {
      return NextResponse.json(
        { error: 'Missing environment variables. Please configure RELAYER_PRIVATE_KEY and BSC_RPC_URL.' },
        { status: 500 }
      );
    }

    // Create provider and wallet
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(relayerKey, provider);

    // Create contract factory
    const factory = new ethers.ContractFactory(EXECUTOR_ABI, EXECUTOR_BYTECODE, wallet);

    // Deploy contract
    console.log('[v0] Deploying contract...');
    const contract = await factory.deploy();
    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();
    console.log('[v0] Contract deployed at:', contractAddress);

    // Save the contract address universally
    saveContractAddress(contractAddress);

    // Get transaction details
    const deployTx = contract.deploymentTransaction();
    
    return NextResponse.json({
      success: true,
      contractAddress,
      txHash: deployTx?.hash,
      deployer: wallet.address,
      message: 'Contract deployed successfully and address updated universally'
    });

  } catch (error: any) {
    console.error('[v0] Deployment error:', error);
    return NextResponse.json(
      { error: error.message || 'Contract deployment failed' },
      { status: 500 }
    );
  }
}
