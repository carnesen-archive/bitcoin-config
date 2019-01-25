import { isAbsolute, join } from 'path';
import { ChainName } from './names';
import { ChainSelectionConfig } from './types';
import { DEFAULT_DATADIR } from './constants';

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

export function setActiveChainName(config: ChainSelectionConfig, chainName: ChainName) {
  config.regtest = false;
  config.testnet = false;
  switch (chainName) {
    case 'test':
      config.testnet = true;
      break;
    case 'regtest':
      config.regtest = true;
      break;
  }
}

export function checkIsAbsolute(filePath: string) {
  if (!isAbsolute(filePath)) {
    throw new Error(`File path "${filePath}" is not absolute`);
  }
}

export function toAbsolute(filePath: string, datadir?: string, chainName?: ChainName) {
  if (isAbsolute(filePath)) {
    return filePath;
  }
  if (datadir && !isAbsolute(datadir)) {
    throw new Error(`Data directory argument "${datadir}" is not an absolute path`);
  }
  const paths = [datadir || DEFAULT_DATADIR];
  switch (chainName) {
    case 'regtest':
      paths.push('regtest');
      break;
    case 'test':
      paths.push('testnet3');
  }
  return join(...paths, filePath);
}
