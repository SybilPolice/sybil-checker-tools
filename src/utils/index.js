import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

/**
 * @param {number} ms
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * @param {string | URL} fileUrl
 * @param {string} relativePath
 * @returns {string}
 */
const getPath = (fileUrl, relativePath) => path.resolve(path.dirname(fileURLToPath(fileUrl)), relativePath);

/**
 * @param {string} path
 * @returns {string[]}
 */
const parseAddressFile = (path) =>
  fs.readFileSync(path, 'utf8')
    .trim()
    .split(/\r\n|\r|\n/)
    .map(line => line.trim());

/**
 * @param {string} path
 * @param {string[]} wallets
 * @returns {void}
 */
const saveAddressFile = (path, wallets) => fs.writeFileSync(path, wallets.join('\n'));

/**
 * @param {string} path
 * @param {*} data
 * @returns {Promise<void>}
 */
const appendJSON = (path, data) =>
  new Promise((resolve, reject) =>
    fs.appendFile(
      path,
      JSON.stringify(data, null, 2) + ',\n',
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    )
  );

/**
 * @param {string} path
 * @returns {void}
 */
const finishJSON = (path) => {
  if (fs.existsSync(path)) {
    const data = JSON.parse('[' + fs.readFileSync(path, 'utf8').replace(/,\n$/, '') + ']');
    return fs.writeFileSync(path, JSON.stringify(data, null, 2));
  }
}

/**
 * @param {string[]} data
 * @returns {string}
 */
const normalizeCSVRow = (data) => data.join(process.env.CSV_DELIMITER || ',')

/**
 * @param {string[]} fields
 * @param {{}} data
 * @param {{}} options
 * @returns {string}
 */
const normalizeCSVRowData = (fields, data, options = {}) => normalizeCSVRow(
  fields.map((field) => {
    let res = data;
    field.split('.').forEach((level) => (res = res[level]));

    switch (options[field]) {
      case 'timestamp':
        res = new Date(res).toLocaleDateString();
    }

    return res;
  })
);

/**
 * @param {string} path
 * @param {{}} header
 * @param {{}[]} data
 * @param {{}} options
 * @returns {void}
 */
const saveCSV = (path, header, data, options = {}) => {
  const csv = [normalizeCSVRow(Object.values(header))];
  data.forEach((it) => csv.push(normalizeCSVRowData(Object.keys(header), it, options)));
  return fs.writeFileSync(path, csv.join('\n'));
};

/**
 * @param {Date} date1
 * @param {Date} date2
 * @returns {number}
 */
const getDaysDifference = (date1, date2) => {
  const diffTime = Math.abs(date2 - date1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * @param {string | ArrayBufferView} data
 * @returns {string}
 */
const hashData = (data) => crypto.createHash('sha256').update(data).digest('hex');

/**
 * @param {{}} enumObj
 * @return {{}}
 */
const getReverseEnum = (enumObj) => {
  const res = {};
  Object.keys(enumObj).forEach((key) => {
    res[enumObj[key]] = key;
  });
  return res;
};

export {
  sleep,
  getPath,
  parseAddressFile,
  saveAddressFile,
  appendJSON,
  finishJSON,
  normalizeCSVRow,
  normalizeCSVRowData,
  saveCSV,
  getDaysDifference,
  hashData,
  getReverseEnum,
};
