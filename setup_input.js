const fs = require('fs');
const util = require('util');
const got = require('got');
const operators = require('open-data-jp-tokyo-railway-operators/operators.json');

const BASE_REQUEST = `https://api-tokyochallenge.odpt.org/api/v4/odpt:Station?acl:consumerKey=${process.env.CONSUMER_KEY}`;

async function generate() {
  const data = [];
  const pages = await Promise.all(operators.map((op) => got(`${BASE_REQUEST}&odpt:operator=odpt.Operator:${op.code}`)));
  pages.forEach(({ body }) => {
    const json = JSON.parse(body);
    data.push(...json);
  });
  return util.promisify(fs.writeFile)('./input/odpt_Tokyo_stations.json', JSON.stringify(data, null, '  '));
}

if (require.main === module) {
  generate();
}
