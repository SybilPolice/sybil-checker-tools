import { Wallet, WalletStats } from '../mongo/models.js';
import { connect } from '../mongo/index.js';
import networksEnum from '../enums/networksEnum.js';
import { sleep, parseAddressFile, getPath, appendJSON, finishJSON } from '../utils/index.js';
import analyzer from './analyzer.js'

const saveWalletDB = (data, retry = 1) =>
  new Wallet({ address: data.address })
    .save()
    .catch((err) => {
      if (err?.code === 11000) {
        throw new Error(`duplicate by ${Object.keys(err.keyPattern).join(', ')}`);
      } else if (retry > 5) {
        throw err;
      } else {
        console.error(`An error occurred during save wallet ${data.address}:`, err.message || err);
        return saveWalletDB(data, retry + 1);
      }
    });

const getWalletStats = (network, wallet, retry = 1) =>
  Promise.all([
    sleep(1000),
    analyzer(wallet, network),
  ])
    .then(([_, res]) => res)
    .catch((err) => {
      if (retry > 5) {
        throw err;
      } else {
        console.error(`An error occurred during get wallet stats for wallet ${wallet}:`, err.message || err);
        return getWalletStats(network, wallet, retry + 1);
      }
    });

const saveWalletStatsDB = (network, data, retry = 1) =>
  new WalletStats[network]({
    wallet: data.wallet,
    serialNum: data.serialNum,
    balance: data.balance,
    txCount: data.txs,
    txTokenCount: data.txsTokens,
    addresses: data.addresses,
    smartContracts: data.smartContracts,
    volumes: data.volumes,
    stargate: data.stargate,
    merkly: data.merkly,
    history: data.history,
    time: data.time,
  })
    .save()
    .catch((err) => {
      if (err?.code === 11000) {
        throw new Error(`duplicate by ${Object.keys(err.keyPattern).join(', ')}`);
      } else if (retry > 5) {
        throw err;
      } else {
        console.error(`An error occurred during save wallet stats for wallet ${data.wallet} and network ${network}:`, err.message || err);
        return saveWalletStatsDB(network, data, retry + 1);
      }
    });

const main = async () => {
  const ts = Date.now();
  const mongo = await connect();
  const wallets = parseAddressFile(getPath(import.meta.url, '../../input/collectWallets.txt'));
  const savePromises = {};

  for (const [i, wallet] of Object.entries(wallets)) {
    const serialNum = (+process.env.SERVER_NUM - 1) * 30000 + +i + 1;
    const walletError = {};
    const statsPromises = [];
    savePromises[wallet] = [
      saveWalletDB({ address: wallet })
        .then((res) => {
          console.log(`Wallet ${wallet} is successfully saved to DB`);
          return res;
        })
        .catch((err) => {
          console.error(`It's impossible to save wallet ${wallet} to DB:`, err.message || err);
          walletError.main = err.message || 'smth went wrong';
        })
    ];

    for (const network of Object.values(networksEnum)) {
      statsPromises.push(getWalletStats(network, wallet)
        .then(({ wallet: _, history, ...other }) => {
          savePromises[wallet].push(
            saveWalletStatsDB(network, { wallet, serialNum, history, ...other })
              .then(() => console.log(`Wallet stats for wallet ${wallet} and network ${network} is successfully saved to DB`))
              .catch((err) => {
                console.error(`It's impossible to save wallet stats for wallet ${wallet} and network ${network} to DB:`, err.message || err);

                if (!walletError.db) {
                  walletError.db = {};
                }

                walletError.db[network] = err.message || 'smth went wrong';
              }),
            appendJSON(
              getPath(import.meta.url, `../../output/collectWallets.${ts}.json`),
              { wallet, serialNum, chainId: network, ...other }
            )
              .then(() => console.log(`Wallet stats for wallet ${wallet} and network ${network} is successfully saved to JSON`))
              .catch((err) => {
                console.error(`It's impossible to save wallet stats for wallet ${wallet} and network ${network} to JSON:`, err.message || err);

                if (!walletError.json) {
                  walletError.json = {};
                }

                walletError.json[network] = err.message || 'smth went wrong';
              })
          );
        })
        .catch((err) => {
          if (!walletError.data) {
            walletError.data = {};
          }

          walletError.data[network] = err.message || 'smth went wrong'
        })
      );
    }

    await Promise.all(statsPromises);

    if (Object.keys(walletError).length) {
      savePromises[wallet].push(appendJSON(
        getPath(import.meta.url, `../../output/errCollectWallets.${ts}.json`),
        { wallet, ...walletError }
      ));
    }

    Promise.all(savePromises[wallet]).then(() => {
      delete savePromises[wallet];
    });
  }

  await Promise.all([].concat(...Object.values(savePromises)));
  await mongo.disconnect();
  finishJSON(getPath(import.meta.url, `../../output/collectWallets.${ts}.json`));
  finishJSON(getPath(import.meta.url, `../../output/errCollectWallets.${ts}.json`));
};

export default main;
