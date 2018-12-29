import { SectionedBitcoinConfig, BitcoinConfig, Sections } from './config';
import { SECTION_NAMES, SectionName } from './names';
import { BITCOIN_CONFIG_OPTIONS } from './options';

// Options with value undefined are copied into the merged config.
// Options with array values are merged together with config0 values coming first.
function mergeBitcoinConfigs(
  bitcoinConfig0: BitcoinConfig,
  bitcoinConfig1: BitcoinConfig,
) {
  const mergedBitcoinConfig: BitcoinConfig = {};
  const optionNames0 = Object.keys(bitcoinConfig0);
  const optionNames1 = Object.keys(bitcoinConfig1);
  const uniqueOptionNames = new Set([...optionNames0, ...optionNames1]);
  for (const optionName of uniqueOptionNames) {
    const value0 = bitcoinConfig0[optionName as keyof typeof bitcoinConfig0];
    const value1 = bitcoinConfig1[optionName as keyof typeof bitcoinConfig1];
    if (typeof value0 !== 'undefined') {
      if (Array.isArray(value0) && Array.isArray(value1)) {
        mergedBitcoinConfig[optionName as keyof typeof mergedBitcoinConfig] = [
          ...value0,
          ...value1,
        ];
        continue;
      }
      mergedBitcoinConfig[optionName as keyof typeof mergedBitcoinConfig] = value0;
      continue;
    }
    if (typeof value1 !== 'undefined') {
      mergedBitcoinConfig[optionName as keyof typeof mergedBitcoinConfig] = value1;
      continue;
    }
    mergedBitcoinConfig[optionName as keyof typeof mergedBitcoinConfig] = undefined;
  }
  return mergedBitcoinConfig;
}

export function mergeSectionedBitcoinConfigs(
  sectionedBitcoinConfig0: SectionedBitcoinConfig,
  sectionedBitcoinConfig1: SectionedBitcoinConfig,
) {
  const { sections: sections0, ...bitcoinConfig0 } = sectionedBitcoinConfig0;
  const { sections: sections1, ...bitcoinConfig1 } = sectionedBitcoinConfig1;
  const mergedSectionedBitcoinConfig: SectionedBitcoinConfig = mergeBitcoinConfigs(
    bitcoinConfig0,
    bitcoinConfig1,
  );
  if (sections0 && sections1) {
    const mergedSections: Sections = {};
    for (const sectionName of SECTION_NAMES) {
      const sectionConfig0 = sections0[sectionName];
      const sectionConfig1 = sections1[sectionName];
      if (sectionConfig0 && sectionConfig1) {
        mergedSections[sectionName] = mergeBitcoinConfigs(sectionConfig0, sectionConfig1);
        continue;
      }
      if (sectionConfig0 || sectionConfig1) {
        mergedSections[sectionName] = sectionConfig0 || sectionConfig1;
      }
    }
    mergedSectionedBitcoinConfig.sections = mergedSections;
  } else if (sections0 || sections1) {
    mergedSectionedBitcoinConfig.sections = sections0 || sections1;
  }
  return mergedSectionedBitcoinConfig;
}

function getActiveSectionName(bitcoinConfig: BitcoinConfig): SectionName {
  const { regtest, testnet } = bitcoinConfig;
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

export function mergeUpActiveSectionConfig(
  sectionedBitcoinConfig: SectionedBitcoinConfig,
): BitcoinConfig {
  const activeSectionName = getActiveSectionName(sectionedBitcoinConfig);
  const { sections, ...rest } = sectionedBitcoinConfig;
  if (activeSectionName !== 'main') {
    for (const [optionName, option] of Object.entries(BITCOIN_CONFIG_OPTIONS)) {
      if (option.onlyAppliesToMain) {
        delete rest[optionName as keyof typeof BITCOIN_CONFIG_OPTIONS];
      }
    }
  }
  if (!sections) {
    return rest;
  }
  const sectionConfig = sections[activeSectionName];
  if (!sectionConfig) {
    return rest;
  }
  return mergeBitcoinConfigs(rest, sectionConfig);
}
