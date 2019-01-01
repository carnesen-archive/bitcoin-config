import { writeFileSync, existsSync, renameSync } from 'fs';
import { EOL } from 'os';
import { isAbsolute } from 'path';

import { SectionedBitcoinConfig, BitcoinConfig } from './config';
import { toAbsolute, findOption, checkLocation } from './util';
import { BITCOIN_CONF } from './default';
import { Value } from './options';
import { SECTION_NAMES, TypeName } from './names';
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

function serializeSectionedBitcoinConfig(config: SectionedBitcoinConfig) {
  const strings: string[] = [`# ${new Date()}: This file was written by ${pkg.name}`];

  const { sections, ...rest } = config;

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

function writeOneConfigFile(config: SectionedBitcoinConfig, filePath: string) {
  const serialized = serializeSectionedBitcoinConfig(config);
  const tmpFilePath = `${filePath}.tmp`;
  const oldFilePath = `${filePath}.bak`;
  writeFileSync(tmpFilePath, serialized);
  if (existsSync(filePath)) {
    renameSync(filePath, oldFilePath);
  }
  renameSync(tmpFilePath, filePath);
  return serialized;
}

export function writeConfigFile(
  config: SectionedBitcoinConfig,
  location: { conf: string; datadir?: string } | { conf?: string; datadir: string },
) {
  checkLocation(location);
  if (!location || !(location.conf || location.datadir)) {
    throw new Error('Either conf or datadir must be provided');
  }
  const { conf = BITCOIN_CONF, datadir } = location;
  let mergedConfig = config;
  if (!isAbsolute(conf)) {
    mergedConfig = { datadir, ...config };
  }
  const filePath = toAbsolute(conf, { datadir });
  const fileContents = writeOneConfigFile(mergedConfig, filePath);
  const returnValue: [string, string] = [fileContents, filePath];
  return returnValue;
}
