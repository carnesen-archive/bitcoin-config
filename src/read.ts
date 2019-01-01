import { readFileSync, existsSync } from 'fs';
import { dirname } from 'path';

import { BITCOIN_CONF } from './default';
import { parseConfigFileContents } from './parse';
import { toAbsolute, checkLocation } from './util';
import { SectionedBitcoinConfig, BitcoinConfig } from './config';
import { mergeUpActiveSectionConfig, mergeSectionedBitcoinConfigs } from './merge';

function readOneConfigFile(filePath: string) {
  const fileContents = readFileSync(filePath, { encoding: 'utf8' });
  return parseConfigFileContents(fileContents);
}

export function readConfigFiles(
  location: Partial<{ conf: string; datadir: string }> = {},
): BitcoinConfig {
  checkLocation(location);
  const { conf, datadir } = location;
  let config: SectionedBitcoinConfig = {};
  const filePath = toAbsolute(conf || BITCOIN_CONF, { datadir });
  try {
    config = readOneConfigFile(filePath);
  } catch (ex) {
    if (ex.code !== 'ENOENT' || conf || !existsSync(dirname(filePath))) {
      throw ex;
    }
  }
  const { includeconf } = mergeUpActiveSectionConfig(config);
  if (includeconf) {
    for (const item of includeconf) {
      const includedFilePath = toAbsolute(item, { datadir });
      const includedConfig = readOneConfigFile(includedFilePath);
      config = mergeSectionedBitcoinConfigs(config, includedConfig);
    }
  }
  const mergedConfig = mergeUpActiveSectionConfig(config);
  if (mergedConfig.includeconf !== includeconf) {
    throw new Error(
      "Included conf files are not allowed to have includeconf's themselves",
    );
  }
  if (datadir) {
    mergedConfig.datadir = datadir;
  }
  return mergedConfig;
}
