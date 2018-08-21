const util = require('util');
const fs = require('fs');
const csv = require('csv-parse');
const listOfStations = require('./input/odpt_Tokyo_stations.json');
const listOfLines = require('open-data-jp-railway-lines/lines.json');
const { Group, Station } = require('./model/stations');

const RAILWAY_PREFIX = 'odpt.Railway:'.length;

async function readCsv(filePath, transform = (x) => x) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath).pipe(csv({ columns: true }, (err, data) => {
      if (err) reject(err);
      else resolve(transform(data));
    }));
  });
}

async function generate() {
  const ekidataStations = await readCsv('./input/station20180330free.csv');

  const mapOfLinesByCode = listOfLines.reduce((all, line) => {
    if (line.code && line.ekidata_id) {
      all[line.ekidata_id] = (all[line.ekidata_id] || []).concat(line.code);
    }
    return all;
  }, {});

  const opendataCodesFound = [];
  const groups = {};
  ekidataStations.forEach((station) => {
    if (station.e_status !== '0') return;
    const ekiGroup = station.station_g_cd;
    const ekiName = station.station_name;
    const ekiCode = station.station_cd;
    const ekiLine = station.line_cd;
    if (!groups[ekiGroup]) {
      groups[ekiGroup] = new Group(ekiGroup);
    }
    groups[ekiGroup].add(station);
  });
  const data = Object.values(groups).map((group) => {
    opendataCodesFound.push(...group.opendataStationCodes());
    return group.toJson();
  });

  const numberOfEkiStation = ekidataStations.filter((s) => s.e_status === '0').length;
  const numberOfODStation = listOfStations.length;
  const numberOfEkiStationInTokyo = ekidataStations.reduce((count, station) => {
    if (station.e_status !== '0') return count;
    const line = station.line_cd;
    const prefecture = station.pref_cd;
    if (['11', '12', '13', '14'].includes(prefecture)) count += 1;
    return count;
  }, 0);

  listOfStations.filter((s) => !opendataCodesFound.includes(s['owl:sameAs'].substring(RAILWAY_PREFIX))).map((s) => {
    console.log('did not find', s['odpt:stationTitle'], s['odpt:railway']);
  })

  console.log(`Matched ${opendataCodesFound.length} open data stations out of ${numberOfODStation}.`);
  console.log(`Ekidata contains ${numberOfEkiStationInTokyo} in the Tokyo area, out of ${numberOfEkiStation}`);

  return util.promisify(fs.writeFile)('./stations.json', JSON.stringify(data, null, '  '));
}

if (require.main === module) {
  generate();
}
