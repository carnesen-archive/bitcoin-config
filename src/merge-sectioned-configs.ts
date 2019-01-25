import { SectionedConfig, Sections } from './types';
import { CHAIN_NAMES } from './names';
import { mergeBitcoinConfigs } from './merge-bitcoin-configs';

export function mergeSectionedConfigs(
  sectionedBitcoinConfig0: SectionedConfig,
  sectionedBitcoinConfig1: SectionedConfig,
) {
  const { sections: sections0, ...bitcoinConfig0 } = sectionedBitcoinConfig0;
  const { sections: sections1, ...bitcoinConfig1 } = sectionedBitcoinConfig1;
  const mergedSectionedBitcoinConfig: SectionedConfig = mergeBitcoinConfigs(
    bitcoinConfig0,
    bitcoinConfig1,
  );
  if (sections0 && sections1) {
    const mergedSections: Sections = {};
    for (const chainName of CHAIN_NAMES) {
      const sectionConfig0 = sections0[chainName];
      const sectionConfig1 = sections1[chainName];
      if (sectionConfig0 && sectionConfig1) {
        mergedSections[chainName] = mergeBitcoinConfigs(sectionConfig0, sectionConfig1);
        continue;
      }
      if (sectionConfig0 || sectionConfig1) {
        mergedSections[chainName] = sectionConfig0 || sectionConfig1;
      }
    }
    mergedSectionedBitcoinConfig.sections = mergedSections;
  } else if (sections0 || sections1) {
    mergedSectionedBitcoinConfig.sections = sections0 || sections1;
  }
  return mergedSectionedBitcoinConfig;
}
