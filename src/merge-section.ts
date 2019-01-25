import { SectionedConfig, BitcoinConfig } from './types';
import { BITCOIN_CONFIG_OPTIONS } from './bitcoin-config-options';
import { getChainName } from './util';
import { mergeBitcoinConfigs } from './merge-bitcoin-configs';

export function mergeSection(sectionedConfig: SectionedConfig): BitcoinConfig {
  const chaneName = getChainName(sectionedConfig);
  const { sections, ...rest } = sectionedConfig;
  if (chaneName !== 'main') {
    for (const [optionName, option] of Object.entries(BITCOIN_CONFIG_OPTIONS)) {
      if (option.onlyAppliesToMain) {
        delete rest[optionName as keyof typeof BITCOIN_CONFIG_OPTIONS];
      }
    }
  }
  if (!sections) {
    return rest;
  }
  const sectionConfig = sections[chaneName];
  if (!sectionConfig) {
    return rest;
  }
  return mergeBitcoinConfigs(rest, sectionConfig);
}
