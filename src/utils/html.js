/**
 * @param {{}} header
 * @param {{}[]} data
 * @param {{}} options
 * @param {string} delimiter
 * @returns {string}
 */
const makeCSV = (header, data, options = {}, delimiter = ',') => {
  const headerKeys = Object.keys(header);
  const csv = [Object.values(header)];

  data.forEach((it) => csv.push(
    headerKeys.map((key) => {
      const parts = key.split('.');
      let data = it;
      parts.forEach((subKey) => (data = data[subKey]));

      switch (options[key]) {
        case 'timestamp':
          data = new Date(data).toLocaleDateString();
      }

      return data;
    })
  ));

  return csv.map((it) => it.join(delimiter)).join('\n');
};
