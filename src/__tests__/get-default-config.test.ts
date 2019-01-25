import { getDefaultConfig } from '../get-default-config';

describe(getDefaultConfig.name, () => {
  it('returns an object of type DefaultConfig with literal-specific types', () => {
    // $ExpectType DefaultConfig<"main">
    const defaultConfig = getDefaultConfig('main');
    // $ExpectType 8332
    defaultConfig.rpcport;
    // $ExpectType undefined
    defaultConfig.rpcpassword;
    // $ExpectType ""
    defaultConfig.rpcuser;
  });

  it('returns a network-dependent value where appropriate', () => {
    expect(getDefaultConfig('main').rpcport).toBe(8332);
    expect(getDefaultConfig('test').rpcport).toBe(18332);
    expect(getDefaultConfig('regtest').rpcport).toBe(18443);
  });
});
