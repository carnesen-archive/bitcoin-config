import { EOL } from 'os';

import { Value } from './bitcoin-config-options';
import { TypeName } from './names';

export function serializeOption(optionName: string, optionValue?: Value<TypeName>) {
  if (typeof optionValue === 'undefined') {
    return `#${optionName}=`;
  }
  if (Array.isArray(optionValue)) {
    return optionValue
      .map(optionValueItem => `${optionName}=${optionValueItem}`)
      .join(EOL);
  }
  if (optionValue === true) {
    return `${optionName}=1`;
  }
  if (optionValue === false) {
    return `${optionName}=0`;
  }
  return `${optionName}=${optionValue}`;
}
