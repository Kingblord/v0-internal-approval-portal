export type Network = 'bsc' | 'erc';

export interface NetworkConfig {
  name: string;
  chainId: number;
  rpc: string;
  fee: string;
  icon: string;
  iconImage: string;
}

export const NETWORKS: Record<Network, NetworkConfig> = {
  bsc: {
    name: 'Binance Smart Chain',
    chainId: 56,
    // BSC RPC — set NEXT_PUBLIC_BSC_RPC in env, fallback to public dataseed
    rpc: process.env.NEXT_PUBLIC_BSC_RPC || 'https://bsc-dataseed1.binance.org',
    fee: 'No network fee',
    icon: '🟡',
    iconImage: '/bsc-icon.png',
  },
  erc: {
    name: 'Ethereum',
    chainId: 1,
    // ETH RPC — set NEXT_PUBLIC_RPC_URL in env, fallback to publicnode
    rpc: process.env.NEXT_PUBLIC_RPC_URL || 'https://ethereum.publicnode.com',
    fee: '0.01 ETH fee',
    icon: '🔵',
    iconImage: '/eth-icon.png',
  },
};

export function getNetworkConfig(network: Network): NetworkConfig {
  return NETWORKS[network];
}

export function switchNetwork(network: Network): Promise<void> {
  const config = NETWORKS[network];

  if (typeof window !== 'undefined' && window.ethereum) {
    return window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${config.chainId.toString(16)}` }],
    });
  }

  return Promise.reject(new Error('Wallet not connected'));
}
