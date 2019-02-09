import * as tempy from 'tempy';
import { readFileSync, existsSync, statSync } from 'fs';

import { writeConfigFile } from '../write-config-file';

describe(writeConfigFile.name, () => {
  it('writes a bitcoin configuration file at the specified location', () => {
    const filePath = tempy.file();
    writeConfigFile(filePath, {});
    expect(existsSync(filePath)).toBe(true);
  });

  it('returns the written file\'s contents as "serializedConfig"', () => {
    const filePath = tempy.file();
    const { serializedConfig } = writeConfigFile(filePath, { rpcuser: 'foo' });
    const fileContents = readFileSync(filePath, { encoding: 'utf8' });
    expect(serializedConfig).toBe(fileContents);
  });

  it('creates a backup of an existing file first if one exists and in that case returns backupFilePath', () => {
    const filePath = tempy.file();
    let backupFilePath: undefined | string;
    let changed: boolean;
    ({ backupFilePath, changed } = writeConfigFile(filePath, { rpcuser: 'foo' }));
    expect(changed).toBe(true);
    expect(typeof backupFilePath).toBe('undefined');
    const fileContents = readFileSync(filePath, 'utf8');
    ({ backupFilePath, changed } = writeConfigFile(filePath, { rpcuser: 'bar' }));
    expect(changed).toBe(true);
    expect(typeof backupFilePath).toBe('string');
    const backupFileContents = readFileSync(backupFilePath!, 'utf8');
    expect(fileContents).toBe(backupFileContents);
  });

  it('does not re-write the file or the .bak file if the contents have not changed', () => {
    const filePath = tempy.file();
    const { serializedConfig } = writeConfigFile(filePath, { rpcuser: 'foo' });
    let backupFilePath: undefined | string;
    let changed: boolean;
    ({ backupFilePath, changed } = writeConfigFile(filePath, { rpcuser: 'bar' }));
    expect(typeof backupFilePath).toBe('string');
    expect(changed).toBe(true);
    const stats = statSync(filePath);
    ({ backupFilePath, changed } = writeConfigFile(filePath, { rpcuser: 'bar' }));
    expect(typeof backupFilePath).toBe('undefined');
    expect(changed).toBe(false);
    expect(statSync(filePath).mtime).toEqual(stats.mtime);
    expect(readFileSync(`${filePath}.bak`, { encoding: 'utf8' })).toBe(serializedConfig);
  });
});
