import { readFileSync, existsSync } from 'fs';
import { BITCOIN_CONF_FILENAME, getDefaults } from './default';
import { parseConfigFileContents } from './parse';
import { toAbsolute } from './util';
import {
  SectionedBitcoinConfig,
  BitcoinConfigWithDefaults,
  BitcoinConfig,
} from './config';
import { dirname } from 'path';
import { mergeUpActiveSectionConfig, mergeSectionedBitcoinConfigs } from './merge';

function readOneConfigFile(filePath: string) {
  const fileContents = readFileSync(filePath, { encoding: 'utf8' });
  return parseConfigFileContents(fileContents);
}

type ReadConfigFilesOptions<T> = Partial<{
  conf: string;
  datadir: string;
  withDefaults: T;
}>;

type ReadConfigFilesReturnValue<T> = T extends true
  ? BitcoinConfigWithDefaults
  : BitcoinConfig;

export function readConfigFiles<T extends boolean>(
  options: ReadConfigFilesOptions<T> = {},
): ReadConfigFilesReturnValue<T> {
  const { conf, datadir, withDefaults } = options;
  let sectionedBitcoinConfig: SectionedBitcoinConfig = {};
  const confPath = toAbsolute(conf || BITCOIN_CONF_FILENAME, { datadir });
  try {
    sectionedBitcoinConfig = readOneConfigFile(confPath);
  } catch (ex) {
    if (ex.code !== 'ENOENT' || conf || !existsSync(dirname(confPath))) {
      throw ex;
    }
  }
  const { includeconf } = mergeUpActiveSectionConfig(sectionedBitcoinConfig);
  if (includeconf) {
    for (const includeconfItem of includeconf) {
      const includedConfPath = toAbsolute(includeconfItem, { datadir });
      const includedBitcoinConfig = readOneConfigFile(includedConfPath);
      sectionedBitcoinConfig = mergeSectionedBitcoinConfigs(
        sectionedBitcoinConfig,
        includedBitcoinConfig,
      );
    }
  }
  if (withDefaults) {
    sectionedBitcoinConfig = mergeSectionedBitcoinConfigs(
      sectionedBitcoinConfig,
      getDefaults(),
    );
  }
  const bitcoinConfig = mergeUpActiveSectionConfig(sectionedBitcoinConfig);
  if (bitcoinConfig.includeconf !== includeconf) {
    throw new Error(
      "Included conf files are not allowed to have includeconf's themselves",
    );
  }
  if (datadir) {
    bitcoinConfig.datadir = datadir;
  }
  return bitcoinConfig as ReadConfigFilesReturnValue<T>;
}
