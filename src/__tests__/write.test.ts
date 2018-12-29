import { isAbsolute, join } from 'path';
import * as tempy from 'tempy';
import { readFileSync, existsSync } from 'fs';
import { writeConfigFiles } from '../write';
import { BITCOIN_CONFIG_OPTIONS } from '../options';

describe('writeConfigFiles', () => {
  it('writes bitcoin.conf in the specified datadir', () => {
    const datadir = tempy.directory();
    writeConfigFiles({}, { datadir });
    expect(existsSync(join(datadir, 'bitcoin.conf'))).toBe(true);
  });

  it('writes file to "conf" if that option is provided as an absolute path', () => {
    const conf = tempy.file();
    writeConfigFiles({}, { conf });
    expect(existsSync(conf)).toBe(true);
  });

  it('ignores datadir if conf is provided as an absolute path', () => {
    const conf = tempy.file();
    expect(isAbsolute(conf)).toBe(true);
    const datadir = 'this value is completely ignored if conf is absolute';
    writeConfigFiles({}, { conf, datadir });
    expect(existsSync(conf)).toBe(true);
  });

  it('interprets "conf" as datadir-relative if it is not an absolute path', () => {
    const datadir = tempy.directory();
    const conf = 'non-standard-filename.conf';
    writeConfigFiles({}, { datadir, conf });
    expect(existsSync(join(datadir, conf))).toBe(true);
  });

  it('throws "ENOENT" if specified datadir does not exist', () => {
    const datadir = tempy.file();
    // ^^ tempy.file() is basically just tempy.directory() without the mkdir
    expect(() => writeConfigFiles({}, { datadir })).toThrow('ENOENT');
  });

  it('throws "ENOENT" if conf is provided in a directory that does not already exist', () => {
    const conf = join(tempy.file(), 'some-filename.conf');
    // ^^ tempy.file() is basically just tempy.directory() without the mkdir
    expect(() => writeConfigFiles({}, { datadir: conf })).toThrow('ENOENT');
  });

  it('creates a backup of an existing file first if one exists', () => {
    const conf = tempy.file();
    writeConfigFiles({ rpcuser: 'foo' }, { conf });
    const fileContents = readFileSync(conf, 'utf8');
    writeConfigFiles({ rpcuser: 'bar' }, { conf });
    const backupFileContents = readFileSync(`${conf}.bak`, 'utf8');
    expect(fileContents).toBe(backupFileContents);
  });

  it('returns an array of the file paths and contents that were written', () => {
    const filePath = tempy.file();
    const returnValue = writeConfigFiles({ rpcuser: 'foo' }, { conf: filePath });
    const fileContents = readFileSync(filePath, 'utf8');
    expect(returnValue).toEqual([{ filePath, fileContents }]);
  });

  it('writes a header comment line', () => {
    const [{ fileContents }] = writeConfigFiles({}, { conf: tempy.file() });
    expect(fileContents).toMatch(/^# .* written by/);
  });

  it('writes string option as name=value', () => {
    const [{ fileContents }] = writeConfigFiles(
      { rpcuser: 'sinh' },
      { conf: tempy.file() },
    );
    expect(fileContents).toMatch(/^rpcuser=sinh$/m);
  });

  it('writes number option as name=value', () => {
    const [{ fileContents }] = writeConfigFiles({ banscore: 12 }, { conf: tempy.file() });
    expect(fileContents).toMatch(/^banscore=12$/m);
  });

  it('writes boolean option value `true` as name=1', () => {
    const [{ fileContents }] = writeConfigFiles(
      { blocksonly: true },
      { conf: tempy.file() },
    );
    expect(fileContents).toMatch(/^blocksonly=1$/m);
  });

  it('writes boolean option value `false` as name=0', () => {
    const [{ fileContents }] = writeConfigFiles(
      { blocksonly: false },
      { conf: tempy.file() },
    );
    expect(fileContents).toMatch(/^blocksonly=0$/m);
  });

  it('writes explicitly undefined values as name=', () => {
    const [{ fileContents }] = writeConfigFiles(
      { rpcuser: undefined },
      { conf: tempy.file() },
    );
    expect(fileContents).toMatch(/^rpcuser=$/m);
  });

  it('writes multi-valued string option as multiple name=value pairs', () => {
    const [{ fileContents }] = writeConfigFiles(
      { rpcauth: ['foo', 'bar'] },
      { conf: tempy.file() },
    );
    expect(fileContents).toMatch(/^rpcauth=foo\n\r?rpcauth=bar$/m);
  });

  it('writes option description of defined values as comments', () => {
    const [{ fileContents }] = writeConfigFiles(
      { rpcauth: ['foo', 'bar'] },
      { conf: tempy.file() },
    );
    for (const line of BITCOIN_CONFIG_OPTIONS.rpcauth.description) {
      expect(fileContents.includes(`# ${line}`)).toBe(true);
    }
  });

  it('writes option description of explicitly undefined values as comments', () => {
    const [{ fileContents }] = writeConfigFiles(
      { rpcuser: undefined },
      { conf: tempy.file() },
    );
    for (const line of BITCOIN_CONFIG_OPTIONS.rpcuser.description) {
      expect(fileContents.includes(`# ${line}`)).toBe(true);
    }
  });

  it('does not write option description of implicitly undefined values as comments', () => {
    const [{ fileContents }] = writeConfigFiles(
      { rpcuser: undefined },
      { conf: tempy.file() },
    );
    for (const line of BITCOIN_CONFIG_OPTIONS.rpcpassword.description) {
      expect(fileContents.includes(`# ${line}`)).toBe(false);
    }
  });

  it('writes section header for explicitly defined `sections` property', () => {
    const [{ fileContents }] = writeConfigFiles(
      {
        sections: {
          main: {},
        },
      },
      { conf: tempy.file() },
    );
    expect(fileContents).toMatch(/^\[main\]$/m);
  });
});
