import { connect } from '../mongo/index.js';
import { getPath, getReverseEnum, normalizeCSVRow, normalizeCSVRowData } from '../utils/index.js';
import networksEnum from '../enums/networksEnum.js';
import { WalletStats } from '../mongo/models.js';
import fs from 'fs';

const CSV_FIELDS = {
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
};

const CSV_OPTIONS = {
  'time.firstTx': 'timestamp',
  'time.lastTx': 'timestamp',
};

const main = async () => {
  const ts = Date.now();
  const networksEnumReverse = getReverseEnum(networksEnum);
  const mongo = await connect();

  for (const network of Object.values(networksEnum)) {
    let fsPromise = null;
    const fileName = getPath(
      import.meta.url,
      `../../output/${networksEnumReverse[network]}AllStats.${ts}.csv`
    );

    fs.writeFileSync(fileName, normalizeCSVRow(Object.values(CSV_FIELDS)) + '\n');

    await WalletStats[network]
      .find(
        {},
        Object.keys(CSV_FIELDS).reduce((res, cur) => ({...res, [cur]: 1}), {})
      )
      .sort({ serialNum: 1 })
      .cursor({ batchSize: 1000 })
      .eachAsync((doc) => {
        const getPromise = () => new Promise((resolve) => {
          fs.appendFile(
            fileName,
            normalizeCSVRowData(Object.keys(CSV_FIELDS), doc, CSV_OPTIONS) + '\n',
            (err) => {
              if (err) {
                console.error(
                  `An error occurred when getting stats for network ${networksEnumReverse[network]}:`, err.message || 'smth went wrong'
                );
              }

              resolve();
            }
          )
        });

        if (fsPromise) {
          fsPromise = fsPromise.then(getPromise);
        } else {
          fsPromise = getPromise();
        }
      });

    if (fsPromise) {
      await fsPromise;
    }
  }

  await mongo.disconnect();
};

export default main;
