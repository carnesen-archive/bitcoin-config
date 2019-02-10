import { readFileSync } from 'fs';

import { DEFAULT_CONFIG_FILE_PATH } from './constants';
import { parseConfig } from './parse-config';
import { checkIsAbsolute } from './to-absolute';

export function readConfigFile(filePath = DEFAULT_CONFIG_FILE_PATH) {
  checkIsAbsolute(filePath);
  const fileContents = readFileSync(filePath, {
    encoding: 'utf8',
  });
  return parseConfig(fileContents);
}
