import { config as env } from 'dotenv';
import { getPath } from './utils/index.js';
env({ path: getPath(import.meta.url, '../.env') });

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { WalletStats } from './mongo/models.js';
import networksEnum from './enums/networksEnum.js';
import { getReverseEnum } from './utils/index.js';
import * as https from 'https';
import fs from 'fs';

const app = express();
const port = process.env.SERVER_PORT || 8080;

app.use(cors({ origin: '*' }));

app.use(bodyParser.json());

app.post('/api/stats', async (req, res) => {
  const { networks: networkKeys = [], wallets, filters } = req.body;
  const incorrectNetworks = networkKeys.filter((it) => !Object.keys(networksEnum).includes(it)) || [];

  if (incorrectNetworks.length) {
    res.status(400).json({
      message: `Incorrect networks: ${incorrectNetworks.join(', ')}`,
    });
    return;
  }

  const incorrectWallets = wallets.filter((it) => it.length !== 42);

  if (incorrectWallets.length) {
    res.status(400).json({
      message: `Incorrect wallets: ${incorrectWallets.join(', ')}`,
    });
    return;
  }

  if (typeof filters !== 'object' || Array.isArray(filters)) {
    res.status(400).json({
      message: 'Incorrect filters',
    });
    return;
  }

  const data = {};
  const promises = [];
  const networksEnumReverse = getReverseEnum(networksEnum);
  const networks = networkKeys.length ? networkKeys.map((it) => networksEnum[it]) : Object.values(networksEnum);

  networks.forEach((network) =>
    promises.push(WalletStats[network]
      .find({ wallet: wallets, ...filters }).sort({ serialNum: 1 })
      .then((res) => (data[networksEnumReverse[network]] = res))
      .catch((err) => console.error(
        `An error occurred when getting stats for network ${networksEnumReverse[network]}:`, err.message || 'smth went wrong'
      ))
    )
  );

  await Promise.all(promises);
  res.json(data);
});

if (process.env.SERVER_SSL === 'true') {
  // Load SSL certificate and key
  const options = {
    key: fs.readFileSync('ssl/privkey.pem'),
    cert: fs.readFileSync('ssl/fullchain.pem')
  };

  https.createServer(options, app).listen(port, () => {
    console.log(`Start SSL server on port ${port}`);
    import('./mongo/index.js').then(({ connect }) => connect()
      .then(() => {
        console.log('The DB is successfully connected');
      })
      .catch((err) => {
        console.error('The DB error occurred when server starts:', err);
        process.exit(1);
      })
    );
  });
} else {
  app.listen(port, () => {
    console.log(`Start normal server on port ${port}`);
    import('./mongo/index.js').then(({ connect }) => connect()
      .then(() => {
        console.log('The DB is successfully connected');
      })
      .catch((err) => {
        console.error('The DB error occurred when server starts:', err);
        process.exit(1);
      }));
  });
}
