import { BitcoinConfig, NullableBitcoinConfig } from './types';

export function updateBitcoinConfig(config: BitcoinConfig, delta: NullableBitcoinConfig) {
  const nextConfig = { ...config };
  for (const [deltaName, deltaValue] of Object.entries(delta)) {
    if (deltaValue === null) {
      delete (nextConfig as any)[deltaName];
    } else {
      (nextConfig as any)[deltaName] = deltaValue;
    }
  }
  return nextConfig;
}
