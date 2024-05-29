import axios from 'axios';
import { ethers } from 'ethers';
import { getDaysDifference, getPath, hashData, parseAddressFile } from '../utils/index.js';
import networksEnum from '../enums/networksEnum.js';

const STABLE_COINS = ['USDT', 'USDC', 'USDC.e', 'USDD'];
const ETH_PRICE = 3100;

const urlEnum = {
  [networksEnum.eth]: 'https://api.etherscan.io/api',
  [networksEnum.base]: 'https://api.basescan.org/api',
  [networksEnum.zkSyncEra]: 'https://block-explorer-api.mainnet.zksync.io/api',
  [networksEnum.avalanche]: 'https://api.routescan.io/v2/network/mainnet/evm/43114/etherscan/api',
  [networksEnum.optimism]: 'https://api-optimistic.etherscan.io/api',
  [networksEnum.polygon]: 'https://api.polygonscan.com/api',
  [networksEnum.binanceSmartChain]: 'https://api.bscscan.com/api',
  [networksEnum.arbitrum]: 'https://api.arbiscan.io/api',
  [networksEnum.arbitrumNova]: 'https://api-nova.arbiscan.io/api',
  [networksEnum.moonRiver]: 'https://api-moonriver.moonscan.io/api',
  [networksEnum.moonBeam]: 'https://api-moonbeam.moonscan.io/api',
  [networksEnum.scroll]: 'https://api.scrollscan.com/api',
  [networksEnum.linea]: 'https://api.lineascan.build/api',
  [networksEnum.gnosis]: 'https://api.gnosisscan.io/api',
  [networksEnum.mantle]: 'https://api.routescan.io/v2/network/mainnet/evm/5000/etherscan/api',
  [networksEnum.zora]: 'https://api.routescan.io/v2/network/mainnet/evm/7777777/etherscan/api',
};

const keyEnum = {
  [networksEnum.eth]: process.env.ETH_API_KEY,
  [networksEnum.base]: process.env.BASE_API_KEY,
  [networksEnum.optimism]: process.env.OPTIMISM_API_KEY,
  [networksEnum.polygon]: process.env.POLYGON_API_KEY,
  [networksEnum.avalanche]: process.env.AVALANCHE_API_KEY,
  [networksEnum.zkSyncEra]: process.env.ERA_API_KEY,
  [networksEnum.binanceSmartChain]: process.env.BNB_API_KEY,
  [networksEnum.arbitrum]: process.env.ARBITRUM_API_KEY,
  [networksEnum.arbitrumNova]: process.env.ARBITRUM_NOVA_API_KEY,
  [networksEnum.moonBeam]: process.env.MOONBEAM_API_KEY,
  [networksEnum.moonRiver]: process.env.MOONRIVER_API_KEY,
  [networksEnum.scroll]: process.env.SCROLL_API_KEY,
  [networksEnum.linea]: process.env.LINEA_API_KEY,
  [networksEnum.gnosis]: process.env.GNOSIS_API_KEY,
  [networksEnum.mantle]: process.env.MANTLE_API_KEY,
  [networksEnum.zora]: process.env.ZORA_API_KEY,
};

const stargateProtocol = {
  [networksEnum.optimism]: parseAddressFile(getPath(import.meta.url, '../constants/stargate/op')),
  [networksEnum.polygon]: parseAddressFile(getPath(import.meta.url, '../constants/stargate/matic')),
  [networksEnum.avalanche]: parseAddressFile(getPath(import.meta.url, '../constants/stargate/avax')),
  [networksEnum.zkSyncEra]: parseAddressFile(getPath(import.meta.url, '../constants/stargate/era')),
  [networksEnum.binanceSmartChain]: parseAddressFile(getPath(import.meta.url, '../constants/stargate/bnb')),
  [networksEnum.arbitrum]: parseAddressFile(getPath(import.meta.url, '../constants/stargate/arb')),
  [networksEnum.arbitrumNova]: [],
  [networksEnum.moonBeam]: [],
  [networksEnum.moonRiver]: [],
  [networksEnum.scroll]: [],
  [networksEnum.linea]: parseAddressFile(getPath(import.meta.url, '../constants/stargate/linea')),
  [networksEnum.gnosis]: [],
  [networksEnum.mantle]: parseAddressFile(getPath(import.meta.url, '../constants/stargate/mnt')),
  [networksEnum.zora]: [],
};

