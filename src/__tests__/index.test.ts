import {
  readConfigFiles,
  writeConfigFile,
  BitcoinConfig,
  SectionedBitcoinConfig,
  getRpcHref,
} from '..';
import * as tempy from 'tempy';
import { getDefaultConfig } from '../default';
import { mergeUpActiveSectionConfig } from '../merge';

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

  it('exports types `BitcoinConfig` and `SectionedBitcoinConfig`', () => {
    // Sectioned and non-Sectioned BitcoinConfig's are almost the same.
    // The Sectioned one just has one additional optional property "sections".
    const bitcoinConfig: BitcoinConfig = { rpcport: 123 };
    const sectionedBitcoinConfig: SectionedBitcoinConfig = { rpcport: 123, sections: {} };
    (bitcoinConfig as SectionedBitcoinConfig).sections = {};
    expect(sectionedBitcoinConfig).toEqual(bitcoinConfig);
  });

  it('reads and writes consistently', () => {
    const conf = tempy.file();
    const expectedBitcoinConfig: BitcoinConfig = {
      rpcuser: 'carnesen',
      rpcpassword: '12345678',
    };
    writeConfigFile(expectedBitcoinConfig, { conf });
    const bitcoinConfig = readConfigFiles({ conf });
    expect(bitcoinConfig).toEqual(expectedBitcoinConfig);
  });

  it('behaves sanely with respect to writing and then reading defaults', () => {
    const defaultConfig = getDefaultConfig('main');
    const conf = tempy.file();
    writeConfigFile(defaultConfig, { conf });
    const bitcoinConfig = readConfigFiles({ conf });
    expect(mergeUpActiveSectionConfig(defaultConfig)).toEqual(bitcoinConfig);
  });
});
