import { writeFileSync, existsSync, renameSync } from 'fs';
import { EOL } from 'os';

import { SectionedBitcoinConfig, BitcoinConfig } from './config';
import { toAbsolute, findOption } from './util';
import { BITCOIN_CONF_FILENAME } from './default';
import { Value } from './options';
import { SECTION_NAMES, TypeName } from './names';
const pkg = require('../package.json');

function serializeOption(optionName: string, optionValue?: Value<TypeName>) {
  if (typeof optionValue === 'undefined') {
    return `${optionName}=`;
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

function serializeBitcoinConfig(bitcoinConfig: BitcoinConfig) {
  const strings: string[] = [];

  for (const [optionName, optionValue] of Object.entries(bitcoinConfig)) {
    const { option } = findOption(optionName);
    strings.push(...option.description.map(item => `# ${item}`));
    strings.push(serializeOption(optionName, optionValue));
    strings.push('');
  }
  return strings.join(EOL);
}

function serializeSectionedBitcoinConfig(sectionedBitcoinConfig: SectionedBitcoinConfig) {
  const strings: string[] = [`# ${new Date()}: This file was written by ${pkg.name}`];

  const { sections, ...rest } = sectionedBitcoinConfig;

  strings.push('');
  strings.push(serializeBitcoinConfig(rest));

  if (sections) {
    for (const sectionName of SECTION_NAMES) {
      const sectionConfig = sections[sectionName];
      if (sectionConfig) {
        strings.push(`[${sectionName}]`);
        strings.push(serializeBitcoinConfig(sectionConfig));
      }
    }
  }
  return strings.join(EOL);
}

function writeOneConfigFile(bitcoinConfig: SectionedBitcoinConfig, filePath: string) {
  const serialized = serializeSectionedBitcoinConfig(bitcoinConfig);
  const tmpFilePath = `${filePath}.tmp`;
  const oldFilePath = `${filePath}.bak`;
  writeFileSync(tmpFilePath, serialized);
  if (existsSync(filePath)) {
    renameSync(filePath, oldFilePath);
  }
  renameSync(tmpFilePath, filePath);
  return serialized;
}

export function writeConfigFiles(
  bitcoinConfig: SectionedBitcoinConfig,
  options: { conf?: string; datadir?: string } = {},
) {
  const { conf, datadir } = options;
  const filePath = toAbsolute(conf || BITCOIN_CONF_FILENAME, datadir);
  const fileContents = writeOneConfigFile(bitcoinConfig, filePath);
  const returnValue: [{ filePath: string; fileContents: string }] = [
    { filePath, fileContents },
  ];
  return returnValue;
}
