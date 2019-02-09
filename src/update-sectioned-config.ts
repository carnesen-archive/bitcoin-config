import { SectionedConfig, NullableSectionedConfig } from './types';
import { CHAIN_NAMES } from './names';
import { updateBitcoinConfig } from './update-bitcoin-config';

export function updateSectionedConfig(
  config: SectionedConfig,
  delta: NullableSectionedConfig,
) {
  const { sections: existingSections, ...existingRest } = config;
  const { sections: deltaSections, ...deltaRest } = delta;

  const nextConfig: SectionedConfig = updateBitcoinConfig(existingRest, deltaRest);
  if (deltaSections !== null) {
    nextConfig.sections = existingSections && { ...existingSections };
  }
  if (deltaSections) {
    for (const chainName of CHAIN_NAMES) {
      const deltaSection = deltaSections[chainName];
      if (deltaSection === null && nextConfig.sections) {
        delete nextConfig.sections[chainName];
      }
      if (deltaSection) {
        if (!nextConfig.sections) {
          nextConfig.sections = {};
        }
        nextConfig.sections[chainName] = updateBitcoinConfig(
          nextConfig.sections[chainName] || {},
          deltaSection,
        );
      }
    }
  }
  return nextConfig;
}
