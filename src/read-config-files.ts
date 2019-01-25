import { mergeSection } from './merge-section';
import { mergeSectionedConfigs } from './merge-sectioned-configs';
import { readConfigFile } from './read-config-file';
import { BitcoinConfig } from './types';
import { toAbsolute } from './util';

export function readConfigFiles(filePath?: string): BitcoinConfig {
  let config = readConfigFile(filePath);
  const { includeconf, datadir } = mergeSection(config);
  if (includeconf) {
    for (const item of includeconf) {
      const includedFilePath = toAbsolute(item, datadir);
      const includedConfig = readConfigFile(includedFilePath);
      config = mergeSectionedConfigs(config, includedConfig);
    }
  }
  const mergedConfig = mergeSection(config);
  if (mergedConfig.includeconf !== includeconf) {
    throw new Error(
      "Included conf files are not allowed to have includeconf's themselves",
    );
  }
  return mergedConfig;
}