const merklyProtocol = {
  [networksEnum.eth]: [
    '0x6e55472109e6abe4054a8e8b8d9edffcb31032c5',
    '0x6f6ae8851a460406bbb3c929a415d2df9305acd5',
    '0xc072c3ebaf165955c5aad2dbb4293f771de6dbd3',
    '0xafa5f9313f1f2b599173f24807a882f498be118c',
  ],
  [networksEnum.base]: [
    '0xe47b05f2026a82048caaecf5cae58e5aae2405ea',
    '0xf882c982a95f4d3e8187efe12713835406d11840',
    '0x5f45cd59ba7f2f6bcd935663f68ee1debe3b8a10',
    '0x6bf98654205b1ac38645880ae20fc00b0bb9ffca',
  ],
  [networksEnum.optimism]: [
    '0x885ef5813e46ab6efb10567b50b77aaad4d258ce',
    '0xa2c203d7ef78ed80810da8404090f926d67cd892',
    '0x20279b6d57ba6d3ef852f34800e43e39d46d6487',
    '0xd7ba4057f43a7c4d4a34634b2a3151a60bf78f0d',
    '0xafa5f9313f1f2b599173f24807a882f498be118c',
  ],
  [networksEnum.polygon]: [
    '0x97337a9710beb17b8d77ca9175defba5e9afe62e',
    '0xa184998ec58dc1da77a1f9f1e361541257a50cf4',
    '0x70ea00ab512d13dac5001c968f8d2263d179e2d2',
    '0x0e1f20075c90ab31fc2dd91e536e6990262cf76d',
    '0x7dfb5e7808b5eb4fb8b9e7169537575f6ff1a218',
  ],
  [networksEnum.avalanche]: [
    '0xc7cc66a88e2f121fb104344eacb7ba7bcae79dfa',
    '0xe030543b943bdcd6559711ec8d344389c66e1d56',
    '0x70ea00ab512d13dac5001c968f8d2263d179e2d2',
    '0x5c9bbe51f7f19f8c77df7a3ada35ab434aaa86c5',
    '0x7dfb5e7808b5eb4fb8b9e7169537575f6ff1a218',
  ],
  [networksEnum.zkSyncEra]: [
    '0x0bf0d6260fb4f4fc77b143eaff9e4fe51dd08c83',
    '0x6dd28c2c5b91dd63b4d4e78ecac7139878371768',
    '0x54de43b6ba21a5553697a2b78338e046dd7e0278',
    '0x5673b6e6e51de3479b8deb22df46b12308db5e1e',
  ],
  [networksEnum.binanceSmartChain]: [
    '0xb5691e49f86cba649c815ee633679944b044bc43',
    '0xfdc9018af0e37abf89233554c937eb5068127080',
    '0xe341f30ea040bf3691aa069b8c5c213f72676421',
    '0xef1eae0457e8d56a003d781569489bc5466e574b',
    '0x7dfb5e7808b5eb4fb8b9e7169537575f6ff1a218',
  ],
  [networksEnum.arbitrum]: [
    '0xfdc9018af0e37abf89233554c937eb5068127080',
    '0xaa58e77238f0e4a565343a89a79b4addd744d649',
    '0x8a555e4fc287650f5e8ca1778a35dd44e893d6aa',
    '0x4ae8cebccd7027820ba83188dfd73ccad0a92806',
    '0xef62b433ca3ac8b151c4a255de3ed3da4e60add2',
  ],
  [networksEnum.arbitrumNova]: [
    '0x5f45cd59ba7f2f6bcd935663f68ee1debe3b8a10',
    '0x484c402b0c8254bd555b68827239bace7f491023',
    '0x148caf6ffbaba15f35dee7e2813d1f4c6da288f3',
    '0xb6789dacf323d60f650628dc1da344d502bc41e3',
    '0x7dfb5e7808b5eb4fb8b9e7169537575f6ff1a218',
  ],
  [networksEnum.moonBeam]: [
    '0x5f45cd59ba7f2f6bcd935663f68ee1debe3b8a10',
    '0x766b7ac73b0b33fc282bde1929db023da1fe6458',
    '0x9a44124b18bcae851134444ee35c53daa77f86c6',
    '0x671861008497782f7108d908d4df18ebf9598b82',
    '0x7dfb5e7808b5eb4fb8b9e7169537575f6ff1a218',
  ],
  [networksEnum.moonRiver]: [
    '0x5f45cd59ba7f2f6bcd935663f68ee1debe3b8a10',
    '0x97337a9710beb17b8d77ca9175defba5e9afe62e',
    '0x8582a8f68faf6c2c5b5f4a1eb28122acf09fefee',
    '0xd379c3d0930d70022b3c6eba8217e4b990705540',
  ],
  [networksEnum.scroll]: [
    '0xafa5f9313f1f2b599173f24807a882f498be118c',
    '0x6e55472109e6abe4054a8e8b8d9edffcb31032c5',
    '0x1a7206f9c315720d1e5b536b492c448863eb298a',
    '0x7dfb5e7808b5eb4fb8b9e7169537575f6ff1a218',
  ],
  [networksEnum.linea]: [
    '0x5200543580e7ad49fbcb4690c4556d3a6a022584',
    '0xdb3bb6d5a8eeeafc64c66c176900e6b82b23dd5f',
    '0x5f45cd59ba7f2f6bcd935663f68ee1debe3b8a10',
    '0xc9b753d73b17ddb5e87093ff04a9e31845a43af0',
  ],
  [networksEnum.gnosis]: [
    '0x5f45cd59ba7f2f6bcd935663f68ee1debe3b8a10',
    '0xb58f5110855fbef7a715d325d60543e7d4c18143',
    '0x54b3297e1c739fe62be5c00473a2e6bb78adb0ef',
    '0x556f119c7433b2232294fb3de267747745a1dab4',
    '0x7dfb5e7808b5eb4fb8b9e7169537575f6ff1a218',
  ],
  [networksEnum.mantle]: [
    '0xdb3bb6d5a8eeeafc64c66c176900e6b82b23dd5f',
    '0x5200543580e7ad49fbcb4690c4556d3a6a022584',
    '0x5f45cd59ba7f2f6bcd935663f68ee1debe3b8a10',
    '0xe7d454d096d38b22e0c30470e7fb20b1b2acf70d',
    '0x7dfb5e7808b5eb4fb8b9e7169537575f6ff1a218',
  ],
  [networksEnum.zora]: [
    '0x766b7ac73b0b33fc282bde1929db023da1fe6458',
    '0xffd57b46bd670b0461c7c3ebbaedc4cdb7c4fb80',
    '0xd838d5b87439e17b0194fd43e37300cd99aa3de0',
    '0x461fccf240ca4884cc5413a5742f1bc56faf7a0c',
  ],
};

