import { join } from 'path';
import * as tempy from 'tempy';
import { readFileSync, existsSync, statSync } from 'fs';

import { writeConfigFile } from '../write-config-file';
import { BITCOIN_CONFIG_OPTIONS } from '../bitcoin-config-options';

describe(writeConfigFile.name, () => {
  it('writes a config file at the specified location', () => {
    const filePath = tempy.file();
    writeConfigFile(filePath, {});
    expect(existsSync(filePath)).toBe(true);
  });

  it('returns the serialized config file contents', () => {
    const filePath = tempy.file();
    const returnValue = writeConfigFile(filePath, { rpcuser: 'foo' });
    const fileContents = readFileSync(filePath, { encoding: 'utf8' });
    expect(returnValue).toBe(fileContents);
  });

  it('throws "ENOENT" if the directory of the specified file path does not exist', () => {
    const filePath = join(tempy.file(), 'bitcoin.conf');
    // ^^ tempy.file() is basically just tempy.directory() without the mkdir
    expect(() => writeConfigFile(filePath, {})).toThrow('ENOENT');
  });

  it('creates a backup of an existing file first if one exists', () => {
    const filePath = tempy.file();
    writeConfigFile(filePath, { rpcuser: 'foo' });
    const fileContents = readFileSync(filePath, 'utf8');
    writeConfigFile(filePath, { rpcuser: 'bar' });
    const bakFileContents = readFileSync(`${filePath}.bak`, 'utf8');
    expect(fileContents).toBe(bakFileContents);
  });

  it('does not re-write the file or the .bak file if the contents have not changed', () => {
    const filePath = tempy.file();
    const fooFileContents = writeConfigFile(filePath, { rpcuser: 'foo' });
    writeConfigFile(filePath, { rpcuser: 'bar' });
    const stats = statSync(filePath);
    writeConfigFile(filePath, { rpcuser: 'bar' });
    expect(statSync(filePath).mtime).toEqual(stats.mtime);
    expect(readFileSync(`${filePath}.bak`, { encoding: 'utf8' })).toBe(fooFileContents);
  });

  it('writes a header comment line', () => {
    const fileContents = writeConfigFile(tempy.file(), {});
    expect(fileContents).toMatch(/^# .* written using @carnesen\/bitcoin-config/);
  });

  it('writes string option as name=value', () => {
    const fileContents = writeConfigFile(tempy.file(), { rpcuser: 'sinh' });
    expect(fileContents).toMatch(/^rpcuser=sinh$/m);
  });

  it('writes number option as name=value', () => {
    const fileContents = writeConfigFile(tempy.file(), { banscore: 12 });
    expect(fileContents).toMatch(/^banscore=12$/m);
  });

  it('writes boolean option value `true` as name=1', () => {
    const fileContents = writeConfigFile(tempy.file(), { blocksonly: true });
    expect(fileContents).toMatch(/^blocksonly=1$/m);
  });

  it('writes boolean option value `false` as name=0', () => {
    const fileContents = writeConfigFile(tempy.file(), { blocksonly: false });
    expect(fileContents).toMatch(/^blocksonly=0$/m);
  });

  it('writes explicitly undefined values as comments "#name="', () => {
    const fileContents = writeConfigFile(tempy.file(), { rpcuser: undefined });
    expect(fileContents).toMatch(/^#rpcuser=$/m);
  });

  it('writes multi-valued string option as multiple name=value pairs', () => {
    const fileContents = writeConfigFile(tempy.file(), { rpcauth: ['foo', 'bar'] });
    expect(fileContents).toMatch(/^rpcauth=foo\n\r?rpcauth=bar$/m);
  });

  it('writes option description of defined values as comments', () => {
    const fileContents = writeConfigFile(tempy.file(), { rpcauth: ['foo', 'bar'] });
    for (const line of BITCOIN_CONFIG_OPTIONS.rpcauth.description.split('\n')) {
      expect(fileContents.includes(`# ${line}`)).toBe(true);
    }
  });

  it('writes option description of explicitly undefined values as comments', () => {
    const fileContents = writeConfigFile(tempy.file(), { rpcuser: undefined });
    for (const line of BITCOIN_CONFIG_OPTIONS.rpcuser.description.split('\n')) {
      expect(fileContents.includes(`# ${line}`)).toBe(true);
    }
  });

  it('does not write option description of implicitly undefined values as comments', () => {
    const fileContents = writeConfigFile(tempy.file(), { rpcuser: undefined });
    for (const line of BITCOIN_CONFIG_OPTIONS.rpcpassword.description.split('\n')) {
      expect(fileContents.includes(`# ${line}`)).toBe(false);
    }
  });

  it('writes section header for explicitly defined `sections` property', () => {
    const fileContents = writeConfigFile(tempy.file(), {
      sections: {
        main: {},
      },
    });
    expect(fileContents).toMatch(/^\[main\]$/m);
  });
});
