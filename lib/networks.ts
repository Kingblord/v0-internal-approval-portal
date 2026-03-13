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
  erc: {
    name: 'Ethereum',
    chainId: 1,
    rpc: 'https://eth-mainnet.alchemyapi.io/v2/demo',
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
