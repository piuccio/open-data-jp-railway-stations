// @flow
const listOfLines = require('open-data-jp-railway-lines/lines.json');
const opendataStations/*: Array<OpenDataStation> */ = require('../input/odpt_Tokyo_stations.json');
const mapOfLinesByCode = listOfLines.reduce((all, line) => {
  if (line.code && line.ekidata_id) {
    all[line.ekidata_id] = (all[line.ekidata_id] || []).concat(line.code);
  }
  return all;
}, {});
const RAILWAY_PREFIX = 'odpt.Railway:'.length;
const STATION_PREFIX = 'odpt.Station:'.length;
const ALTERNATIVE_OPENDATA_NAMES = {
  '2800615_麹町': '麴町',
  '2400704_笹塚': '笹塚',
  '2400104_笹塚': '笹塚',
  '2300142_空港第２ビル（第２旅客ターミナル）': '空港第２ビル',
  '2300143_成田空港（第１旅客ターミナル）': '成田空港',
  '1132704_空港第２ビル（第２旅客ターミナル）': '空港第２ビル',
  '1132705_成田空港（第１旅客ターミナル）': '成田空港',
  '2300610_空港第２ビル（第２旅客ターミナル）': '空港第２ビル',
  '2300611_成田空港（第１旅客ターミナル）': '成田空港',
  '2300201_押上（スカイツリー前）': '押上(スカイツリー前)',
  '2100203_押上〈スカイツリー前〉': '押上(スカイツリー前)',
  '9930220_押上（スカイツリー前）': '押上',
  '2100217_獨協大学前駅〈草加松原〉': '獨協大学前<草加松原>',
  '2400701_新線新宿': '新宿',
  '2700505_ＹＲＰ野比': 'YRP野比',
  '1133002_祇園': '祗園',
  '1132907_鹿島サッカースタジアム（臨）': '鹿島サッカースタジアム',
  '1140926_ヤナバスキー場前': 'ヤナバスキー場前（臨時）',
};

class Group {
  // These properties will be available in the output object
  /*:: group_code: string */
  /*:: name_kanji: string */
  /*:: name_kana: string */
  /*:: name_romaji: string */
  /*:: stations: Array<Station> */

  constructor(code/*: string */) {
    this.group_code = code;
    this.stations = [];
  }

  add(station/*: EkidataStation */) {
    this.stations.push(...matchEkidataWithOpendata(station));
  }

  opendataStationCodes()/*: Array<string> */ {
    return this.stations.reduce((list, s) => {
      const opendataCode = s.code;
      if (opendataCode && !list.includes[opendataCode]) {
        list.push(opendataCode);
      }
      return list;
    }, []);
  }

  toJson()/*: StationGroupObject */ {
    // Find the most representative station name
    /*::
    type dist = {
      count: number,
      objects: Array<Station>,
    }
    */
    const distribution/*: { [string]: dist } */ = {};
    const stationsAsJson = [];
    const ekidata_line_ids = [];
    const line_codes = [];

    this.stations.forEach((station) => {
      if (!distribution[station.name_kanji]) {
        distribution[station.name_kanji] = {
          count: 0,
          objects: [],
        };
      }
      distribution[station.name_kanji].count += 1;
      distribution[station.name_kanji].objects.push(station);
      if (!ekidata_line_ids.includes(station.ekidata_line_id)) ekidata_line_ids.push(station.ekidata_line_id);
      if (station.line_code && !line_codes.includes(station.line_code)) line_codes.push(station.line_code);
      stationsAsJson.push(station.toJson());
    });
    const mostCommon = getMostCommon(Object.entries(distribution));
    const name_kanji = mostCommon[0];
    const name_romaji = findIn(mostCommon[1].objects, 'name_romaji');
    const name_kana = findIn(mostCommon[1].objects, 'name_kana');

    return {
      name_kanji,
      name_kana,
      name_romaji,
      alternative_names: [],
      group_code: this.group_code,
      ekidata_line_ids,
      line_codes,
      stations: stationsAsJson,
    }
  }
}

function matchEkidataWithOpendata(station/*: EkidataStation */)/*: Array<Station> */ {
  // a single station coul have two different opendata id, treat them as two stations
  const ekiName = station.station_name;
  const ekiCode = station.station_cd;
  const ekiLine = station.line_cd;
  const openLines = mapOfLinesByCode[ekiLine] || [];
  const matchingStations = opendataStations.filter((s) => {
    const isSameLine = openLines.includes(s['odpt:railway'].substring(RAILWAY_PREFIX));
    const searchName = ALTERNATIVE_OPENDATA_NAMES[`${ekiCode}_${ekiName}`] || ekiName;
    const isSameStation = s['odpt:stationTitle'].ja === searchName;
    return isSameLine && isSameStation;
  });

  if (matchingStations.length === 0) {
    return [new Station(station)];
  }
  return matchingStations.map((openStation) => new Station(station, openStation));
}

function getMostCommon(array/*: Array<[string, any]> */) {
  const sorted = array.sort((a, b) => b[1].count - a[1].count);
  return sorted[0];
}

function findIn(array, key)/*: string */ {
  const value = array.find((obj) => !!obj[key]);
  return value ? value[key] : '';
}

class Station {
  // These properties will be available in the output object
  /*:: code: string */
  /*:: ekidata_id: string */
  /*:: ekidata_line_id: string */
  /*:: line_code: string */
  /*:: name_kanji: string */
  /*:: name_kana: string */
  /*:: name_romaji: string */
  /*:: alternative_names: Array<string> */
  /*:: short_code: string */
  /*:: prefecture: string */
  /*:: lat: number */
  /*:: lon: number */

  // Internal properties
  /*:: station: EkidataStation */
  /*:: openStation: ?OpenDataStation */

  constructor(station/*: EkidataStation */, openStation/*: ?OpenDataStation */) {
    this.code = openStation ? openStation['owl:sameAs'].substring(STATION_PREFIX) : '';
    this.name_kanji = station.station_name;

    const openName = openStation && openStation['odpt:stationTitle'].ja;
    this.alternative_names = openName && openName !== station.station_name ? [openName] : [];
    this.lat = Number(station.lat);
    this.lon = Number(station.lon);

    this.station = station;
    this.openStation = openStation;
    this.ekidata_line_id = station.line_cd;
    this.line_code = openStation ? openStation['odpt:railway'].substring(RAILWAY_PREFIX) : '';
  }

  toJson()/*: StationObject */ {
    return {
      // codes
      code: this.code,
      ekidata_id: this.station.station_cd,
      ekidata_group_id: this.station.station_g_cd,
      // names
      name_kanji: this.name_kanji,
      name_kana: this.name_kana,
      name_romaji: this.name_romaji,
      alternative_names: this.alternative_names,
      // line
      ekidata_line_id: this.ekidata_line_id,
      line_code: this.line_code,
      short_code: this.openStation ? this.openStation['odpt:stationCode'] : '',
      // location
      prefecture: this.station.pref_cd.padStart(2, '0'),
      lat: this.lat,
      lon: this.lon,
    };
  }
}

module.exports = { Group, Station };
