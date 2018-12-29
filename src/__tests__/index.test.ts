import {
  readConfigFiles,
  writeConfigFiles,
  BitcoinConfig,
  SectionedBitcoinConfig,
} from '..';
import * as tempy from 'tempy';
import { getDefaults } from '../default';
import { mergeUpActiveSectionConfig } from '../merge';

describe('index', () => {
  it('exports the function named `readConfigFiles`', () => {
    expect(typeof readConfigFiles).toBe('function');
    expect(readConfigFiles.name).toBe('readConfigFiles');
  });

  it('exports a function named `writeConfigFiles`', () => {
    expect(typeof writeConfigFiles).toBe('function');
    expect(writeConfigFiles.name).toBe('writeConfigFiles');
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
    writeConfigFiles(expectedBitcoinConfig, { conf });
    const bitcoinConfig = readConfigFiles({ conf });
    expect(bitcoinConfig).toEqual(expectedBitcoinConfig);
  });

  it('behaves sanely with respect to defaults', () => {
    const defaults = getDefaults();
    const conf = tempy.file();
    writeConfigFiles(defaults, { conf });
    const bitcoinConfig = readConfigFiles({ conf });
    expect(mergeUpActiveSectionConfig(defaults)).toEqual(bitcoinConfig);
  });
});