const getTransactions = (address, chain, startblock = 0, endblock = 99999999, sort = 'asc', offset = 1000) => {
  const BASE_URL = urlEnum[chain];
  const API_KEY = keyEnum[chain];
  const url = `${BASE_URL}?module=account&action=txlist&address=${address}&startblock=${startblock}&endblock=${endblock}&sort=${sort}&apikey=${API_KEY}&offset=${offset}`;
  return axios.get(url)
    .then((res) => res.data)
    .catch((err) => console.error('Error fetching transactions:', err.code));
};

const getTokenTransactions = (address, chain, startblock = 0, endblock = 99999999, sort = 'asc', offset = 1000) => {
  const BASE_URL = urlEnum[chain];
  const API_KEY = keyEnum[chain];
  const url = `${BASE_URL}?module=account&action=tokentx&address=${address}&startblock=${startblock}&endblock=${endblock}&sort=${sort}&apikey=${API_KEY}&offset=${offset}`;
  return axios.get(url)
    .then((res) => res.data)
    .catch((err) => console.error('Error fetching token transactions:', err.code));
};

const getBalance = (address, chain) => {
  const BASE_URL = urlEnum[chain];
  const API_KEY = keyEnum[chain];
  const url = `${BASE_URL}?module=account&action=balance&address=${address}&tag=latest&apikey=${API_KEY}`;
  return axios.get(url)
    .then((res) => res.data)
    .catch((err) => console.error('Error fetching balance:', err.code));
};

