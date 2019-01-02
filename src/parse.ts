import { SectionedConfig } from './config';
import { findOption } from './find';
import { castToChainName, TypeName, ChainName } from './names';
import { mergeSectionedConfigs } from './merge';

function parseValue(typeName: TypeName, str: string) {
  switch (typeName) {
    case 'string': {
      return str;
    }
    case 'string[]': {
      return [str];
    }
    case 'boolean': {
      // Booleans are surprisingly somewhat complex. See, e.g.:
      // https://github.com/bitcoin/bitcoin/pull/12713#discussion_r176128984
      // https://github.com/bitcoin/bitcoin/blob/2741b2b6f4688ee46caaa48b51c74a110320d50d/src/util/system.cpp#L189
      if (str.length === 0) {
        return true;
      }
      // The following reproduces C++'s "atoi" logic
      const leadingNumberRegExp = /^[+\-]?[0-9]*/;
      const matches = str.trim().match(leadingNumberRegExp);
      const num = matches ? Number(matches[0]) : 0;
      return num !== 0;
    }
    case 'number': {
      return Number(str);
    }
    default:
      throw new Error(`Unknown type name ${typeName}`);
  }
}

function parseLine(line: string, chainName?: ChainName): SectionedConfig {
  const indexOfEqualsSign = line.indexOf('=');
  if (indexOfEqualsSign === -1) {
    throw new Error('Expected "name = value"');
  }
  const lhs = line.slice(0, indexOfEqualsSign).trim();
  const rhs = line.slice(indexOfEqualsSign + 1).trim();
  if (!chainName) {
    const indexOfDot = lhs.indexOf('.');
    if (indexOfDot > -1) {
      // This line specifies the section using dot notation, e.g. main.uacomment=foo
      const maybeDotNotationChainName = lhs.slice(0, indexOfDot);
      const dotNotationChainName = castToChainName(maybeDotNotationChainName);
      const maybeOptionName = lhs.slice(indexOfDot + 1);
      const option = findOption(maybeOptionName, dotNotationChainName);
      return {
        sections: {
          [dotNotationChainName]: {
            [maybeOptionName]: parseValue(option.typeName, rhs),
          },
        },
      };
    }
    // This line does not use dot notation
    const maybeOptionName = lhs;
    const option = findOption(maybeOptionName);
    return { [maybeOptionName]: parseValue(option.typeName, rhs) };
  }
  if (lhs.indexOf('.') > -1) {
    throw new Error('Dot notation is only allowed in top section');
  }
  const maybeOptionName = lhs;
  const option = findOption(maybeOptionName, chainName);
  return {
    sections: { [chainName]: { [maybeOptionName]: parseValue(option.typeName, rhs) } },
  };
}

export function parseConfigFileContents(fileContents: string) {
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
