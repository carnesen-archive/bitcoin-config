import { ChainName } from './names';
import { ChainSelectionConfig } from './types';

export function getChainName(config: ChainSelectionConfig): ChainName {
  const { regtest, testnet } = config;
  if (regtest && testnet) {
    throw new Error('regtest and testnet cannot both be set to true');
  }
  if (regtest) {
    return 'regtest';
  }
  if (testnet) {
    return 'test';
  }
  return 'main';
}
