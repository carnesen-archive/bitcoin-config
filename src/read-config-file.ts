import { readFileSync } from 'fs';

import { DEFAULT_CONFIG_FILE_NAME } from './constants';
import { parseConfig } from './parse-config';
import { toAbsolute, checkIsAbsolute } from './to-absolute';

const DEFAULT_FILE_PATH = toAbsolute(DEFAULT_CONFIG_FILE_NAME);

export function readConfigFile(filePath?: string) {
  if (filePath) {
    checkIsAbsolute(filePath);
  }
  const fileContents = readFileSync(filePath || DEFAULT_FILE_PATH, { encoding: 'utf8' });
  return parseConfig(fileContents);
}
