import { readFileSync, existsSync } from 'fs';
import { dirname } from 'path';

import { DEFAULT_CONFIG_FILE_NAME } from './constants';
import { parseConfig } from './parse-config';
import { toAbsolute, checkIsAbsolute } from './util';

const DEFAULT_FILE_PATH = toAbsolute(DEFAULT_CONFIG_FILE_NAME);

export function readConfigFile(filePath?: string) {
  if (filePath) {
    checkIsAbsolute(filePath);
  }
  let fileContents = '';
  try {
    fileContents = readFileSync(filePath || DEFAULT_FILE_PATH, { encoding: 'utf8' });
  } catch (ex) {
    // Throw on:
    //   any error that's not "file not found"
    //   "file not found" && filePath has been passed
    //   "file not found" && filePath has not been passed && default path's directory does not exist
    if (ex.code !== 'ENOENT' || filePath || !existsSync(dirname(DEFAULT_FILE_PATH))) {
      throw ex;
    }
  }
  return parseConfig(fileContents);
}
