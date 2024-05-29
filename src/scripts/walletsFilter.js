import { getPath, parseAddressFile, saveAddressFile } from '../utils/index.js';

const main = () => {
  const walletsSet = new Set(
    parseAddressFile(getPath(import.meta.url, '../../input/wallet.txt')).map((it) => it.toLowerCase())
  );
  const LZWallets =
    parseAddressFile(getPath(import.meta.url, '../../input/initialList.csv')).map((it) => it.toLowerCase());

  LZWallets.forEach((wallet) => {
    if (walletsSet.has(wallet)) {
      console.log(`Collected wallet '${wallet}' already exist in LayerZero sybil List.`);
      walletsSet.delete(wallet);
    }
  });

  saveAddressFile(getPath(import.meta.url, '../../output/wallets.txt'), Array.from(walletsSet.values()));
};

export default main;

