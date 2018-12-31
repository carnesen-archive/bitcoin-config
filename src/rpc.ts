// import { URL } from 'url';
// import { isAbsolute, join } from 'path';
// import { readConfigFiles } from './read';
// import { getActiveSectionName, toAbsolute } from './util';
// import { readFileSync } from 'fs';

// type Options = {
//   conf?: string;
//   datadir?: string;
// };

// export function readRpcHref(options: Options = {}) {
//   const bitcoinConfig = readConfigFiles({ ...options });
//   const bitcoinConfigWithDefaults = readConfigFiles({ ...options, withDefaults: true });

//   const url = new URL(`http://${bitcoinConfigWithDefaults.rpcconnect}`);
//   url.port = bitcoinConfigWithDefaults.rpcport.toString();
//   if (!bitcoinConfig.rpcconnect && bitcoinConfig.rpcbind && bitcoinConfig.rpcallowip) {
//     // rpcconnect has not been set explicitly
//     url.host = bitcoinConfig.rpcbind[0];
//   }

//   let username: string;
//   let password: string;
//   if (bitcoinConfig.rpcpassword) {
//     // cookie-based auth is disabled
//     if (!bitcoinConfig.rpcuser) {
//       throw new Error('Configuration file had rpcpassword but not rpcuser');
//     }
//     username = bitcoinConfig.rpcuser;
//     password = bitcoinConfig.rpcpassword;
//   } else {
//     // cookie-based auth is enabled
//     const { rpccookiefile, regtest, testnet } = bitcoinConfigWithDefaults;
//     const cookieFilePath = toAbsolute(rpccookiefile, {
//       datadir: options.datadir,
//       regtest,
//       testnet,
//     });
//     let cookieFileContents: string;
//     try {
//       cookieFileContents = readFileSync(cookieFilePath, { encoding: 'utf8' });
//     } catch (ex) {
//       if (ex.code === 'ENOENT') {
//         throw new Error(`Expected to find "${cookieFilePath}". Is bitcoind running?`);
//       }
//       throw ex;
//     }
//     [username, password] = cookieFileContents.split(':');
//     if (!username || !password) {
//       throw new Error('Expected cookie file to contain "username:password"');
//     }
//   }

//   let resolvedPort: string;
//   url.port = resolvedPort;
//   return url.href;
// }
