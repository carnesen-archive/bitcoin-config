import { BITCOIN_CONFIG_OPTIONS, Value, SectionDependentDefaultValue } from './options';
import { SectionName, SectionSelectionOptionName } from './names';

type Options = typeof BITCOIN_CONFIG_OPTIONS;
type OptionName = keyof Options;

export type BitcoinConfig = { [K in OptionName]?: Value<Options[K]['typeName']> };

export type SectionSelectionConfig = Pick<BitcoinConfig, SectionSelectionOptionName>;

type NonSectionSelectionOptionName = Exclude<OptionName, keyof SectionSelectionConfig>;

export type DefaultConfig<T extends SectionName> = {
  [K in NonSectionSelectionOptionName]: Options[K]['defaultValue'] extends SectionDependentDefaultValue<
    Options[K]['typeName']
  >
    ? Options[K]['defaultValue'][T]
    : Options[K]['defaultValue']
};

type SectionOptionName<T extends SectionName> = {
  [K in OptionName]: (Options)[K]['notAllowedIn'] extends { [K in T]: true } ? never : K
}[OptionName];

type SectionConfig<T extends SectionName> = {
  [K in SectionOptionName<T>]?: BitcoinConfig[K]
};

export type Sections = { [K in SectionName]?: SectionConfig<K> };

export type SectionedConfig = BitcoinConfig & {
  sections?: Sections;
};
