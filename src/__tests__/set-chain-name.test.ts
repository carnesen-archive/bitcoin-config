import { setChainName as subject } from '../set-chain-name';

type Item = {
  args: Parameters<typeof subject>;
  returnValue: ReturnType<typeof subject>;
};

const data: Item[] = [
  {
    args: [{ regtest: true }, 'main'],
    returnValue: {},
  },
  {
    args: [{ testnet: true }, 'regtest'],
    returnValue: { regtest: true },
  },
  {
    args: [{}, 'test'],
    returnValue: { testnet: true },
  },
];

describe(subject.name, () => {
  for (const { args, returnValue } of data) {
    it(`"${args}" -> "${returnValue}"`, () => {
      expect(subject(...args)).toEqual(returnValue);
    });
  }
});
