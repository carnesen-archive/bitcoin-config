import {
  BITCOIN_CONFIG_OPTIONS,
  Value,
  ChainDependentDefaultValue,
} from './bitcoin-config-options';
import { ChainName, ChainSelectionOptionName } from './names';

type Options = typeof BITCOIN_CONFIG_OPTIONS;
type OptionName = keyof Options;

export type BitcoinConfig = { [K in OptionName]?: Value<Options[K]['typeName']> };
export type NullableBitcoinConfig = {
  [K in keyof BitcoinConfig]: BitcoinConfig[K] | null
};

export type ChainSelectionConfig = Pick<BitcoinConfig, ChainSelectionOptionName>;

type NotChainSelectionOptionName = Exclude<OptionName, keyof ChainSelectionConfig>;

export type DefaultConfig<T extends ChainName> = {
  [K in NotChainSelectionOptionName]: Options[K]['defaultValue'] extends ChainDependentDefaultValue<
    Options[K]['typeName']
  >
    ? Options[K]['defaultValue'][T]
    : Options[K]['defaultValue']
};

type SectionOptionName<T extends ChainName> = {
  [K in OptionName]: (Options)[K]['notAllowedIn'] extends { [K in T]: true } ? never : K
}[OptionName];

type SectionConfig<T extends ChainName> = {
  [K in SectionOptionName<T>]?: BitcoinConfig[K]
};

type NullableSectionConfig<T extends ChainName> = {
  [K in keyof SectionConfig<T>]: SectionConfig<T>[K] | null
};

export type Sections = { [K in ChainName]?: SectionConfig<K> };

type NullableSections = { [K in ChainName]?: NullableSectionConfig<K> | null };

export type SectionedConfig = BitcoinConfig & {
  sections?: Sections;
};

export type NullableSectionedConfig = NullableBitcoinConfig & {
  sections?: NullableSections | null;
};
