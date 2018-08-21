declare type StationObject = {
  code: string,
  ekidata_id: string,
  ekidata_group_id: string,
  name_kanji: string,
  name_kana: string,
  name_romaji: string,
  alternative_names: Array<string>,
  ekidata_line_id: string,
  line_code: string,
  short_code: string,
  prefecture: string,
  lat: number,
  lon: number,
}

declare type StationGroupObject = {
  group_code: string,
  name_kanji: string,
  name_kana: string,
  name_romaji: string,
  alternative_names: Array<string>,
  ekidata_line_ids: Array<string>,
  line_codes: Array<string>,
  stations: Array<StationObject>,
}

declare type EkidataStation = {
  station_cd: string,
  station_g_cd: string,
  station_name: string,
  station_name_k: string,
  station_name_r: string,
  line_cd: string,
  pref_cd: string,
  post: string,
  add: string,
  lon: string,
  lat: string,
  open_ymd: string,
  close_ymd: string,
  e_status: string,
  e_sort: string,
};

declare type OpenDataStation = {
  'owl:sameAs': string,
  'odpt:railway': string,
  'odpt:stationTitle': OpenDataStationTitle,
  'odpt:stationCode': string,
}

declare type OpenDataStationTitle = {
  en: string,
  ja: string,
}
