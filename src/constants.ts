import { join } from 'path';
import { homedir, platform } from 'os';

function getDefaultDatadir(p = platform()) {
  switch (p) {
    case 'darwin':
      return join(homedir(), 'Library', 'Application Support', 'Bitcoin');
    case 'win32':
      return join(process.env.APPDATA!, 'Bitcoin');
    default:
      return join(homedir(), '.bitcoin');
  }
}

export const DEFAULT_DATADIR = getDefaultDatadir();
export const DEFAULT_CONFIG_FILE_PATH = join(DEFAULT_DATADIR, 'bitcoin.conf');