const main = async (wallet, chain) => {
  const [transactions, balanceData, tokenTransactions] = await Promise.all([
    getTransactions(wallet, chain),
    getBalance(wallet, chain),
    getTokenTransactions(wallet, chain),
  ]);

  if (transactions?.status !== '1') {
    console.warn(`Failed to receive transactions for wallet ${wallet} and chain ${chain}: ${transactions?.status}, ${transactions?.message}`);
    return { wallet };
  }

  const txList = transactions.result || [];
  const tokenTxList = tokenTransactions?.result || [];

  if (!txList.length && !tokenTxList.length) {
    console.warn(`Empty activity for wallet ${wallet} and chain ${chain}`);
    return { wallet };
  }

  // Time of first and last transaction
  const firstTxTime = (txList[0]?.timeStamp || 0) * 1000;
  const lastTxTime = (txList[txList.length - 1]?.timeStamp || 0) * 1000;

  // Wallet age in days
  const walletAgeInDays = getDaysDifference(new Date(firstTxTime), new Date());

  // Active days and months
  const activeDays = new Set(txList.map((tx) => new Date(tx.timeStamp * 1000).toDateString())).size;
  const activeMonths = new Set(txList.map((tx) => `${new Date(tx.timeStamp * 1000).getFullYear()}-${new Date(tx.timeStamp * 1000).getMonth() + 1}`)).size;

  // Protocol Stargate
  const stargateAddresses = stargateProtocol[chain];
  let stargateCount = 0;
  let stargateVolume = 0;
  let firstStargateTx = 0;
  let lastStargateTx = 0;
  let stargateStableVolume = 0;
  const stargateTokenVolumes = {};

  if (stargateAddresses?.length) {
    const stargateTxs = txList.filter((tx) => stargateAddresses.includes(tx.to.toLowerCase()) || stargateAddresses.includes(tx.from.toLowerCase()));
    const stargateTokenTxs = tokenTxList?.filter((tx) => stargateAddresses.includes(tx.to.toLowerCase()) || stargateAddresses.includes(tx.from.toLowerCase())) || [];
    const allStargateTxs = [...stargateTxs, ...stargateTokenTxs];
    stargateCount = stargateTxs.length + stargateTokenTxs.length;
    stargateVolume = stargateTxs.reduce((acc, tx) => acc + parseFloat(ethers.formatEther(tx.value)), 0);
    allStargateTxs.sort((a, b) => a.timeStamp - b.timeStamp);
    firstStargateTx = (allStargateTxs[0]?.timeStamp || 0) * 1000;
    lastStargateTx = (allStargateTxs[allStargateTxs.length - 1]?.timeStamp || 0) * 1000;

    stargateTokenTxs.forEach((tx) => {
      const tokenSymbol = tx.tokenSymbol;
      const tokenValue = parseFloat(ethers.formatUnits(tx.value, Number(tx.tokenDecimal)));

      if (STABLE_COINS.includes(tokenSymbol)) {
        stargateStableVolume += tokenValue;
      }

      if (!stargateTokenVolumes[tokenSymbol]) {
        stargateTokenVolumes[tokenSymbol] = tokenValue;
      } else {
        stargateTokenVolumes[tokenSymbol] += tokenValue;
      }
    });
  }

  // Protocol Merkly
  const merklyAddresses = merklyProtocol[chain];
  let merklyCount = 0;
  let merklyVolume = 0;
  let firstMerklyTx = 0;
  let lastMerklyTx = 0;
  let merklyStableVolume = 0;
  const merklyTokenVolumes = {};

  if (merklyAddresses?.length) {
    const merklyTxs = txList.filter((tx) => merklyAddresses.includes(tx.to.toLowerCase()) || merklyAddresses.includes(tx.from.toLowerCase()));
    const merklyTokenTxs = tokenTxList.filter((tx) => merklyAddresses.includes(tx.to.toLowerCase()) || merklyAddresses.includes(tx.from.toLowerCase()));
    const allMerklyTxs = [...merklyTxs, ...merklyTokenTxs];
    merklyCount = merklyTxs.length + merklyTokenTxs.length;
    merklyVolume = merklyTxs.reduce((acc, tx) => acc + parseFloat(ethers.formatEther(tx.value)), 0);
    allMerklyTxs.sort((a, b) => a.timeStamp - b.timeStamp);
    firstMerklyTx = (allMerklyTxs[0]?.timeStamp || 0) * 1000;
    lastMerklyTx = (allMerklyTxs[allMerklyTxs.length - 1]?.timeStamp || 0) * 1000;

    merklyTokenTxs.forEach((tx) => {
      const tokenSymbol = tx.tokenSymbol;
      const tokenValue = parseFloat(ethers.formatUnits(tx.value, Number(tx.tokenDecimal)));

      if (STABLE_COINS.includes(tokenSymbol)) {
        merklyStableVolume += tokenValue;
      }

      if (!merklyTokenVolumes[tokenSymbol]) {
        merklyTokenVolumes[tokenSymbol] = tokenValue;
      } else {
        merklyTokenVolumes[tokenSymbol] += tokenValue;
      }
    });
  }

  // Unique addresses and circulation
  const uniqueAddresses = new Set();
  const addressVolume = {};

  txList.forEach((tx) => {
    if (tx.to !== '') {
      uniqueAddresses.add(tx.to.toLowerCase());

      if (!addressVolume[tx.to]) {
        addressVolume[tx.to] = ethers.formatEther(tx.value);
      } else {
        addressVolume[tx.to] = (parseFloat(addressVolume[tx.to]) + parseFloat(ethers.formatEther(tx.value))).toString();
      }
    }
  });

  // Sorting unique addresses
  const sortedUniqueAddresses = Array.from(uniqueAddresses).sort().filter((address) => address !== wallet);
  const sortedUniqueAddressesHash = hashData(sortedUniqueAddresses.join(','));
  // Sorting address by volume
  const sortedAddressVolume = Object.fromEntries(Object.entries(addressVolume).sort(([keyA], [keyB]) => keyA.localeCompare(keyB)));

  // Total amount of funds spent on commission
  const totalFees = txList.reduce((acc, tx) => acc + parseFloat(ethers.formatEther((tx.gasUsed * tx.gasPrice).toString())), 0);

  // Total amount of funds used on the network
  const totalVolume = txList.reduce((acc, tx) => acc + parseFloat(ethers.formatEther(tx.value)), 0);

  // Number of unique smart contracts(deprecated)
  const uniqueContracts = new Set(
    txList.filter((tx) => tx.input !== '0x' && tx.contractAddress !== '').map((tx) => tx.contractAddress)
  );

  // Sorting unique smart contract addresses
  const sortedUniqueContracts = Array.from(uniqueContracts).sort();
  const sortedUniqueContractsHash = hashData(sortedUniqueContracts.join(','));

  // Wallet balance
  let balance = -1;

  if (balanceData?.status === '1') {
    balance = ethers.formatEther(balanceData.result);
  }

  // Counting token volumes (USDC, USDT, BTC, etc.)
  const tokenVolumes = {};
  let stableVolume = 0;

  if (tokenTransactions?.status === '1') {
    tokenTxList.forEach((tx) => {
      const tokenSymbol = tx.tokenSymbol;
      const tokenValue = parseFloat(ethers.formatUnits(tx.value, Number(tx.tokenDecimal)));

      if (STABLE_COINS.includes(tokenSymbol)) {
        stableVolume += tokenValue;
      }

      if (!tokenVolumes[tokenSymbol]) {
        tokenVolumes[tokenSymbol] = tokenValue;
      } else {
        tokenVolumes[tokenSymbol] += tokenValue;
      }
    });
  }

  return {
    wallet,
    txs: txList.length,
    txsTokens: tokenTxList.length,
    balance,
    time: {
      firstTx: firstTxTime,
      lastTx: lastTxTime,
      age: walletAgeInDays,
      days: activeDays,
      month: activeMonths,
    },
    addresses: {
      uniqAddressesCount: sortedUniqueAddresses.length,
      hash: sortedUniqueAddressesHash,
      list: sortedUniqueAddresses,
      volume: sortedAddressVolume,
    },
    smartContracts: {
      uniqueContractsCount: sortedUniqueContracts.length,
      hash: sortedUniqueContractsHash,
      list: sortedUniqueContracts,
    },
    volumes: {
      fees: totalFees,
      native: totalVolume,
      stables: stableVolume,
      total: stableVolume + (totalVolume * ETH_PRICE),
      tokensVolumeList: tokenVolumes,
    },
    stargate: {
      firstTx: firstStargateTx,
      lastTx: lastStargateTx,
      count: stargateCount,
      nativeVolume: stargateVolume,
      stableVolume: stargateStableVolume,
      total: (stargateVolume * ETH_PRICE) + stargateStableVolume,
      stableList: stargateTokenVolumes,
    },
    merkly: {
      firstTx: firstMerklyTx,
      lastTx: lastMerklyTx,
      count: merklyCount,
      nativeVolume: merklyVolume,
      stableVolume: merklyStableVolume,
      total: (merklyVolume * ETH_PRICE) + merklyStableVolume,
      stableList: merklyTokenVolumes,
    },
    history: {
      txList,
      tokenTxList,
    },
  };
};

export default main;
