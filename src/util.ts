import { isAbsolute, join } from 'path';
import { getDefaultDatadir } from './default';
import { BITCOIN_CONFIG_OPTIONS, NotAllowedIn } from './options';
import { SectionName } from './names';
import { BitcoinConfig } from './config';

export function getActiveSectionName(
  config: Pick<BitcoinConfig, 'regtest' | 'testnet'>,
): SectionName {
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

export function toAbsolute(
  filePath: string,
  config: Pick<BitcoinConfig, 'regtest' | 'testnet' | 'datadir'> = {},
) {
  const sectionName = getActiveSectionName(config);
  const { datadir } = config;
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

export function findOption(maybeOptionName: string, sectionName?: SectionName) {
  if (maybeOptionName.length === 0) {
    throw new Error('Empty option name');
  }
  if (maybeOptionName.startsWith('-')) {
    throw new Error('Options in a configuration file must not have a leading "-"');
  }
  const alphanumericOrHyphenRegExp = /[^\w\-]/gi;
  if (maybeOptionName.replace(alphanumericOrHyphenRegExp, '') !== maybeOptionName) {
    throw new Error(`Invalid option name "${maybeOptionName}"`);
  }
  const found = Object.entries(BITCOIN_CONFIG_OPTIONS).find(
    ([optionName]) => optionName === maybeOptionName,
  );
  if (!found) {
    throw new Error(`Unknown option "${maybeOptionName}"`);
  }
  const [, option] = found;
  if (
    sectionName &&
    option.notAllowedIn &&
    (option.notAllowedIn as NotAllowedIn)[sectionName]
  ) {
    throw new Error(
      `Option "${maybeOptionName}" is not allowed in section "${sectionName}"`,
    );
  }
  return option;
}
