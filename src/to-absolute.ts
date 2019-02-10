import { isAbsolute, join } from 'path';
import { ChainName } from './names';
import { DEFAULT_DATADIR } from './constants';

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
