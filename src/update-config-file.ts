import { SectionedConfig, NullableSectionedConfig } from './types';
import { checkIsAbsolute } from './util';
import { readConfigFile } from './read-config-file';
import { writeConfigFile } from './write-config-file';
import { updateSectionedConfig } from './update-sectioned-config';

export function updateConfigFile(filePath: string, delta: NullableSectionedConfig) {
  checkIsAbsolute(filePath);
  let config: SectionedConfig = {};
  try {
    config = readConfigFile(filePath);
  } catch (ex) {
    if (ex.code !== 'ENOENT') {
      throw ex;
    }
  }
  const nextConfig = updateSectionedConfig(config, delta);
  return writeConfigFile(filePath, nextConfig);
}
