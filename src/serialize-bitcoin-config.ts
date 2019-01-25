import { EOL } from 'os';

import { BitcoinConfig } from './types';
import { findOption } from './find-option';
import { serializeOption } from './serialize-option';

export function serializeBitcoinConfig(config: BitcoinConfig) {
  const strings: string[] = [];

  for (const [optionName, optionValue] of Object.entries(config)) {
    const option = findOption(optionName);
    strings.push(...option.description.split('\n').map(item => `# ${item}`));
    strings.push(serializeOption(optionName, optionValue));
    strings.push('');
  }
  return strings.join(EOL);
}
