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

  it('throws "unknown option" if the config file contains unknown options', () => {
    expect(() => {
      readConfigFiles(tempWrite.sync('foo=bar'));
    }).toThrow('Unknown option "foo"');
  });

  it('ignores spaces around keys', () => {
    const config = readConfigFiles(tempWrite.sync('rpcuser  =  foo'));
    expect(config.rpcuser === 'foo').toEqual(true);
  });

  it('attaches a value of a "string" option as a string', () => {
    const config = readConfigFiles(tempWrite.sync('rpcuser=foo'));
    expect(config.rpcuser === 'foo').toEqual(true);
  });

  it('attaches a zero-length value of a "string" option as a zero-length string', () => {
    const config = readConfigFiles(tempWrite.sync('rpcuser='));
    expect(config.rpcuser).toEqual('');
  });

  it('attaches a value of a "string[]" option as a string array', () => {
    const config = readConfigFiles(tempWrite.sync('rpcauth=foo'));
    expect(config.rpcauth![0] === 'foo').toEqual(true);
  });

  it('attaches a value of a "number" option as a number', () => {
    const config = readConfigFiles(tempWrite.sync('rpcport=12345'));
    expect(config.rpcport === 12345).toEqual(true);
  });

  it('attaches a value "1" of a "boolean" option as true', () => {
    const config = readConfigFiles(tempWrite.sync('blocksonly=1'));
    expect(config).toEqual({ blocksonly: true });
  });

  it('attaches a value "0" of a "boolean" option as false', () => {
    const config = readConfigFiles(tempWrite.sync('blocksonly=0'));
    expect(config).toEqual({ blocksonly: false });
  });

  it('attaches an undefined value of a "boolean" option as `true`', () => {
    const config = readConfigFiles(tempWrite.sync('blocksonly='));
    expect(config).toEqual({ blocksonly: true });
  });

  it('attaches a value "+123foo" of a "boolean" option as true', () => {
    const config = readConfigFiles(tempWrite.sync('blocksonly=+123foo'));
    expect(config).toEqual({ blocksonly: true });
  });

  it('attaches a value "true" of a "boolean" option as false', () => {
    const config = readConfigFiles(tempWrite.sync('blocksonly=true'));
    expect(config).toEqual({ blocksonly: false });
  });

  it('takes only the first value if the option has typeName "string"', () => {
    const config = readConfigFiles(tempWrite.sync('rpcuser=foo \n rpcuser=bar'));
    expect(config).toEqual({ rpcuser: 'foo' });
  });

  it('takes only the first value if the option has typeName "number"', () => {
    const config = readConfigFiles(tempWrite.sync('rpcport=12345 \n rpcport=55555'));
    expect(config).toEqual({ rpcport: 12345 });
  });

  it('takes only the first value if the option has typeName "boolean"', () => {
    const config = readConfigFiles(tempWrite.sync('blocksonly=1 \n blocksonly=0'));
    expect(config).toEqual({ blocksonly: true });
  });

  it('appends additional values if the option has typeName "string[]"', () => {
    const config = readConfigFiles(tempWrite.sync('rpcauth=foo \n rpcauth=bar'));
    expect(config).toEqual({ rpcauth: ['foo', 'bar'] });
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

  it('allows user to specify network using dot notation in top section', () => {
    const config = readConfigFiles(
      tempWrite.sync('testnet=1 \n main.rpcuser=jim \n test.rpcpassword=123'),
    );
    expect(config).toEqual({ testnet: true, rpcpassword: '123' });
  });

  it('throws "Parse error" with the line number and line text if a line is bad', () => {
    expect(() => {
      readConfigFiles(tempWrite.sync('\n\n foo bar baz'));
    }).toThrow(/Parse error:.*line 3:  foo bar baz/);
  });

  it('throws "regtest and testnet" error if both are set to true', () => {
    expect(() => {
      readConfigFiles(tempWrite.sync('regtest=1 \n testnet=1'));
    }).toThrow('regtest and testnet');
  });

  it('throws "Expected...main,regtest,test" if it contains a bad section name', () => {
    expect(() => {
      readConfigFiles(tempWrite.sync('[foo]'));
    }).toThrow(/Expected.*main,regtest,test/);
  });

  it('throws "empty option name" if a line has an empty option name', () => {
    expect(() => {
      readConfigFiles(tempWrite.sync('=foo'));
    }).toThrow('Empty option name');
  });

  it('throws "invalid option name" if an option name has whitespace', () => {
    expect(() => {
      readConfigFiles(tempWrite.sync('rpc user=gwen'));
    }).toThrow('Invalid option name');
  });

  it('throws "invalid option name" if an option name has brackets', () => {
    expect(() => {
      readConfigFiles(tempWrite.sync('[test]=1'));
    }).toThrow('Invalid option name');
  });

  it('throws "invalid option name" if an option name has brackets', () => {
    expect(() => {
      readConfigFiles(tempWrite.sync('[test]=1'));
    }).toThrow('Invalid option name');
  });

  it('does not throw "invalid option name" if an option name has a hyphen', () => {
    expect(readConfigFiles(tempWrite.sync('reindex-chainstate=1'))).toEqual({
      'reindex-chainstate': true,
    });
  });

  it('throws "not allowed to have includeconf" if an included conf has an includeconf', () => {
    const includedFilePath = tempWrite.sync('includeconf=anything.conf');
    const entryFilePath = tempWrite.sync(`includeconf=${includedFilePath}`);
    expect(() => readConfigFiles(entryFilePath)).toThrow(
      'not allowed to have includeconf',
    );
  });

  it('throws "not allowed" if an option appears in a section in which it is not allowed', () => {
    expect(() => readConfigFiles(tempWrite.sync('[main] \n vbparams=foo'))).toThrow(
      'not allowed',
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

  it('throws "rpcpassword option ... comments" if rpcpassword line has a comment', () => {
    expect(() => {
      readConfigFiles(
        tempWrite.sync('rpcpassword=foo # comment is not allowed on this line'),
      );
    }).toThrow(/rpcpassword option.*comments/);
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
