import { updateSectionedConfig } from '../update-sectioned-config';

describe(updateSectionedConfig.name, () => {
  it('deletes the "sections" property if delta.sections is null', () => {
    expect(updateSectionedConfig({ sections: {} }, { sections: null })).toEqual({});
  });

  it('deletes a "sections" property if delta.sections[chainName] is null', () => {
    expect(
      updateSectionedConfig({ sections: { main: {} } }, { sections: { main: null } }),
    ).toEqual({ sections: {} });
  });

  it('adds new sections from delta', () => {
    expect(updateSectionedConfig({}, { sections: { main: {} } })).toEqual({
      sections: { main: {} },
    });
  });
});
