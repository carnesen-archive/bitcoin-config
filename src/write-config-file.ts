import { writeFileSync, existsSync, renameSync, readFileSync } from 'fs';

import { SectionedConfig } from './types';
import { checkIsAbsolute } from './util';
import { serializeConfig } from './serialize-config';

export function writeConfigFile(filePath: string, sectionedConfig: SectionedConfig) {
  checkIsAbsolute(filePath);
  const fileContents = serializeConfig(sectionedConfig);
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
