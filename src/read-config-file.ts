import { readFileSync } from 'fs';

import { parseConfig } from './parse-config';
import { checkIsAbsolute } from './to-absolute';

export function readConfigFile(filePath: string) {
  checkIsAbsolute(filePath);
  const fileContents = readFileSync(filePath, {
    encoding: 'utf8',
  });
  return parseConfig(fileContents);
}
