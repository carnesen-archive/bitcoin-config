import { EOL } from 'os';

import { SectionedConfig } from './types';
import { CHAIN_NAMES } from './names';
import { serializeBitcoinConfig } from './serialize-bitcoin-config';
const pkg = require('../package.json');

export function serializeConfig(sectionedConfig: SectionedConfig) {
  const chunks: string[] = [
    `# This is a bitcoin configuration file written using ${pkg.name}`,
  ];

  const { sections, ...rest } = sectionedConfig;

  chunks.push('');
  chunks.push(serializeBitcoinConfig(rest));

  if (sections) {
    for (const chainName of CHAIN_NAMES) {
      const sectionConfig = sections[chainName];
      if (sectionConfig) {
        chunks.push(`[${chainName}]`);
        chunks.push('');
        chunks.push(serializeBitcoinConfig(sectionConfig));
      }
    }
  }
  return chunks.join(EOL);
}
