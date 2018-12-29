import { isAbsolute, join } from 'path';
import { getDefaultDatadir } from './default';
import { BITCOIN_CONFIG_OPTIONS, UNKNOWN_OPTION, NotAllowedIn } from './options';
import { SectionName } from './names';

export function toAbsolute(conf: string, datadir?: string) {
  if (isAbsolute(conf)) {
    return conf;
  }
  if (datadir && !isAbsolute(datadir)) {
    throw new Error('Path "datadir" must be absolute');
  }
  return join(datadir || getDefaultDatadir(), conf);
}

export function findOption(maybeOptionName: string, sectionName?: SectionName) {
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
