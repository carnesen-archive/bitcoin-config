import { writeFileSync, existsSync, renameSync, readFileSync } from 'fs';

import { SectionedConfig } from './types';
import { checkIsAbsolute } from './to-absolute';
import { serializeConfig } from './serialize-config';
import mkdirp = require('mkdirp');
import { dirname } from 'path';

export function writeConfigFile(filePath: string, config: SectionedConfig) {
  checkIsAbsolute(filePath);
  const serializedConfig = serializeConfig(config);
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
  mkdirp.sync(dirname(filePath));
  const tmpFilePath = `${filePath}.tmp`;
  writeFileSync(tmpFilePath, serializedConfig);
  renameSync(tmpFilePath, filePath);
  return returnValue;
}
