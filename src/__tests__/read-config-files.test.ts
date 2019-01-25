import tempWrite = require('temp-write');
import * as tempy from 'tempy';
import { readConfigFiles } from '../read-config-files';
import { writeFileSync } from 'fs';

describe(readConfigFiles.name, () => {
  it('reads bitcoin.conf in the default datadir if no arg is provided', () => {
    try {
      // This will succeed if you have a readable, parsable bitcoin.conf in your default datadir.
      // If your default datadir does not exist, it will throw ENOENT, which is expected.
      readConfigFiles();
    } catch (ex) {
      if (ex.code !== 'ENOENT') {
        throw ex;
      }
    }
  });

  it('reads bitcoin.conf at the specified path', () => {
    const filePath = tempWrite.sync('rpcuser=chris', 'bitcoin.conf');
    expect(readConfigFiles(filePath).rpcuser).toEqual('chris');
  });

  it('throws "is not absolute" if provided file path is not absolute', () => {
    expect(() => {
      readConfigFiles('bitcoin.conf');
    }).toThrow('is not absolute');
  });

  it('reads and merges in all "includeconf" files with absolute paths', () => {
    const includedFilePath0 = tempWrite.sync('rpcuser=satoshi \n [main] \n rpcauth=foo');
    const includedFilePath1 = tempWrite.sync(
      'rpcpassword=bitcoin \n [main] \n rpcauth=bar',
    );
    const filePath = tempWrite.sync(
      `includeconf=${includedFilePath0} \n includeconf=${includedFilePath1}`,
    );
    const config = readConfigFiles(filePath);
    expect(config).toEqual({
      includeconf: [includedFilePath0, includedFilePath1],
      rpcauth: ['foo', 'bar'],
      rpcuser: 'satoshi',
      rpcpassword: 'bitcoin',
    });
  });

  it('gets values from the "main" section if not in regtest or test mode', () => {
    const config = readConfigFiles(tempWrite.sync('[main] \n rpcuser=lisa'));
    expect(config).toEqual({ rpcuser: 'lisa' });
  });

  it('ignores values from non-"main" sections if not in regtest or test mode', () => {
    const config = readConfigFiles(tempWrite.sync('[regtest] \n rpcuser=lisa'));
    expect(config).toEqual({});
  });

  it('takes values from "regtest" section too if regtest is set to true in top', () => {
    const config = readConfigFiles(
      tempWrite.sync('regtest=1 \n [regtest] \n rpcuser=gwen'),
    );
    expect(config).toEqual({ regtest: true, rpcuser: 'gwen' });
  });

  it('takes values from "test" section too if testnet is set to true in top', () => {
    const config = readConfigFiles(tempWrite.sync('testnet=1 \n [test] \n rpcuser=gail'));
    expect(config).toEqual({ testnet: true, rpcuser: 'gail' });
  });

  it('does not attach "onlyAppliesToMain" options in top if selected network is not "main"', () => {
    const config = readConfigFiles(tempWrite.sync('testnet=1 \n rpcport=12345'));
    expect(config).toEqual({ testnet: true });
  });

  it('throws "regtest and testnet" error if both are set to true', () => {
    expect(() => {
      readConfigFiles(tempWrite.sync('regtest=1 \n testnet=1'));
    }).toThrow('regtest and testnet');
  });

  it('throws "not allowed to have includeconf" if an included conf has an includeconf', () => {
    const includedFilePath = tempWrite.sync('includeconf=anything.conf');
    const entryFilePath = tempWrite.sync(`includeconf=${includedFilePath}`);
    expect(() => readConfigFiles(entryFilePath)).toThrow(
      'not allowed to have includeconf',
    );
  });

  it('throws "must not have a leading" if an option name starts with "-"', () => {
    expect(() => readConfigFiles(tempWrite.sync('-vbparams=foo'))).toThrow(
      'must not have a leading',
    );
  });

  it('throws "only allowed in top" if an option uses dot notation in a network section', () => {
    expect(() => {
      readConfigFiles(tempWrite.sync('[main] \n test.rpcuser=don'));
    }).toThrow('only allowed in top');
  });

  it('throws ENOENT if conf is passed but does not exist', () => {
    expect(() => {
      readConfigFiles(tempy.file());
    }).toThrow('ENOENT');
  });

  it('rethrows any non-ENOENT read errors', () => {
    const filePath = tempy.file();
    writeFileSync(filePath, '', { mode: 0o000 });
    expect(() => {
      readConfigFiles(filePath);
    }).toThrow('permission denied');
  });
});
