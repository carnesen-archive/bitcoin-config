import { BitcoinConfig } from './types';

// Options with value undefined are copied into the merged config.
// Options with array values are merged together with config0 values coming first.
export function mergeBitcoinConfigs(
  bitcoinConfig0: BitcoinConfig,
  bitcoinConfig1: BitcoinConfig,
) {
  const mergedBitcoinConfig: BitcoinConfig = {};
  const optionNames0 = Object.keys(bitcoinConfig0);
  const optionNames1 = Object.keys(bitcoinConfig1);
  const uniqueOptionNames = new Set([...optionNames0, ...optionNames1]);
  for (const optionName of uniqueOptionNames) {
    const value0 = bitcoinConfig0[optionName as keyof typeof bitcoinConfig0];
    const value1 = bitcoinConfig1[optionName as keyof typeof bitcoinConfig1];
    if (typeof value0 !== 'undefined') {
      if (Array.isArray(value0) && Array.isArray(value1)) {
        mergedBitcoinConfig[optionName as keyof typeof mergedBitcoinConfig] = [
          ...value0,
          ...value1,
        ];
        continue;
      }
      mergedBitcoinConfig[optionName as keyof typeof mergedBitcoinConfig] = value0;
      continue;
    }
    if (typeof value1 !== 'undefined') {
      mergedBitcoinConfig[optionName as keyof typeof mergedBitcoinConfig] = value1;
      continue;
    }
    mergedBitcoinConfig[optionName as keyof typeof mergedBitcoinConfig] = undefined;
  }
  return mergedBitcoinConfig;
}
