import { SectionedConfig } from './config';
import { findOption } from './find';
import { castToSectionName, TypeName, SectionName } from './names';
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

function parseLine(line: string, sectionName?: SectionName): SectionedConfig {
  const indexOfEqualsSign = line.indexOf('=');
  if (indexOfEqualsSign === -1) {
    throw new Error('Expected "name = value"');
  }
  const lhs = line.slice(0, indexOfEqualsSign).trim();
  const rhs = line.slice(indexOfEqualsSign + 1).trim();
  if (!sectionName) {
    const indexOfDot = lhs.indexOf('.');
    if (indexOfDot > -1) {
      // This line specifies the section using dot notation, e.g. main.uacomment=foo
      const maybeDotNotationSectionName = lhs.slice(0, indexOfDot);
      const dotNotationSectionName = castToSectionName(maybeDotNotationSectionName);
      const maybeOptionName = lhs.slice(indexOfDot + 1);
      const option = findOption(maybeOptionName, dotNotationSectionName);
      return {
        sections: {
          [dotNotationSectionName]: {
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
  const option = findOption(maybeOptionName, sectionName);
  return {
    sections: { [sectionName]: { [maybeOptionName]: parseValue(option.typeName, rhs) } },
  };
}

export function parseConfigFileContents(fileContents: string) {
  let sectionedConfig: SectionedConfig = {};
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
      sectionedConfig = mergeSectionedConfigs(
        sectionedConfig,
        parseLine(line, sectionName!),
      );
    } catch (ex) {
      throw new Error(`Parse error: ${ex.message}: line ${lineNumber}: ${originalLine}`);
    }
  }
  return sectionedConfig;
}
