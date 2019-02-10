import { getChainName as subject } from '../get-chain-name';

const data: { [returnValue: string]: Parameters<typeof subject> } = {
  main: [{}],
  regtest: [{ regtest: true }],
  test: [{ testnet: true }],
};

describe(subject.name, () => {
  for (const [returnValue, args] of Object.entries(data)) {
    it(`"${args}" -> "${returnValue}"`, () => {
      expect(subject(...args)).toBe(returnValue);
    });
  }
});
