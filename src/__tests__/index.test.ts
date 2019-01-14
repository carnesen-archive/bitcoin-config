import {
  readConfigFiles,
  writeConfigFile,
  BitcoinConfig,
  SectionedConfig,
  getRpcHref,
  DEFAULT_CONFIG_FILE_NAME,
  getDefaultConfig,
} from '..';
import * as tempy from 'tempy';
import { mergeUpActiveSectionConfig } from '../merge';
import {} from '../default';

describe('index', () => {
  it('exports the function named `readConfigFiles`', () => {
    expect(typeof readConfigFiles).toBe('function');
    expect(readConfigFiles.name).toBe('readConfigFiles');
  });

  it('exports a function named `writeConfigFiles`', () => {
    expect(typeof writeConfigFile).toBe('function');
    expect(writeConfigFile.name).toBe('writeConfigFile');
  });

  it('exports a function named `getRpcHref`', () => {
    expect(typeof getRpcHref).toBe('function');
    expect(getRpcHref.name).toBe('getRpcHref');
  });

  it('exports string literal constant BITCOIN_CONF', () => {
    expect(typeof DEFAULT_CONFIG_FILE_NAME).toBe('string');
    // $ExpectType "bitcoin.conf"
    DEFAULT_CONFIG_FILE_NAME;
  });

  it('exports types `BitcoinConfig` and `SectionedConfig`', () => {
    // Sectioned and non-Sectioned BitcoinConfig's are almost the same.
    // The Sectioned one just has one additional optional property "sections".
    const bitcoinConfig: BitcoinConfig = { rpcport: 123 };
    const sectionedConfig: SectionedConfig = { rpcport: 123, sections: {} };
    (bitcoinConfig as SectionedConfig).sections = {};
    expect(sectionedConfig).toEqual(bitcoinConfig);
  });

  it('behaves sanely reading and writing a little config', () => {
    const filePath = tempy.file();
    const expectedConfig: BitcoinConfig = {
      rpcuser: 'carnesen',
      rpcpassword: '12345678',
    };
    writeConfigFile(filePath, expectedConfig);
    const config = readConfigFiles(filePath);
    expect(config).toEqual(expectedConfig);
  });

  it('behaves sanely with respect to writing and then reading defaults', () => {
    const defaultConfig = getDefaultConfig('main');
    const filePath = tempy.file();
    writeConfigFile(filePath, defaultConfig);
    const bitcoinConfig = readConfigFiles(filePath);
    expect(mergeUpActiveSectionConfig(defaultConfig)).toEqual(bitcoinConfig);
  });
});
