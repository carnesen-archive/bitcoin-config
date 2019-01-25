import { writeFileSync, existsSync, renameSync, readFileSync } from 'fs';

import { SectionedConfig } from './types';
import { checkIsAbsolute } from './util';
import { serializeConfig } from './serialize-config';

export function writeConfigFile(filePath: string, sectionedConfig: SectionedConfig) {
  checkIsAbsolute(filePath);
  const serializedConfig = serializeConfig(sectionedConfig);
  const returnValue: {
    changed: boolean;
    serializedConfig: string;
    backupFilePath?: string;
  } = {
    changed: false,
    serializedConfig,
  };
  if (existsSync(filePath)) {
    if (serializedConfig === readFileSync(filePath, { encoding: 'utf8' })) {
      return returnValue;
    }
    returnValue.backupFilePath = `${filePath}.bak`;
    renameSync(filePath, returnValue.backupFilePath);
  }
  returnValue.changed = true;
  const tmpFilePath = `${filePath}.tmp`;
  writeFileSync(tmpFilePath, serializedConfig);
  renameSync(tmpFilePath, filePath);
  return returnValue;
}
