import { SectionedConfig, BitcoinConfig } from './types';
import { BITCOIN_CONFIG_OPTIONS } from './bitcoin-config-options';
import { getActiveChainName } from './util';
import { mergeBitcoinConfigs } from './merge-bitcoin-configs';

export function mergeActiveChain(sectionedConfig: SectionedConfig): BitcoinConfig {
  const activeChainName = getActiveChainName(sectionedConfig);
  const { sections, ...rest } = sectionedConfig;
  if (activeChainName !== 'main') {
    for (const [optionName, option] of Object.entries(BITCOIN_CONFIG_OPTIONS)) {
      if (option.onlyAppliesToMain) {
        delete rest[optionName as keyof typeof BITCOIN_CONFIG_OPTIONS];
      }
    }
  }
  if (!sections) {
    return rest;
  }
  const sectionConfig = sections[activeChainName];
  if (!sectionConfig) {
    return rest;
  }
  return mergeBitcoinConfigs(rest, sectionConfig);
}
