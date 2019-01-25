import { TypeName } from './names';

export function parseValue(typeName: TypeName, str: string) {
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
