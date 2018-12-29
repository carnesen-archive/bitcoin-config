import { SectionedBitcoinConfig } from './config';
import { findOption } from './util';
import { castToSectionName, TypeName, SectionName } from './names';
import { mergeSectionedBitcoinConfigs } from './merge';

function castToValue(typeName: TypeName, str: string) {
  if (str.length === 0) {
    return undefined;
  }
  switch (typeName) {
    case 'string': {
      return str;
    }
    case 'string[]': {
      return [str];
    }
    case 'boolean': {
      return str === '1';
    }
    case 'number': {
      return Number(str);
    }
    default:
      throw new Error(`Unknown type name ${typeName}`);
  }
}

function parseLine(line: string, sectionName?: SectionName): SectionedBitcoinConfig {
  const indexOfEqualsSign = line.indexOf('=');
  if (indexOfEqualsSign === -1) {
    throw new Error('Expected "name = value"');
  }
  const lhs = line.slice(0, indexOfEqualsSign).trim();
  if (lhs.length === 0) {
    throw new Error('Empty option name');
  }
  const rhs = line.slice(indexOfEqualsSign + 1).trim();
  if (!sectionName) {
    const indexOfDot = lhs.indexOf('.');
    if (indexOfDot > -1) {
      // This line specifies the section using dot notation, e.g. main.uacomment=foo
      const maybeDotNotationSectionName = lhs.slice(0, indexOfDot);
      const dotNotationSectionName = castToSectionName(maybeDotNotationSectionName);
      const maybeOptionName = lhs.slice(indexOfDot + 1);
      const { optionName, option } = findOption(maybeOptionName, dotNotationSectionName);
      return {
        sections: {
          [dotNotationSectionName]: { [optionName]: castToValue(option.typeName, rhs) },
        },
      };
    }
    // This line does not use dot notation
    const maybeOptionName = lhs;
    const { optionName, option } = findOption(maybeOptionName);
    return { [optionName]: castToValue(option.typeName, rhs) };
  }
  if (lhs.indexOf('.') > -1) {
    throw new Error('Dot notation is only allowed in top section');
  }
  const maybeOptionName = lhs;
  const { optionName, option } = findOption(maybeOptionName, sectionName);
  return {
    sections: { [sectionName]: { [optionName]: castToValue(option.typeName, rhs) } },
  };
}

export function parseConfigFileContents(fileContents: string) {
  let sectionedBitcoinConfig: SectionedBitcoinConfig = {};
  let sectionName: SectionName;

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
        sectionName = castToSectionName(line.slice(1, -1));
        continue;
      }

      // name = value
      sectionedBitcoinConfig = mergeSectionedBitcoinConfigs(
        sectionedBitcoinConfig,
        parseLine(line, sectionName!),
      );
    } catch (ex) {
      throw new Error(`Parse error: ${ex.message}: line ${lineNumber}: ${originalLine}`);
    }
  }
  return sectionedBitcoinConfig;
}
