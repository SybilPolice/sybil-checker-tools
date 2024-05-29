import { Schema } from 'mongoose';

const WalletSchema = new Schema(
  { address: { type: String, required: true, unique: true } },
  { versionKey: false }
);

const WalletNetworkStatsSchema = new Schema(
  {
    wallet: { type: String, required: true, unique: true },
    serialNum: { type: Number, required: true, unique: true },
    balance: { type: String, default: '0' },
    txCount: { type: Number, default: 0 },
    txTokenCount: { type: Number, default: 0 },
    addresses: {
      uniqAddressesCount: { type: Number, default: 0 },
      hash: { type: String, default: '-' },
      list: [String],
      volume: { type: Map, of: String },
    },
    smartContracts: {
      uniqueContractsCount: { type: Number, default: 0 },
      hash: { type: String, default: '-' },
      list: [String],
    },
    volumes: {
      fees: { type: String, default: '0' },
      total: { type: String, default: '0' },
      stables: { type: String, default: '0' },
      native: { type: String, default: '0' },
      tokensVolumeList: Schema.Types.Mixed,
    },
    stargate: {
      firstTx: { type: Number, default: 0 },
      lastTx: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
      nativeVolume: { type: String, default: '0' },
      stableVolume: { type: String, default: '0' },
      total: { type: String, default: '0' },
      stableList: Schema.Types.Mixed,
    },
    merkly: {
      firstTx: { type: Number, default: 0 },
      lastTx: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
      nativeVolume: { type: String, default: '0' },
      stableVolume: { type: String, default: '0' },
      total: { type: String, default: '0' },
      stableList: Schema.Types.Mixed,
    },
    history: {
      txList: [Schema.Types.Mixed],
      txTokenList: [Schema.Types.Mixed],
    },
    time: {
      firstTx: { type: Number, default: 0 },
      lastTx: { type: Number, default: 0 },
      age: { type: Number, default: 0 },
      days: { type: Number, default: 0 },
      month: { type: Number, default: 0 },
    },
  },
  { versionKey: false }
);

export {
  WalletSchema,
  WalletNetworkStatsSchema,
};
