export type TypeName = 'string' | 'string[]' | 'boolean' | 'number';

export const CHAIN_NAMES = ['main' as 'main', 'regtest' as 'regtest', 'test' as 'test'];
export type ChainName = (typeof CHAIN_NAMES)[number];
export function castToChainName(maybeChainName: string) {
  const chainName = maybeChainName as ChainName;
  if (!CHAIN_NAMES.includes(chainName)) {
    throw new Error(`Expected name to be one of ${CHAIN_NAMES}`);
  }
  return chainName;
}

export const CHAIN_SELECTION_OPTION_NAMES = [
  'regtest' as 'regtest',
  'testnet' as 'testnet',
];
export type ChainSelectionOptionName = (typeof CHAIN_SELECTION_OPTION_NAMES)[number];
