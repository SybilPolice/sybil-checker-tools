import { connect } from '../mongo/index.js';
import { getPath, getReverseEnum, parseAddressFile, saveCSV } from '../utils/index.js';
import networksEnum from '../enums/networksEnum.js';
import { WalletStats } from '../mongo/models.js';

const main = async () => {
  const wallets = parseAddressFile(getPath(import.meta.url, '../../input/getWalletStats.txt'));
  let networks = Object.values(networksEnum);

  if (wallets[0]?.length !== 42 || wallets[0]?.includes(',')) {
    const networkKeys = wallets[0]?.split(',') || [];

    if (networkKeys.find((it) => !Object.keys(networksEnum).includes(it))) {
      throw new Error(`Incorrect wallet ${wallets[0]}`);
    }

    networks = networkKeys.map((it) => networksEnum[it]);
  }

  const promises = [];
  const res = {};
  const networksEnumReverse = getReverseEnum(networksEnum);
  const mongo = await connect();

  networks.forEach((network) =>
    promises.push(WalletStats[network]
      .find({ wallet: wallets }).sort({ serialNum: 1 })
      .then((data) => {
        console.log(`Got stats for network ${networksEnumReverse[network]}`);
        res[networksEnumReverse[network]] = data;
      })
      .catch((err) => console.error(
        `An error occurred when getting stats for network ${networksEnumReverse[network]}:`, err.message || 'smth went wrong'
      ))
    )
  );

  await Promise.all(promises);
  await mongo.disconnect();

  const ts = Date.now();
  Object.entries(res).forEach(([network, data]) => {
    saveCSV(
      getPath(import.meta.url, `../../output/${network}WalletStats.${ts}.csv`),
      {
        serialNum: 'Serial',
        wallet: 'Wallet',
        balance: 'Balance',
        'volumes.total': 'Total volume',
        'volumes.fees': 'Fees',
        'volumes.stables': 'Stables volume',
        txCount: 'Count of transactions',
        txTokenCount: 'Count of transaction tokens',
        'time.month': 'Active months',
        'time.days': 'Active days',
        'time.age': 'Days of life',
        'addresses.uniqAddressesCount': 'Count of unique addresses',
        'time.firstTx': 'Time of first transaction',
        'time.lastTx': 'Time of last transaction',
        'stargate.count': 'Count of transaction in Stargate',
        'stargate.total': 'Volume in Stargate',
        'merkly.count': 'Count of transaction in Merkly',
        'merkly.total': 'Volume in Merkly',
        'smartContracts.uniqueContractsCount': 'Count of unique smart contracts',
        'addresses.hash': 'Pattern'
      },
      data,
      {
        'time.firstTx': 'timestamp',
        'time.lastTx': 'timestamp',
      }
    );
  });
};

export default main;
