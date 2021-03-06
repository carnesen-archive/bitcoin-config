import { mergeSection } from './merge-section';
import { mergeSectionedConfigs } from './merge-sectioned-configs';
import { readConfigFile } from './read-config-file';
import { toAbsolute } from './to-absolute';

export function readConfigFiles(filePath: string) {
  let sectionedConfig = readConfigFile(filePath);
  const { includeconf, datadir } = mergeSection(sectionedConfig);
  if (includeconf) {
    for (const item of includeconf) {
      const includedFilePath = toAbsolute(item, datadir);
      const includedConfig = readConfigFile(includedFilePath);
      sectionedConfig = mergeSectionedConfigs(sectionedConfig, includedConfig);
    }
  }
  const bitcoinConfig = mergeSection(sectionedConfig);
  if (bitcoinConfig.includeconf !== includeconf) {
    throw new Error(
      "Included conf files are not allowed to have includeconf's themselves",
    );
  }
  return bitcoinConfig;
}
