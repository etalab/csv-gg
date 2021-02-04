# Test local schemas using localtunnel

- install [localtunnel](https://localtunnel.github.io/www/)
- copy the table schema JSON file you want to test (e.g `my-table-schema.json`) in `public` folder
- create a [schema catalog](https://opendataschema.frama.io/catalog/schema-catalog.json) file (e.g. `my-schemas.json`) in `public` folder
  - schema catalog must refer to schema file(s) using `http://csvgg.loca.lt/` base url (e.g. `http://csvgg.local.lt/my-table-schema.json`)
- in `.env` file, replace `VUE_APP_SCHEMAS_CATALOG_URL` value by a reference to your local schema catalog file (e.g. `/my-schemas.json`)
- run csv-gg

```
npm run serve
```

- launch localtunnel:

```
lt --port 8081 --local-host localhost --subdomain csvgg
```

- access CSV-GG using http://csvgg.loca.lt

See `test/fixtures` for catalog schema and test schema examples
