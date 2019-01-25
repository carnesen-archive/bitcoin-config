import { SectionedConfig } from './types';
import { castToChainName, ChainName } from './names';
import { parseLine } from './parse-line';
import { mergeSectionedConfigs } from './merge-sectioned-configs';

export function parseConfig(fileContents: string) {
  let sectionedConfig: SectionedConfig = {};
  let chainName: ChainName;

  let lineNumber = 0;
  for (const originalLine of fileContents.split('\n')) {
    lineNumber = lineNumber + 1;
    try {
      let line = originalLine;

      // Remove comments
      const indexOfPoundSign = line.indexOf('#');
      if (indexOfPoundSign > -1) {
        line = line.slice(0, indexOfPoundSign);
        if (line.includes('rpcpassword')) {
          throw new Error('rpcpassword option line cannot have comments');
        }
      }

      // Trim whitespace
      line = line.trim();

      if (line.length === 0) {
        continue;
      }

      // [main/test/regtest] https://bitcoincore.org/en/releases/0.17.0/#configuration-sections-for-testnet-and-regtest
      if (line.startsWith('[') && line.endsWith(']')) {
        chainName = castToChainName(line.slice(1, -1));
        continue;
      }

      // name = value
      sectionedConfig = mergeSectionedConfigs(
        sectionedConfig,
        parseLine(line, chainName!),
      );
    } catch (ex) {
      throw new Error(`Parse error: ${ex.message}: line ${lineNumber}: ${originalLine}`);
    }
  }
  return sectionedConfig;
}
