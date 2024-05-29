import mongoose from 'mongoose';

const host = process.env.MONGODB_HOST;
const port = process.env.MONGODB_PORT;
const username = process.env.MONGODB_USERNAME;
const password = process.env.MONGODB_PASSWORD;
const database = process.env.MONGODB_DATABASE;
const uri =
  'mongodb://' +
  (username || password
    ? `${username || ''}${password ? `:${password}` : ''}@`
    : '') +
  host +
  (port ? `:${port}` : '') +
  (database ? `/${database}` : '') +
  '?authSource=admin';
const connect = () => mongoose.connect(uri);

export default connect;

export { connect };
