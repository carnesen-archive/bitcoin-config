import { BITCOIN_CONFIG_OPTIONS } from '../bitcoin-config-options';
import { serializeConfig } from '../serialize-config';

describe(serializeConfig.name, () => {
  it('returns a serialized bitcoin configuration string', () => {
    const returnValue = serializeConfig({ rpcuser: 'foo' });
    expect(typeof returnValue).toBe('string');
  });

  it('serialized config includes a header comment line', () => {
    const serializedConfig = serializeConfig({});
    expect(serializedConfig).toMatch(/^# .* written using @carnesen\/bitcoin-config/);
  });

  it('serializes string option as name=value', () => {
    const serializedConfig = serializeConfig({ rpcuser: 'sinh' });
    expect(serializedConfig).toMatch(/^rpcuser=sinh$/m);
  });

  it('serializes number option as name=value', () => {
    const serializedConfig = serializeConfig({ banscore: 12 });
    expect(serializedConfig).toMatch(/^banscore=12$/m);
  });

  it('serializes boolean option value `true` as name=1', () => {
    const serializedConfig = serializeConfig({ blocksonly: true });
    expect(serializedConfig).toMatch(/^blocksonly=1$/m);
  });

  it('serializes boolean option value `false` as name=0', () => {
    const serializedConfig = serializeConfig({ blocksonly: false });
    expect(serializedConfig).toMatch(/^blocksonly=0$/m);
  });

  it('serializes explicitly undefined values as comments "#name="', () => {
    const serializedConfig = serializeConfig({ rpcuser: undefined });
    expect(serializedConfig).toMatch(/^#rpcuser=$/m);
  });

  it('serializes multi-valued string option as multiple name=value pairs', () => {
    const serializedConfig = serializeConfig({ rpcauth: ['foo', 'bar'] });
    expect(serializedConfig).toMatch(/^rpcauth=foo\n\r?rpcauth=bar$/m);
  });

  it('serializes option description of defined values as comments', () => {
    const serializedConfig = serializeConfig({ rpcuser: 'carnesen' });
    for (const line of BITCOIN_CONFIG_OPTIONS.rpcuser.description.split('\n')) {
      expect(serializedConfig.includes(`# ${line}`)).toBe(true);
    }
  });

  it('serializes option description of explicitly undefined values as comments', () => {
    const serializedConfig = serializeConfig({ rpcuser: undefined });
    for (const line of BITCOIN_CONFIG_OPTIONS.rpcuser.description.split('\n')) {
      expect(serializedConfig.includes(`# ${line}`)).toBe(true);
    }
  });

  it('does not write option description of implicitly undefined values as comments', () => {
    const serializedConfig = serializeConfig({ rpcuser: undefined });
    for (const line of BITCOIN_CONFIG_OPTIONS.rpcpassword.description.split('\n')) {
      expect(serializedConfig.includes(`# ${line}`)).toBe(false);
    }
  });

  it('serializes section header for explicitly defined `sections` property', () => {
    const serializedConfig = serializeConfig({
      sections: {
        main: {},
      },
    });
    expect(serializedConfig).toMatch(/^\[main\]$/m);
  });
});
