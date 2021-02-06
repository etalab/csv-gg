<template>
    <div>
        <schema-table v-if="schema" :schema-meta="schema" :schema-name="schemaName"></schema-table>
    </div>
</template>

<script>
import SchemaTable from './SchemaTable.vue'

const SCHEMAS_CATALOG_URL = process.env.VUE_APP_SCHEMAS_CATALOG_URL


export default {
  name: 'home',
  components: {
      SchemaTable
  },
  data() {
      return {
          schemaName: this.$route.query.schema,
          schemas: null,
          options: [],
          columnDefs: [],
          rows: [],
          selectedRow: null
      }
  },
  created () {
    this.formatData()
  },
  mounted() {
      let loader = this.$loading.show()
      fetch(`${SCHEMAS_CATALOG_URL}`).then(r => {
          return r.json()
      }).then(data => {
          this.schemas = data.schemas
          this.options = this.schemas.map(s => {
              return {value: s.name, text: s.title || s.name}
          })
      }).finally(() => {
          loader.hide()
      })
  },
  computed: {
      schema() {
          if (!this.schemaName) return
          if (!this.schemas) return
          return this.schemas.find(s => s.name === this.schemaName)
      }
  },
  watch: {
    schemaName(newVal) {
        this.$router.push({ query: { ...this.$route.query, schema: newVal } })
    }
  },
  methods: {
    formatData () {
      data.forEach(row => {
        this.formatRow(row)
      })
      this.rows = data
    },
    formatRow (row) {
      const red = '#ffe5e5'
      const green = '#b6f7b6'
      const { happiness } = row
      const priceRateBgColor = happiness > 0.6 ? green : red
      row.$cellStyle = {
        happiness: priceRateBgColor && { backgroundColor: priceRateBgColor }
      }
      if (row.eyeColor === 'blue') {
        row.$rowStyle = { color: 'blue' }
      }
    },
    cellUpdated ($event) {
      console.log('ooo');
      console.log($event)
    },
    rowSelected ($event) {
      console.log($event.rowData);
      this.selectedRow = $event.rowData
    },
    linkClicked ($event) {
      console.log("ff");
      console.log($event)
    },
    removeCurrentRow () {
      this.rows = this.rows.filter(row => row.id !== this.selectedRow.id)
    },
    contextMenu ($event) {
      console.log($event)
    }
  }
}






</script>

<style lang="scss">
#gridview {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  font-size: 14px;
  height: 400px;
}

.grid {
  height: 100%;
}

.ml-1 {
  margin-left: 10px;
}
</style>
