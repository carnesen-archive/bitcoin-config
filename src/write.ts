import { writeFileSync, existsSync, renameSync, readFileSync } from 'fs';
import { EOL } from 'os';

import { SectionedConfig, BitcoinConfig } from './config';
import { checkIsAbsolute } from './util';
import { Value } from './options';
import { CHAIN_NAMES, TypeName } from './names';
import { findOption } from './find';
const pkg = require('../package.json');

function serializeOption(optionName: string, optionValue?: Value<TypeName>) {
  if (typeof optionValue === 'undefined') {
    return `#${optionName}=`;
  }
  if (Array.isArray(optionValue)) {
    return optionValue
      .map(optionValueItem => `${optionName}=${optionValueItem}`)
      .join(EOL);
  }
  if (optionValue === true) {
    return `${optionName}=1`;
  }
  if (optionValue === false) {
    return `${optionName}=0`;
  }
  return `${optionName}=${optionValue}`;
}

function serializeBitcoinConfig(config: BitcoinConfig) {
  const strings: string[] = [];

  for (const [optionName, optionValue] of Object.entries(config)) {
    const option = findOption(optionName);
    strings.push(...option.description.map(item => `# ${item}`));
    strings.push(serializeOption(optionName, optionValue));
    strings.push('');
  }
  return strings.join(EOL);
}

function serializeSectionedConfig(config: SectionedConfig) {
  const strings: string[] = [
    `# This file was written using ${writeConfigFile.name} from ${pkg.name}`,
  ];

  const { sections, ...rest } = config;

  strings.push('');
  strings.push(serializeBitcoinConfig(rest));

  if (sections) {
    for (const chainName of CHAIN_NAMES) {
      const sectionConfig = sections[chainName];
      if (sectionConfig) {
        strings.push(`[${chainName}]`);
        strings.push('');
        strings.push(serializeBitcoinConfig(sectionConfig));
      }
    }
  }
  return strings.join(EOL);
}

export function writeConfigFile(filePath: string, config: SectionedConfig) {
  checkIsAbsolute(filePath);
  const fileContents = serializeSectionedConfig(config);
  if (existsSync(filePath)) {
    if (fileContents === readFileSync(filePath, { encoding: 'utf8' })) {
      return fileContents;
    }
    renameSync(filePath, `${filePath}.bak`);
  }
  const tmpFilePath = `${filePath}.tmp`;
  writeFileSync(tmpFilePath, fileContents);
  renameSync(tmpFilePath, filePath);
  return fileContents;
}
