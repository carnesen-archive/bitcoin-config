import { updateConfigFile } from '../update-config-file';
import tempWrite = require('temp-write');
import { readFileSync } from 'fs';

describe(updateConfigFile.name, () => {
  it('throws "not absolute" if provided file path is not absolute', () => {
    expect(() => {
      updateConfigFile('bitcoin.conf', {});
    }).toThrow('not absolute');
  });

  it('updates the specified configuration file', async () => {
    const filePath = await tempWrite('rpcuser=chris\nrpcpassword=foo');
    updateConfigFile(filePath, { rpcuser: null, rpcpassword: 'bar' });
    const fileContents = readFileSync(filePath, { encoding: 'utf8' });
    expect(fileContents).not.toMatch('rpcuser');
    expect(fileContents).toMatch('rpcpassword=bar');
  });
});
