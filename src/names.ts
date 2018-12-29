export type TypeName = 'string' | 'string[]' | 'boolean' | 'number';

export const SECTION_NAMES = ['main' as 'main', 'regtest' as 'regtest', 'test' as 'test'];
export type SectionName = (typeof SECTION_NAMES)[number];
export function castToSectionName(maybeSectionName: string) {
  const sectionName = maybeSectionName as SectionName;
  if (!SECTION_NAMES.includes(sectionName)) {
    throw new Error(`Expected name to be one of ${SECTION_NAMES}`);
  }
  return sectionName;
}
