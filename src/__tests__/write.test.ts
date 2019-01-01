import { isAbsolute, join } from 'path';
import * as tempy from 'tempy';
import { readFileSync, existsSync } from 'fs';

import { writeConfigFile } from '../write';
import { BITCOIN_CONFIG_OPTIONS } from '../options';

describe('writeConfigFiles', () => {
  it('writes bitcoin.conf in the specified datadir', () => {
    const datadir = tempy.directory();
    writeConfigFile({}, { datadir });
    expect(existsSync(join(datadir, 'bitcoin.conf'))).toBe(true);
  });

  it('merges location.datadir into written config if it does not have a datadir', () => {
    const datadir = tempy.directory();
    const [fileContents] = writeConfigFile({}, { datadir });
    expect(fileContents).toMatch(`datadir=${datadir}`);
  });

  it('does not merge location.datadir into written config if it has a datadir', () => {
    const datadir = tempy.directory();
    const [fileContents] = writeConfigFile({ datadir: '/foo/bar/baz' }, { datadir });
    expect(fileContents).toMatch(`datadir=/foo/bar/baz`);
  });

  it('writes file to "conf" if that option is provided as an absolute path', () => {
    const conf = tempy.file();
    writeConfigFile({}, { conf });
    expect(existsSync(conf)).toBe(true);
  });

  it('throws "datadir is only allowed" if datadir is provided and conf is an absolute path', () => {
    const conf = tempy.file();
    expect(isAbsolute(conf)).toBe(true);
    const datadir = '/foo/bar/baz';
    expect(() => writeConfigFile({}, { conf, datadir })).toThrow(
      'datadir is only allowed',
    );
  });

  it('interprets "conf" as datadir-relative if it is not an absolute path', () => {
    const datadir = tempy.directory();
    const conf = 'non-standard-filename.conf';
    writeConfigFile({}, { datadir, conf });
    expect(existsSync(join(datadir, conf))).toBe(true);
  });

  it('throws "ENOENT" if specified datadir does not exist', () => {
    const datadir = tempy.file();
    // ^^ tempy.file() is basically just tempy.directory() without the mkdir
    expect(() => writeConfigFile({}, { datadir })).toThrow('ENOENT');
  });

  it('throws "ENOENT" if conf is provided in a directory that does not already exist', () => {
    const conf = join(tempy.file(), 'some-filename.conf');
    // ^^ tempy.file() is basically just tempy.directory() without the mkdir
    expect(() => writeConfigFile({}, { datadir: conf })).toThrow('ENOENT');
  });

  it('creates a backup of an existing file first if one exists', () => {
    const conf = tempy.file();
    writeConfigFile({ rpcuser: 'foo' }, { conf });
    const fileContents = readFileSync(conf, 'utf8');
    writeConfigFile({ rpcuser: 'bar' }, { conf });
    const backupFileContents = readFileSync(`${conf}.bak`, 'utf8');
    expect(fileContents).toBe(backupFileContents);
  });

  it('returns an array of the file paths and contents that were written', () => {
    const filePath = tempy.file();
    const returnValue = writeConfigFile({ rpcuser: 'foo' }, { conf: filePath });
    const fileContents = readFileSync(filePath, 'utf8');
    expect(returnValue).toEqual([fileContents, filePath]);
  });

  it('writes a header comment line', () => {
    const [fileContents] = writeConfigFile({}, { conf: tempy.file() });
    expect(fileContents).toMatch(/^# .* written by/);
  });

  it('writes string option as name=value', () => {
    const [fileContents] = writeConfigFile({ rpcuser: 'sinh' }, { conf: tempy.file() });
    expect(fileContents).toMatch(/^rpcuser=sinh$/m);
  });

  it('writes number option as name=value', () => {
    const [fileContents] = writeConfigFile({ banscore: 12 }, { conf: tempy.file() });
    expect(fileContents).toMatch(/^banscore=12$/m);
  });

  it('writes boolean option value `true` as name=1', () => {
    const [fileContents] = writeConfigFile({ blocksonly: true }, { conf: tempy.file() });
    expect(fileContents).toMatch(/^blocksonly=1$/m);
  });

  it('writes boolean option value `false` as name=0', () => {
    const [fileContents] = writeConfigFile({ blocksonly: false }, { conf: tempy.file() });
    expect(fileContents).toMatch(/^blocksonly=0$/m);
  });

  it('writes explicitly undefined values as comments "#name="', () => {
    const [fileContents] = writeConfigFile(
      { rpcuser: undefined },
      { conf: tempy.file() },
    );
    expect(fileContents).toMatch(/^#rpcuser=$/m);
  });

  it('writes multi-valued string option as multiple name=value pairs', () => {
    const [fileContents] = writeConfigFile(
      { rpcauth: ['foo', 'bar'] },
      { conf: tempy.file() },
    );
    expect(fileContents).toMatch(/^rpcauth=foo\n\r?rpcauth=bar$/m);
  });

  it('writes option description of defined values as comments', () => {
    const [fileContents] = writeConfigFile(
      { rpcauth: ['foo', 'bar'] },
      { conf: tempy.file() },
    );
    for (const line of BITCOIN_CONFIG_OPTIONS.rpcauth.description) {
      expect(fileContents.includes(`# ${line}`)).toBe(true);
    }
  });

  it('writes option description of explicitly undefined values as comments', () => {
    const [fileContents] = writeConfigFile(
      { rpcuser: undefined },
      { conf: tempy.file() },
    );
    for (const line of BITCOIN_CONFIG_OPTIONS.rpcuser.description) {
      expect(fileContents.includes(`# ${line}`)).toBe(true);
    }
  });

  it('does not write option description of implicitly undefined values as comments', () => {
    const [fileContents] = writeConfigFile(
      { rpcuser: undefined },
      { conf: tempy.file() },
    );
    for (const line of BITCOIN_CONFIG_OPTIONS.rpcpassword.description) {
      expect(fileContents.includes(`# ${line}`)).toBe(false);
    }
  });

  it('throws "conf or datadir" if neither conf nor datadir is provided', () => {
    expect(() => {
      writeConfigFile({}, {} as { datadir: string });
    }).toThrow('conf or datadir');
  });

  it('writes section header for explicitly defined `sections` property', () => {
    const [fileContents] = writeConfigFile(
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
