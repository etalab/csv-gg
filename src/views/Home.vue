<template>
    <b-container class="bv-example-row">
      <h1>CSV generator</h1>
      <h4 class="text-muted">Générez un fichier CSV valide suivant un schéma</h4>
      <div v-if="lines.length > 0" class="my-4">
          <b-table striped hover :items="items" :fields="fields">
              <template slot="actions" slot-scope="row">
                  <b-button size="sm" variant="danger" @click="deleteLine(row.index)" class="mr-1">
                      Supprimer
                  </b-button>
                </template>
          </b-table>
          <b-button :href="csvLink" :download="filename" type="button" variant="primary" class="mr-2">Télécharger le CSV</b-button>
          <b-button @click.prevent="addLine" :disabled="addingLine" type="button" variant="primary">Ajouter une ligne</b-button>
      </div>
      <b-form @submit.prevent="submit" v-show="addingLine" novalidate class="my-4">
          <div ref="container"></div>
          <b-button type="submit" variant="primary" :disabled="!hasValues">Valider la ligne</b-button>
      </b-form>
    </b-container>
</template>

<script>
import Vue from 'vue'
import StringField from '@/components/StringField.vue'
import { EventBus } from '@/event-bus.js';

// TODO choose schema from a select box (and/or a query arg)
const SCHEMA_NAME = 'etalab-decp-dpa'
const SCHEMA_URL = 'https://raw.githubusercontent.com/etalab/schema.data.gouv.fr/master/decp-dpa/schema.json'
const VALIDATA_URL = 'https://api.validata.etalab.studio/validate'

export default {
  name: 'home',
  components: {},
  data() {
      return {
          schema: {},
          errors: {},
          values: {},
          fieldNames: [],
          faultyFields: [],
          lines: [],
          formValidated: false,
          addingLine: true,
          hasValues: false,
      }
  },
  mounted() {
      // TODO add polyfill
      fetch(SCHEMA_URL).then((res) => {
          return res.json()
      }).then((schema) => {
          this.schema = schema
          schema.fields.forEach((field) => {
              this.fieldNames.push(field.name)
              this.addStringField(field)
          })
      })
      EventBus.$on('field-value-changed', (field, value) => {
          this.values[field] = value
          this.computeHasValues()
      })
  },
  computed: {
      filename() {
          let date = new Date()
          return [
              SCHEMA_NAME,
              date.toISOString()
          ].join('-')
      },
      fields() {
          return [...this.fieldNames.map(f => {
              return {
                  key: f,
                  label: f,
              }
          }), {key: 'actions', label: ''}]
      },
      csvLink() {
          let csv = this.buildFullCsvContent();
          let data = new Blob([csv], {type: 'text/csv'});
          return window.URL.createObjectURL(data);
      },
      items() {
          return this.lines.map((line) => {
              let obj = {}
              this.fieldNames.forEach((field, idx) => {
                  obj[field] = line[idx]
              })
              return obj
          })
      }
  },
  methods: {
      // in a method because of {} binding not allowed
      computeHasValues() {
          this.hasValues = Object.keys(this.values).length > 0 && Object.values(this.values).some(v => v !== '')
      },
      buildHeaderLine() {
          return this.fieldNames.map(v => `"${v}"`).join(',')
      },
      getCurrentLine() {
          return this.fieldNames.map(f => {
              return this.values[f] || ''
          })
      },
      buildLine(line) {
          return line.map(v => `"${v}"`).join(',')
      },
      buildCurrentCsvContent() {
          return [
              this.buildHeaderLine(),
              this.buildLine(this.getCurrentLine()),
          ].join('\r\n')
      },
      buildFullCsvContent() {
          let lines = this.lines.map(l => {
              return this.buildLine(l)
          })
          return [this.buildHeaderLine(), ...lines].join('\r\n')
      },
      buildFormData() {
          let formData = new FormData()
          var blob = new Blob([this.buildCurrentCsvContent()], {type: 'text/csv'})
          formData.append('file', blob, 'data.csv')
          formData.append('schema', SCHEMA_NAME)
          return formData
      },
      addStringField(field) {
          const StringFieldClass = Vue.extend(StringField)
          var instance = new StringFieldClass({
              propsData: {field: field}
          })
          instance.$mount()
          this.$refs.container.appendChild(instance.$el)
      },
      dispatchError(error) {
          let index = error['column-number']
          this.faultyFields.push(this.fieldNames[index-1])
          EventBus.$emit('field-error', this.fieldNames[index-1], error)
      },
      dispatchNoError() {
          this.fieldNames.forEach((field) => {
              if (this.faultyFields.indexOf(field) === -1) {
                  EventBus.$emit('field-no-error', field)
              }
          })
      },
      dispatchFormValidated() {
          EventBus.$emit('form-validated')
      },
      dispatchReset() {
          EventBus.$emit('form-reset')
      },
      submit() {
          let loader = this.$loading.show();
          fetch(VALIDATA_URL, {
              method: 'POST',
              body: this.buildFormData()
          })
          .then(r => r.json())
          .then(data => {
              this.formValidated = true
              this.faultyFields = []
              const errors = data.report.tables[0].errors
              if (errors && errors.length > 0) {
                  errors.forEach((error) => {
                      this.dispatchError(error)
                  })
              } else {
                  this.addingLine = false
                  this.lines.push(this.getCurrentLine())
              }
              this.dispatchNoError()
              this.dispatchFormValidated()
          }).finally(() => {
              loader.hide()
          })
      },
      addLine() {
          this.addingLine = true
          this.formValidated = false
          this.dispatchReset()
      },
      deleteLine(idx) {
          this.lines.splice(idx, 1)
          if (this.lines.length === 0) {
              this.addLine()
          }
      }
  }
}
</script>
