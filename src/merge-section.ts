import { SectionedConfig, BitcoinConfig } from './types';
import { BITCOIN_CONFIG_OPTIONS } from './bitcoin-config-options';
import { getChainName } from './get-chain-name';
import { mergeBitcoinConfigs } from './merge-bitcoin-configs';

export function mergeSection(sectionedConfig: SectionedConfig): BitcoinConfig {
  const chainName = getChainName(sectionedConfig);
  const { sections, ...rest } = sectionedConfig;
  if (chainName !== 'main') {
    for (const [optionName, option] of Object.entries(BITCOIN_CONFIG_OPTIONS)) {
      if (option.onlyAppliesToMain) {
        delete rest[optionName as keyof typeof BITCOIN_CONFIG_OPTIONS];
      }
    }
  }
  if (!sections) {
    return rest;
  }
  const sectionConfig = sections[chainName];
  if (!sectionConfig) {
    return rest;
  }
  return mergeBitcoinConfigs(rest, sectionConfig);
}
