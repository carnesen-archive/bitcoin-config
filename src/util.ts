import { isAbsolute, join } from 'path';
import { getDefaultDatadir } from './default';
import { SectionName } from './names';
import { SectionSelectionConfig } from './config';

export function getActiveSectionName(config: SectionSelectionConfig): SectionName {
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

export function setActiveSectionName(
  config: SectionSelectionConfig,
  sectionName: SectionName,
) {
  config.regtest = false;
  config.testnet = false;
  switch (sectionName) {
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

export function toAbsolute(
  filePath: string,
  options: { datadir?: string; sectionName?: SectionName } = {},
) {
  const { datadir, sectionName } = options;
  if (isAbsolute(filePath)) {
    return filePath;
  }
  if (datadir && !isAbsolute(datadir)) {
    throw new Error('Path "datadir" must be absolute');
  }
  const paths = [datadir || getDefaultDatadir()];
  switch (sectionName) {
    case 'regtest':
      paths.push('regtest');
      break;
    case 'test':
      paths.push('testnet3');
  }
  return join(...paths, filePath);
}
