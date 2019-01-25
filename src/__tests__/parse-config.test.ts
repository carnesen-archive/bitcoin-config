import { parseConfig } from '../parse-config';

describe(parseConfig.name, () => {
  it('throws "unknown option" if the config file contains unknown options', () => {
    expect(() => {
      parseConfig('foo=bar');
    }).toThrow('Unknown option "foo"');
  });

  it('ignores spaces around keys', () => {
    const config = parseConfig('rpcuser  =  foo');
    expect(config.rpcuser === 'foo').toEqual(true);
  });

  it('attaches a value of a "string" option as a string', () => {
    const config = parseConfig('rpcuser=foo');
    expect(config.rpcuser === 'foo').toEqual(true);
  });

  it('attaches a zero-length value of a "string" option as a zero-length string', () => {
    const config = parseConfig('rpcuser=');
    expect(config.rpcuser).toEqual('');
  });

  it('attaches a value of a "string[]" option as a string array', () => {
    const config = parseConfig('rpcauth=foo');
    expect(config.rpcauth![0] === 'foo').toEqual(true);
  });

  it('attaches a value of a "number" option as a number', () => {
    const config = parseConfig('rpcport=12345');
    expect(config.rpcport === 12345).toEqual(true);
  });

  it('attaches a value "1" of a "boolean" option as true', () => {
    const config = parseConfig('blocksonly=1');
    expect(config).toEqual({ blocksonly: true });
  });

  it('attaches a value "0" of a "boolean" option as false', () => {
    const config = parseConfig('blocksonly=0');
    expect(config).toEqual({ blocksonly: false });
  });

  it('attaches an undefined value of a "boolean" option as `true`', () => {
    const config = parseConfig('blocksonly=');
    expect(config).toEqual({ blocksonly: true });
  });

  it('attaches a value "+123foo" of a "boolean" option as true', () => {
    const config = parseConfig('blocksonly=+123foo');
    expect(config).toEqual({ blocksonly: true });
  });

  it('attaches a value "true" of a "boolean" option as false', () => {
    const config = parseConfig('blocksonly=true');
    expect(config).toEqual({ blocksonly: false });
  });

  it('takes only the first value if the option has typeName "string"', () => {
    const config = parseConfig('rpcuser=foo \n rpcuser=bar');
    expect(config).toEqual({ rpcuser: 'foo' });
  });

  it('takes only the first value if the option has typeName "number"', () => {
    const config = parseConfig('rpcport=12345 \n rpcport=55555');
    expect(config).toEqual({ rpcport: 12345 });
  });

  it('takes only the first value if the option has typeName "boolean"', () => {
    const config = parseConfig('blocksonly=1 \n blocksonly=0');
    expect(config).toEqual({ blocksonly: true });
  });

  it('appends additional values if the option has typeName "string[]"', () => {
    const config = parseConfig('rpcauth=foo \n rpcauth=bar');
    expect(config).toEqual({ rpcauth: ['foo', 'bar'] });
  });

  it('allows user to specify network using dot notation in top section', () => {
    const config = parseConfig('testnet=1 \n main.rpcuser=jim');
    expect(config).toEqual({ testnet: true, sections: { main: { rpcuser: 'jim' } } });
  });

  it('throws "Parse error" with the line number and line text if a line is bad', () => {
    expect(() => {
      parseConfig('\n\n foo bar baz');
    }).toThrow(/Parse error:.*line 3:  foo bar baz/);
  });

  it('throws "Expected...main,regtest,test" if it contains a bad section name', () => {
    expect(() => {
      parseConfig('[foo]');
    }).toThrow(/Expected.*main,regtest,test/);
  });

  it('throws "empty option name" if a line has an empty option name', () => {
    expect(() => {
      parseConfig('=foo');
    }).toThrow('Empty option name');
  });

  it('throws "invalid option name" if an option name has whitespace', () => {
    expect(() => {
      parseConfig('rpc user=gwen');
    }).toThrow('Invalid option name');
  });

  it('throws "invalid option name" if an option name has brackets', () => {
    expect(() => {
      parseConfig('[test]=1');
    }).toThrow('Invalid option name');
  });

  it('throws "invalid option name" if an option name has brackets', () => {
    expect(() => {
      parseConfig('[test]=1');
    }).toThrow('Invalid option name');
  });

  it('does not throw "invalid option name" if an option name has a hyphen', () => {
    expect(parseConfig('reindex-chainstate=1')).toEqual({
      'reindex-chainstate': true,
    });
  });

  it('throws "not allowed" if an option appears in a section in which it is not allowed', () => {
    expect(() => parseConfig('[main] \n vbparams=foo')).toThrow('not allowed');
  });

  it('throws "must not have a leading" if an option name starts with "-"', () => {
    expect(() => parseConfig('-vbparams=foo')).toThrow('must not have a leading');
  });

  it('throws "only allowed in top" if an option uses dot notation in a network section', () => {
    expect(() => {
      parseConfig('[main] \n test.rpcuser=don');
    }).toThrow('only allowed in top');
  });

  it('throws "rpcpassword option ... comments" if rpcpassword line has a comment', () => {
    expect(() => {
      parseConfig('rpcpassword=foo # comment is not allowed on this line');
    }).toThrow(/rpcpassword option.*comments/);
  });
});
