<template>
    <div>
        <b-form-group
          label="Choisissez un schéma à utiliser :"
          :description="schemas && schemas[schemaName] ? schemas[schemaName].description : ''"
          class="my-4"
        >
            <b-form-select v-model="schemaName" :options="options">
                <template slot="first">
                  <option :value="null" disabled>Choisissez un schéma</option>
                </template>
            </b-form-select>
        </b-form-group>
        <schema-form v-if="schema" :schema-meta="schema" :schema-name="schemaName"></schema-form>
    </div>
</template>

<script>
import SchemaForm from './SchemaForm.vue'

const VALIDATA_API_URL = process.env.VUE_APP_VALIDATA_API_URL

export default {
  name: 'home',
  components: {SchemaForm},
  data() {
      return {
          schemaName: this.$route.query.schema,
          schemas: null,
          options: [],
      }
  },
  mounted() {
      let loader = this.$loading.show()
      fetch(`${VALIDATA_API_URL}/schemas`).then(r => {
          return r.json()
      }).then(data => {
          this.schemas = data.schemas
          this.options = Object.keys(this.schemas).map(schema => {
              return {
                  value: schema,
                  text: this.schemas[schema].title
              }
          })
      }).finally(() => {
          loader.hide()
      })
  },
  computed: {
      schema() {
          if (!this.schemaName) return
          if (!this.schemas) return
          return this.schemas[this.schemaName]
      }
  },
  watch: {
    schemaName(newVal) {
        this.$router.push({ query: { ...this.$route.query, schema: newVal } })
    }
  }
}
</script>
