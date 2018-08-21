## List of Japanese railway stations

The list of stations is generated using [ekidata](http://www.ekidata.jp/doc/line.php) data and integrated with information coming from the [Association for Open Data of Public Transportation](http://www.odpt.org/) using the query https://api-tokyochallenge.odpt.org/api/v4/odpt:Station

Naming the stations is not consistent across sources, and some manual effort was necessary to link the two datasets, however the result is not complete.

### Usage

Just grab the file `stations.json` it has a list of objects with the structure

```json
{
  "name_kanji": "代々木",
  "name_kana": "",
  "name_romaji": "",
  "alternative_names": [],
  "group_code": "1130207",
  "ekidata_line_ids": [
    "11302",
    "11313",
    "99301"
  ],
  "line_codes": [
    "JR-East.Yamanote",
    "JR-East.ChuoSobuLocal",
    "Toei.Oedo"
  ],
  "stations": [
    {
      "code": "JR-East.Yamanote.Yoyogi",
      "ekidata_id": "1130207",
      "ekidata_group_id": "1130207",
      "name_kanji": "代々木",
      "alternative_names": [],
      "ekidata_line_id": "11302",
      "line_code": "JR-East.Yamanote",
      "short_code": "JY18",
      "prefecture": "13",
      "lat": 35.683061,
      "lon": 139.702042
    },
    {
      "code": "JR-East.ChuoSobuLocal.Yoyogi",
      "ekidata_id": "1131311",
      "ekidata_group_id": "1130207",
      "name_kanji": "代々木",
      "alternative_names": [],
      "ekidata_line_id": "11313",
      "line_code": "JR-East.ChuoSobuLocal",
      "short_code": "JB11",
      "prefecture": "13",
      "lat": 35.683061,
      "lon": 139.702042
    },
    {
      "code": "Toei.Oedo.Yoyogi",
      "ekidata_id": "9930127",
      "ekidata_group_id": "1130207",
      "name_kanji": "代々木",
      "alternative_names": [],
      "ekidata_line_id": "99301",
      "line_code": "Toei.Oedo",
      "short_code": "E-26",
      "prefecture": "13",
      "lat": 35.683218,
      "lon": 139.701666
    }
  ]
}
```

Note that two keys are used, `ekidata_id` is the unique ID in the ekidata dataset, `code` is manually generated and matches the [Open Data naming conventions](https://developer-tokyochallenge.odpt.org/en/documents#_naming_rules_for_station_names_and_bus_stop_names).

The other object is a group station, it represents a set of lines that are accessible from the same station or nearby connected stations.
The `stations` object contains all the individual stations identified by a station and line.


## Related links

More [open data repositories](https://github.com/piuccio?utf8=%E2%9C%93&tab=repositories&q=open-data-jp&type=&language=).
