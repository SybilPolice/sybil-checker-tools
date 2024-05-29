import crypto from 'crypto';
import {connect} from '../mongo/index.js';
import {WalletStats} from '../mongo/models.js';

const updateDocument = async (doc) => {
  const { wallet, addresses } = doc;

  // Преобразование всех адресов в нижний регистр и сортировка
  addresses.list = addresses.list.map(addr => addr.toLowerCase()).sort();

  // Проверка наличия wallet в addresses.list и его удаление
  if (addresses.list.includes(wallet.toLowerCase())) {
    addresses.list = addresses.list.filter(addr => addr !== wallet.toLowerCase());
  }

  // Генерация нового хэша
  addresses.hash = crypto.createHash('sha256').update(addresses.list.join('')).digest('hex');

  // Сохранение изменений
  await doc.save();
  console.log(`Updated wallet: ${wallet}`);
};

const main = async () => {
  const mongo = await connect(); // Предполагается, что ваш модуль connect устанавливает соединение с MongoDB
  console.log('Connected to MongoDB');

  const cursor = WalletStats['arb'].find().cursor();

  for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    try {
      await updateDocument(doc);
    } catch (err) {
      console.error(`An error occurred while updating wallet ${doc.wallet}: `, err.message || 'something went wrong');
    }
  }

  await mongo.disconnect();
  console.log('Connection closed');
};

export default main;