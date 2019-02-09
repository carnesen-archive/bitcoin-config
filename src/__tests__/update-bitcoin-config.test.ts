import { updateBitcoinConfig } from '../update-bitcoin-config';

describe(updateBitcoinConfig.name, () => {
  it('deletes an existing value if the delta has value null', () => {
    expect(updateBitcoinConfig({ rpcuser: 'mark' }, { rpcuser: null })).toEqual({});
  });
  it('attaches a non-null delta value to the config object', () => {
    expect(
      updateBitcoinConfig({ rpcuser: 'mark', rpcpassword: 'foo' }, { rpcuser: 'chris' }),
    ).toEqual({
      rpcuser: 'chris',
      rpcpassword: 'foo',
    });
  });
});
