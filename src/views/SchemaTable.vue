<template>
    <div ref="test">
        <vue-editable-grid
            class="grid"
            ref="grid"
            id="mygrid"
            :column-defs="columnDefs"
            :row-data="rows"
            :row-data-color="rowsColor"
            :field-names="fieldNames"
            row-data-key='id'
            @cell-updated="cellUpdated"
            @row-selected="rowSelected"
            @link-clicked="linkClicked"
            @context-menu="contextMenu"
            @add-empty-row='addEmptyRow'
            >
            <template v-slot:header>
            <!--<a href="#" @click.prevent="removeCurrentRow" v-if="selectedRow" class="ml-1">Remove current row</a>-->
            </template>
            <template v-slot:header-r>
                Nombre de lignes : {{ rows.length }}
            </template>
        </vue-editable-grid>
        <br />
        <p class='warningInfo'>{{ warningInfo }}</p>
        <br />
        <p class='errorInfo'>{{ errorInfo }}</p>
        <br /> 
        <b-alert show dismissible>
            <p>{{ messageInfo }}</p>
            <p>{{ exempleInfo }}</p>
        </b-alert>
        <b-form @submit.prevent="submit" novalidate class="my-4">
            <b-button type="submit" variant="primary">Valider la ligne</b-button> {{ validInfo }}
        </b-form>
        <br />
    </div>
</template>

<script>
import Vue from 'vue'
import StringField from '@/components/StringField.vue'
import SelectField from '@/components/SelectField.vue'
import RadioField from '@/components/RadioField.vue'
import { EventBus } from '@/event-bus.js';

import VueEditableGrid from '../grid/VueEditableGrid.vue'

const VALIDATA_API_URL = process.env.VUE_APP_VALIDATA_API_URL

export const defaultDateFormat = 'MMM dd, yyyy'
export const defaultDateTimeFormat = 'yyyy-M-dd'

const numericFormatter = event => {
  if (event.reverse) {
    return event.value && +event.value.replace(' years')
  }
  return `${event.value} years`
}

