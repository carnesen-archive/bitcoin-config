import { getDefaultConfig } from '../default';
import { homedir, platform } from 'os';
import { join } from 'path';

describe(getDefaultConfig.name, () => {
  it('by default returns a config for the current platform', () => {
    expect(getDefaultConfig('main')).toEqual(getDefaultConfig('main', platform()));
  });

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

  it('returns a macos-specific datadir on mac', () => {
    const defaults = getDefaultConfig('main', 'darwin');
    expect(defaults.datadir).toMatch('Application Support');
  });

  it('returns a windows-specific datadir on windows', () => {
    const originalEnvValue = process.env.APPDATA;
    const temporaryEnvValue = 'C:\\Users\\carnesen';
    process.env.APPDATA = temporaryEnvValue;
    const defaults = getDefaultConfig('main', 'win32');
    expect(defaults.datadir).toMatch(process.env.APPDATA);
    process.env.APPDATA = originalEnvValue;
  });

  it('returns linux default datadir if platform is not windows or macos', () => {
    const defaults = getDefaultConfig('main', 'aix');
    expect(defaults.datadir).toMatch(join(homedir(), '.bitcoin'));
  });
});
