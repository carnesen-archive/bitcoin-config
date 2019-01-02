import { BITCOIN_CONFIG_OPTIONS, NotAllowedIn } from './options';
import { SectionName } from './names';

export function findOption(maybeOptionName: string, sectionName?: SectionName) {
  if (maybeOptionName.length === 0) {
    throw new Error('Empty option name');
  }
  if (maybeOptionName.startsWith('-')) {
    throw new Error('Options in a configuration file must not have a leading "-"');
  }
  const alphanumericOrHyphenRegExp = /[^\w\-]/gi;
  if (maybeOptionName.replace(alphanumericOrHyphenRegExp, '') !== maybeOptionName) {
    throw new Error(`Invalid option name "${maybeOptionName}"`);
  }
  const found = Object.entries(BITCOIN_CONFIG_OPTIONS).find(
    ([optionName]) => optionName === maybeOptionName,
  );
  if (!found) {
    throw new Error(`Unknown option "${maybeOptionName}"`);
  }
  const [, option] = found;
  if (
    sectionName &&
    option.notAllowedIn &&
    (option.notAllowedIn as NotAllowedIn)[sectionName]
  ) {
    throw new Error(
      `Option "${maybeOptionName}" is not allowed in section "${sectionName}"`,
    );
  }
  return option;
}