export default {
  name: 'schemaTable',
  components: {
      VueEditableGrid
  },
  props: {
      schemaMeta: Object,
      schemaName: String,
  },
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
          fieldNodes: [],
          columnDefs: [{field: 'selectCol', headerName:'',size:'40px',type:'supp'}],
          emptyRow: {},
          emptyRowInfo: {},
          emptyRowError: {},
          emptyRowColor: {},
          rows: [],
          rowsInfo: [],
          rowsError: [],
          rowsColor: [],
          selectedRow: null,
          toRemove: 0,
          messageInfo: 'Veuillez sélectionner une cellule',
          exempleInfo: '',
          warningInfo: '',
          validInfo: '',
          errorInfo: ''
      }
  },
  watch: {
      schemaMeta() {
          // executed every time a new schema is choosen, except the first time
          // reset everything (what a mess!)
          this.removeFieldNodes()
          this.lines = []
          this.addingLine = true
          this.fieldNames = []
          this.formValidated = false
          this.hasValues = false
          this.values = {}
          this.errors = {}
          this.faultyFields = []
          // launch a new form build
          this.columnDefs = [{field: 'selectCol', headerName:'',size:'40px',type:'supp'}]
          this.emptyRow = {}
          this.emptyRowInfo = {}
          this.emptyRowError = {}
          this.emptyRowColor = {}
          this.rows = []
          this.rowsInfo = []
          this.rowsError = []
          this.rowsColor = []
          this.selectedRow = null
          this.toRemove = 0
          this.messageInfo = 'Veuillez sélectionner une cellule'
          this.exempleInfo = ''
          this.warningInfo = ''
          this.validInfo = ''
          this.errorInfo = ''
          this.buildForm()                  
          this.rows.push(this.emptyRow)  
          this.rowsInfo.push(this.emptyRowInfo)
          this.rowsError.push(this.emptyRowError)
          this.rowsColor.push(this.emptyRowColor)
          this.formatData()
      }
  },
  mounted() {
      this.buildForm()
      EventBus.$on('field-value-changed', (field, value) => {
          this.values[field] = value
          this.computeHasValues()
      })     
      this.rows.push(this.emptyRow)
      this.rowsInfo.push(this.emptyRowInfo)
      this.rowsError.push(this.emptyRowError)
      this.rowsColor.push(this.emptyRowColor)
      this.formatData()
  },
  computed: {
      filename() {
          let date = new Date()
          let name = [
              this.schemaName,
              date.toISOString()
          ].join('_')
          return `${name}.csv`
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
          // Forcing UTF-8 encoding. See https://stackoverflow.com/questions/17879198
          let data = new Blob(["\uFEFF" + csv], {type: 'text/csv'});
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
      buildForm() {
          let loader = this.$loading.show();
          fetch(this.schemaMeta.schema_url).then(r => {
              return r.json()
          }).then(data => {
              this.schema = data
              this.schema.fields.forEach((field) => {
                  this.fieldNames.push(field.name)
                  //this.fieldNodes.push(this.addField(field))
                  let myobj = {}
                  myobj['sortable'] = true
                  myobj['filter'] = true
                  myobj['field'] = field.name
                  myobj['headerName'] = field.name
                  myobj['editable'] = true 

                  if(field.constraints.required){
                      myobj['bgColor'] = '#D2ECC1'
                      this.emptyRowColor[field.name] = '#D2ECC1'
                  }else{
                      myobj['bgColor'] = '#F9F0C5'
                      this.emptyRowColor[field.name] = '#F9F0C5'
                  }

                  if(field.type == 'string'){
                    this.emptyRow[field.name] = ''
                    this.emptyRowInfo[field.name] = ''
                    this.emptyRowError[field.name] = ''
                  }else if(field.type == 'date'){
                    myobj['type'] = 'date'
                    myobj['format'] = defaultDateTimeFormat
                    this.emptyRow[field.name] = null
                    this.emptyRowInfo[field.name] = null
                    this.emptyRowError[field.name] = null
                  }else if(field.type == 'number'){
                    myobj['type'] = 'numeric'
                    this.emptyRow[field.name] = null
                    this.emptyRowInfo[field.name] = null
                    this.emptyRowError[field.name] = null
                  }else if(field.type == 'integer'){
                    myobj['type'] = 'numeric'
                    this.emptyRow[field.name] = null
                    this.emptyRowInfo[field.name] = null
                    this.emptyRowError[field.name] = null
                  }
                  this.columnDefs.push(myobj)
              })
              let uniqueid = this.makeid(15);
              this.emptyRow['idRowVEG'] = uniqueid;
              this.emptyRowInfo['idRowVEG'] = uniqueid;
              this.emptyRowError['idRowVEG'] = uniqueid;
              this.emptyRowColor['idRowVEG'] = '#ebebeb';
              console.log(this.emptyRow['idRowVEG']);
          }).finally(() => {
              loader.hide()
          })
      },
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
          let linecsv = ''
          let cpt = 0
          this.fieldNames.forEach((field) => {
              if(cpt == 0){
                linecsv = '"'+line[field]+'"'
                cpt = 1
              }else{
                linecsv = linecsv+',"'+line[field]+'"'
              }
          })
          return linecsv
      },
      buildCurrentCsvContent() {
          let finalcsv = ''
          finalcsv = this.buildHeaderLine()
          console.log('length')
          console.log(this.rows.length)
          this.rows.forEach((row) => {
              finalcsv = finalcsv+"\r\n"
              finalcsv = finalcsv+this.buildLine(row)
          });
          console.log('final')
          console.log(finalcsv)

          return finalcsv
      },
      buildFullCsvContent() {
          let lines = this.lines.map(l => {
              return this.buildLine(l)
          })
          return [this.buildHeaderLine(), ...lines].join('\r\n')
      },
      buildFormData() {
          let formData = new FormData()
          // Forcing UTF-8 encoding. See https://stackoverflow.com/questions/17879198
          var blob = new Blob(["\uFEFF" + this.buildCurrentCsvContent()], {type: 'text/csv'})
          formData.append('file', blob, 'data.csv')
          formData.append('schema', this.schemaMeta.schema_url)
          return formData
      },
      removeFieldNodes() {
          this.fieldNodes.forEach((child) => {
              this.$refs.test.removeChild(child)
          })
          this.fieldNodes = []
      },
      addField(field) {
          const hasEnum = field.constraints && field.constraints.enum
          const isBoolean = field.type === "boolean"

          const factory = (klass, field) => {
            const className = Vue.extend(klass)
            let instance = new className({propsData: { field }})
            instance.$mount()
            return this.$refs.test.appendChild(instance.$el)
          }

          if (hasEnum) {
            return factory(SelectField, field)
          } else if (isBoolean) {
            return factory(RadioField, field)
          }
          return factory(StringField, field)
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
          fetch(`${VALIDATA_API_URL}/validate`, {
              method: 'POST',
              body: this.buildFormData()
          })
          .then(r => r.json())
          .then(data => {
              this.formValidated = true
              this.faultyFields = []
              const errors = data.report.tables[0].errors
              if (errors && errors.length > 0) {
                  this.validInfo = 'Il y a des erreurs TBC...'
                  errors.forEach((error) => {
                      console.log("error")
                      if(error.code == 'pattern-constraint' | error.code == 'type-or-format-error'){
                          this.rowsError[error['row-number'] - 2][this.fieldNames[error['column-number']-1]] = error.content
                          this.rowsColor[error['row-number'] - 2][this.fieldNames[error['column-number']-1]] = "#FF0000"
                          this.$refs.grid.selectCell(error['row-number'] - 2,1)
                      }
                      //this.dispatchError(error)
                  })
              } else {
                  this.validInfo = 'Fichier valide et prêt pour publication'
                  //this.addingLine = false
                  //this.lines.push(this.getCurrentLine())
                  //this.values = {}
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
      },
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
      console.log('eee');
      console.log($event)
      console.log('ppp')
      if($event.column.field.toLowerCase().includes('insee')){
          this.handleInseeInput($event)
      }
      if($event.column.field.toLowerCase().includes('siret')){
          this.handleSiretInput($event)
      }
      if($event.column.field.toLowerCase().includes('siren')){
          this.handleSirenInput($event)
      }
      if($event.column.field.toLowerCase().includes('codepostal') | $event.column.field.toLowerCase().includes('code-postal') | $event.column.field.toLowerCase().includes('code_postal')){
          this.handlePostcodeInput($event)
      }
      console.log(this.rows)
    },
    rowSelected ($event) {
      console.log('xz')
      this.selectedRow = $event.rowData
      console.log($event)
      this.schema.fields.forEach((field) => {
          if(field.name == $event.colData.field){
              this.messageInfo = field.description
              this.exempleInfo = "Exemple : "+field.example
          }
      })
      this.warningInfo = this.rowsInfo[$event.rowIndex][$event.colData.field]
      this.errorInfo = this.rowsError[$event.rowIndex][$event.colData.field]
      console.log(this.warningInfo)
      if($event.colData.field == 'selectCol'){
          this.removeCurrentRow()
          this.$refs.grid.selectCell(0,1)
      }
    },
    linkClicked ($event) {
      console.log("ff");
      console.log($event)
    },
    removeCurrentRow () {
      this.rows = this.rows.filter(row => row.idRowVEG !== this.selectedRow.idRowVEG)
    },
    contextMenu ($event) {
      console.log($event)
    },
    addEmptyRow($event){
        console.log('yeah');
        console.log(this.emptyRow);
        console.log(this.rows);
        
        let myobj = {}
        let myobjInfo = {}
        let myobjError = {}
        let myobjColor = {}
        this.schema.fields.forEach((field) => {

            if(field.constraints.required){
                myobjColor[field.name] = '#D2ECC1'  
            }else{
                myobjColor[field.name] = '#F9F0C5'  
            }

            if(field.type == 'string'){
            myobj[field.name] = ''
            myobjInfo[field.name] = ''
            myobjError[field.name] = ''
            }else if(field.type == 'date'){
            myobj['type'] = 'date'
            myobj['format'] = defaultDateTimeFormat
            myobj[field.name] = null
            myobjInfo['type'] = 'date'
            myobjInfo['format'] = defaultDateTimeFormat
            myobjInfo[field.name] = null
            myobjError['type'] = 'date'
            myobjError['format'] = defaultDateTimeFormat
            myobjError[field.name] = null
            }else if(field.type == 'number'){
            myobj['type'] = 'numeric'
            myobj[field.name] = null
            myobjInfo['type'] = 'numeric'
            myobjInfo[field.name] = null
            myobjError['type'] = 'numeric'
            myobjError[field.name] = null
            }else if(field.type == 'integer'){
            myobj['type'] = 'numeric'
            myobj[field.name] = null
            myobjInfo['type'] = 'numeric'
            myobjInfo[field.name] = null
            myobjError['type'] = 'numeric'
            myobjError[field.name] = null
            }
        })
        let uniqueid = this.makeid(15);
        myobj['idRowVEG'] = uniqueid;
        myobjInfo['idRowVEG'] = uniqueid;
        myobjError['idRowVEG'] = uniqueid;
        myobjColor['idRowVEG'] = '#ebebeb';
        this.rows.push(myobj);
        this.rowsInfo.push(myobjInfo);
        this.rowsError.push(myobjError);
        this.rowsColor.push(myobjColor);

    },
    makeid(length){
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        var result = ''
        for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result
    },

    handleInseeInput(event) {
        fetch(`https://geo.api.gouv.fr/communes/${event.value}`).then(r => {
            if (!r.ok) {
                this.city = null
                throw new Error("Not 200 response")
            }
            return r.json()
        }).then(data => {
            this.city = data.nom
            this.rowsInfo[event.rowIndex][event.column.field] = "Info : Ce code INSEE correspond à "+data.nom+"."
            this.$refs.grid.selectCell(event.rowIndex,event.columnIndex)
        })
        .catch(_ => _)
    },
    handleSiretInput(event) {
        this.siretDescription = null
        if (event.value.length !== 14) return

        fetch(`https://entreprise.data.gouv.fr/api/sirene/v3/etablissements/${event.value}`).then(r => {
            if (!r.ok) {
                this.siretDescription = null
                throw new Error("Not 200 response")
            }
            return r.json()
        }).then(data => {
            this.siretDescription = data.etablissement.unite_legale.denomination
            this.rowsInfo[event.rowIndex][event.column.field] = "Info : Ce SIRET correspond à "+data.etablissement.unite_legale.denomination+"."
            this.$refs.grid.selectCell(event.rowIndex,event.columnIndex)
        })
        .catch(_ => _)
    },
    handleSirenInput(event) {
        this.sirenDescription = null
        if (event.value.length !== 9) return

        fetch(`https://entreprise.data.gouv.fr/api/sirene/v3/unites_legales/${event.value}`).then(r => {
            if (!r.ok) {
                this.sirenDescription = null
                throw new Error("Not 200 response")
            }
            return r.json()
        }).then(data => {
            this.sirenDescription = data.unite_legale.denomination
            this.rowsInfo[event.rowIndex][event.column.field] = "Info : Ce SIREN correspond à "+data.unite_legale.denomination+"."
            this.$refs.grid.selectCell(event.rowIndex,event.columnIndex)
        })
        .catch(_ => _)
    },
    handlePostcodeInput(event) {
        fetch(`https://geo.api.gouv.fr/communes?codePostal=${event.value}&boost=population`).then(r => {
            if (!r.ok) {
                this.city = null
                throw new Error("Not 200 response")
            }
            return r.json()
        }).then(data => {
            this.city = data.map(c => c.nom).join(' ou ')
            this.rowsInfo[event.rowIndex][event.column.field] = "Info : Ce code postal correspond à "+data.map(c => c.nom).join(' ou ')+"."
            this.$refs.grid.selectCell(event.rowIndex,event.columnIndex)
        })
        .catch(_ => _)
    },
    fieldHasKeyword(keyword) {
        const name = this.field.name.toLowerCase()
        const description = (this.field.description || "").toLowerCase()
        return name.includes(keyword) || new RegExp(`\\b${keyword}\\b`).test(description)
    },

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

.warningInfo {
    color: green;
    font-style: italic;
}
.errorInfo {
    color: red;
    font-style: italic;
}

</style>
