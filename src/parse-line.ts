import { SectionedConfig } from './types';
import { findOption } from './find-option';
import { castToChainName, ChainName } from './names';
import { parseValue } from './parse-value';

export function parseLine(line: string, chainName?: ChainName): SectionedConfig {
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
