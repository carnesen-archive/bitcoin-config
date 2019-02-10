import { ChainName } from './names';
import { ChainSelectionConfig } from './types';

export function setChainName(config: ChainSelectionConfig, chainName: ChainName) {
  const nextConfig = { ...config };
  delete nextConfig.regtest;
  delete nextConfig.testnet;
  switch (chainName) {
    case 'test':
      nextConfig.testnet = true;
      break;
    case 'regtest':
      nextConfig.regtest = true;
      break;
  }
  return nextConfig;
}
