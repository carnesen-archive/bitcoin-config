import { mergeSection } from './merge-section';
import { mergeSectionedConfigs } from './merge-sectioned-configs';
import { readConfigFile } from './read-config-file';
import { toAbsolute } from './to-absolute';
import { DEFAULT_CONFIG_FILE_NAME } from './constants';

const DEFAULT_FILE_PATH = toAbsolute(DEFAULT_CONFIG_FILE_NAME);

export function readConfigFiles(filePath?: string) {
  let config = readConfigFile(filePath || DEFAULT_FILE_PATH);
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
