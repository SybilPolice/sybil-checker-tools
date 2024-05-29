import { model } from 'mongoose';
import { WalletNetworkStatsSchema, WalletSchema } from './schemas.js';
import networksEnum from '../enums/networksEnum.js';

const Wallet = model('wallet', WalletSchema);

const getWalletNetworkStatsModelName = (network) =>  `wallet_${network.charAt(0).toUpperCase() + network.slice(1)}_stats`;

const WalletStats = {
  [networksEnum.eth]: model(getWalletNetworkStatsModelName('eth'), WalletNetworkStatsSchema),
  [networksEnum.base]: model(getWalletNetworkStatsModelName('base'), WalletNetworkStatsSchema),
  [networksEnum.polygon]: model(getWalletNetworkStatsModelName('polygon'), WalletNetworkStatsSchema),
  [networksEnum.zkSyncEra]: model(getWalletNetworkStatsModelName('zk_sync_era'), WalletNetworkStatsSchema),
  [networksEnum.avalanche]: model(getWalletNetworkStatsModelName('avalanche'), WalletNetworkStatsSchema),
  [networksEnum.optimism]: model(getWalletNetworkStatsModelName('optimism'), WalletNetworkStatsSchema),
  [networksEnum.binanceSmartChain]: model(getWalletNetworkStatsModelName('binance_smart_chain'), WalletNetworkStatsSchema),
  [networksEnum.arbitrum]: model(getWalletNetworkStatsModelName('arbitrum'), WalletNetworkStatsSchema),
  [networksEnum.arbitrumNova]: model(getWalletNetworkStatsModelName('arbitrum_nova'), WalletNetworkStatsSchema),
  [networksEnum.moonRiver]: model(getWalletNetworkStatsModelName('moon_river'), WalletNetworkStatsSchema),
  [networksEnum.moonBeam]: model(getWalletNetworkStatsModelName('moon_beam'), WalletNetworkStatsSchema),
  [networksEnum.scroll]: model(getWalletNetworkStatsModelName('scroll'), WalletNetworkStatsSchema),
  [networksEnum.linea]: model(getWalletNetworkStatsModelName('linea'), WalletNetworkStatsSchema),
  [networksEnum.gnosis]: model(getWalletNetworkStatsModelName('gnosis'), WalletNetworkStatsSchema),
  [networksEnum.mantle]: model(getWalletNetworkStatsModelName('mantle'), WalletNetworkStatsSchema),
  [networksEnum.zora]: model(getWalletNetworkStatsModelName('zora'), WalletNetworkStatsSchema),
};

export {
  Wallet,
  WalletStats,
};
