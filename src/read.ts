import { readFileSync, existsSync } from 'fs';
import { dirname } from 'path';

import { DEFAULT_CONFIG_FILE_NAME } from './constants';
import { parseConfigFileContents } from './parse';
import { toAbsolute, checkIsAbsolute } from './util';
import { SectionedConfig, BitcoinConfig } from './config';
import { mergeUpActiveSectionConfig, mergeSectionedConfigs } from './merge';

function readOneConfigFile(filePath: string) {
  const fileContents = readFileSync(filePath, { encoding: 'utf8' });
  return parseConfigFileContents(fileContents);
}

const DEFAULT_FILE_PATH = toAbsolute(DEFAULT_CONFIG_FILE_NAME);

export function readConfigFiles(filePath?: string): BitcoinConfig {
  if (filePath) {
    checkIsAbsolute(filePath);
  }
  let config: SectionedConfig = {};
  try {
    config = readOneConfigFile(filePath || DEFAULT_FILE_PATH);
  } catch (ex) {
    // Throw on:
    //   any error that's not "file not found"
    //   "file not found" && filePath has been passed
    //   "file not found" && filePath has not been passed && default path's directory does not exist
    if (ex.code !== 'ENOENT' || filePath || !existsSync(dirname(DEFAULT_FILE_PATH))) {
      throw ex;
    }
  }
  const { includeconf, datadir } = mergeUpActiveSectionConfig(config);
  if (includeconf) {
    for (const item of includeconf) {
      const includedFilePath = toAbsolute(item, datadir);
      const includedConfig = readOneConfigFile(includedFilePath);
      config = mergeSectionedConfigs(config, includedConfig);
    }
  }
  const mergedConfig = mergeUpActiveSectionConfig(config);
  if (mergedConfig.includeconf !== includeconf) {
    throw new Error(
      "Included conf files are not allowed to have includeconf's themselves",
    );
  }
  return mergedConfig;
}
