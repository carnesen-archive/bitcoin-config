import { BITCOIN_CONFIG_OPTIONS, Value } from './options';
import { SectionName } from './names';

type Options = typeof BITCOIN_CONFIG_OPTIONS;
type OptionName = keyof Options;

export type BitcoinConfig = { [K in OptionName]?: Value<Options[K]['typeName']> };

export type DefaultConfig = {
  [K in OptionName]:
    | Value<Options[K]['typeName']>
    | (Options[K]['defaultValue'] extends undefined ? undefined : never)
};

type SectionOptionName<T extends SectionName> = {
  [K in OptionName]: (Options)[K]['notAllowedIn'] extends { [K in T]: true } ? never : K
}[OptionName];

type SectionConfig<T extends SectionName> = {
  [K in SectionOptionName<T>]?: BitcoinConfig[K]
};

export type Sections = { [K in SectionName]?: SectionConfig<K> };

export type SectionedBitcoinConfig = BitcoinConfig & {
  sections?: Sections;
};
