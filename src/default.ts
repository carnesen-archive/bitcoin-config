import { join } from 'path';
import { platform, homedir } from 'os';
import { Sections, BitcoinConfig, DefaultConfig } from './config';
import { BITCOIN_CONFIG_OPTIONS } from './options';
import {
  SECTION_NAMES,
  SectionName,
  SECTION_SELECTION_OPTION_NAMES,
  castToSectionName as checkSectionName,
} from './names';
import { setActiveSectionName } from './util';
import { mergeUpActiveSectionConfig } from './merge';

export function getDefaultDatadir(p = platform()) {
  switch (p) {
    case 'darwin':
      return join(homedir(), 'Library', 'Application Support', 'Bitcoin');
    case 'win32':
      return join(process.env.APPDATA!, 'Bitcoin');
    default:
      return join(homedir(), '.bitcoin');
  }
}

export const DEFAULT_CONFIG_FILE_PATH = join(getDefaultDatadir(), 'bitcoin.conf');

type OptionName = keyof typeof BITCOIN_CONFIG_OPTIONS;

export function getDefaultConfig<T extends SectionName>(sectionName: T, p = platform()) {
  // For non-TypeScript users, verify that the passed sectionName is actually one
  checkSectionName(sectionName);

  const bitcoinConfig: BitcoinConfig = {};
  const sections: Required<Sections> = {
    main: {},
    regtest: {},
    test: {},
  };
  for (const [optionName, option] of Object.entries(BITCOIN_CONFIG_OPTIONS)) {
    const { defaultValue } = option;
    if (typeof defaultValue === 'object' && !Array.isArray(defaultValue)) {
      // The default value for this option is section dependent.
      for (const sectionName of SECTION_NAMES) {
        sections[sectionName][optionName as OptionName] = defaultValue[sectionName];
      }
    } else {
      bitcoinConfig[optionName as OptionName] = defaultValue;
    }
  }
  bitcoinConfig.datadir = getDefaultDatadir(p);
  const sectionedConfig = { ...bitcoinConfig, sections };
  setActiveSectionName(sectionedConfig, sectionName);
  const defaultConfig = mergeUpActiveSectionConfig(sectionedConfig);
  for (const optionName of SECTION_SELECTION_OPTION_NAMES) {
    delete defaultConfig[optionName];
  }
  return defaultConfig as DefaultConfig<T>;
}
