import { platform } from 'os';
import { Sections, BitcoinConfig, DefaultConfig } from './config';
import { BITCOIN_CONFIG_OPTIONS } from './options';
import {
  CHAIN_NAMES,
  ChainName,
  CHAIN_SELECTION_OPTION_NAMES,
  castToChainName as checkChainName,
} from './names';
import { setActiveChainName } from './util';
import { mergeUpActiveSectionConfig } from './merge';
import { DEFAULT_DATADIR } from './constants';

type OptionName = keyof typeof BITCOIN_CONFIG_OPTIONS;

export function getDefaultConfig<T extends ChainName>(chainName: T) {
  // For non-TypeScript users, verify that the passed chainName is actually one
  checkChainName(chainName);

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
      for (const chainName of CHAIN_NAMES) {
        sections[chainName][optionName as OptionName] = defaultValue[chainName];
      }
    } else {
      bitcoinConfig[optionName as OptionName] = defaultValue;
    }
  }
  bitcoinConfig.datadir = DEFAULT_DATADIR;
  const sectionedConfig = { ...bitcoinConfig, sections };
  setActiveChainName(sectionedConfig, chainName);
  const defaultConfig = mergeUpActiveSectionConfig(sectionedConfig);
  for (const optionName of CHAIN_SELECTION_OPTION_NAMES) {
    delete defaultConfig[optionName];
  }
  return defaultConfig as DefaultConfig<T>;
}
