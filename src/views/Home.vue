<template>
    <div>
        <b-alert show dismissible>
            <h4 class="alert-heading">Mode d'emploi</h4>
            <p>Cet outil vous permet de créer un fichier CSV en vous assurant qu'il est conforme à un schéma, c'est-à-dire que ses données sont complètes, valides et structurées.</p>
            <ol class="mb-0">
                <li>Sélectionnez le schéma qui vous intéresse dans la liste déroulante, les schémas disponibles ici étant ceux référencés sur <a href="https://schema.data.gouv.fr">schema.data.gouv.fr</a>.</li>
                <li>Remplissez le formulaire à l'aide des descriptions des différents champs et des valeurs d'exemples. Les champs indiqués par un astérisque rouge doivent obligatoirement être renseignés au moment de la saisie.</li>
                <li>L'outil vous prévient d'éventuelles erreurs de validation, le cas échéant vous pouvez les corriger.</li>
                <li>Une fois votre formulaire valide, les valeurs apparaissent sous la forme d'une ligne dans un tableau récapitulatif.</li>
                <li>Vous pouvez alors choisir d'ajouter une ou plusieurs lignes (répétez les étapes 2 à 4) ou télécharger le fichier CSV correspondant au tableau récapitulatif.</li>
                <li v-if="schema && schema.name === 'etalab/schema-lieux-covoiturage'">Une fois votre fichier complété et téléchargé, vous pouvez l'envoyer à <a href="mailto:contact@transport.beta.gouv.fr">contact@transport.beta.gouv.fr</a> pour qu'il soit intégré à la base nationale.</li>
            </ol>
        </b-alert>
        <b-form-group
          label="Choisissez un schéma à utiliser :"
          :description="schema && schema.description ? schema.description : ''"
          class="my-4"
        >
            <b-form-select v-model="schemaName" :options="options">
                <template slot="first">
                  <option :value="null" disabled>Choisissez un schéma</option>
                </template>
            </b-form-select>
        </b-form-group>
        <b-alert v-if="schema && schema.name === 'etalab/schema-lieux-covoiturage'" show dismissible>
            <div>Pour toute question, n'hésitez pas à adresser un mail à <a href="mailto:contact@transport.beta.gouv.fr">contact@transport.beta.gouv.fr</a></div>
        </b-alert>

<!---
        <div v-if="schema" id="gridview">
            <vue-editable-grid
            class="grid"
            ref="grid"
            id="mygrid"
            :column-defs="columnDefs"
            :row-data="rows"
            row-data-key='id'
            @cell-updated="cellUpdated"
            @row-selected="rowSelected"
            @link-clicked="linkClicked"
            @context-menu="contextMenu"
            >
            <template v-slot:header>
                Vue editable grid, by eledwinn
                <a href="#" @click.prevent="removeCurrentRow" v-if="selectedRow" class="ml-1">Remove current row</a>
            </template>
            <template v-slot:header-r>
                Total rows: {{ rows.length }}
            </template>
            </vue-editable-grid>
        </div>
-->
        <schema-table v-if="schema" :schema-meta="schema" :schema-name="schemaName"></schema-table>

 <!---       <schema-form v-if="schema" :schema-meta="schema" :schema-name="schemaName"></schema-form> -->


    </div>
</template>

<script>
import SchemaForm from './SchemaForm.vue'
import SchemaTable from './SchemaTable.vue'

import VueEditableGrid from '../grid/VueEditableGrid.vue'

import data from '../data'


const SCHEMAS_CATALOG_URL = process.env.VUE_APP_SCHEMAS_CATALOG_URL


export const defaultDateFormat = 'MMM dd, yyyy'
export const defaultDateTimeFormat = 'MMM dd, yyyy h:mm a'

const numericFormatter = event => {
  if (event.reverse) {
    return event.value && +event.value.replace(' years')
  }
  return `${event.value} years`
}

const columnDefinition = [
  { sortable: true, filter: true, field: 'id', headerName: 'Id', editable: true },
  { sortable: true, filter: true, field: 'eyeColor', headerName: 'Eye color', editable: true },
  { sortable: true, filter: true, field: 'name', headerName: 'Name', editable: true },
  { sortable: true, filter: true, field: 'gender', headerName: 'gender', editable: true },
  { sortable: true, filter: true, field: 'company', headerName: 'Company', editable: true },
  { sortable: true, filter: true, field: 'email', headerName: 'Email', editable: true },
  { sortable: true, filter: true, field: 'Phone', headerName: 'Phone', editable: true },
  { sortable: true, filter: true, field: 'registered', headerName: 'registered', type: 'datetime', format: defaultDateTimeFormat, editable: true },
  { sortable: true, filter: true, field: 'registered', headerName: 'registered', type: 'date', format: defaultDateTimeFormat, editable: true },
  { sortable: true, filter: true, field: 'age', headerName: 'Age', type: 'numeric', editable: true },
  { sortable: true, filter: true, field: 'age', headerName: 'Age Formatted', type: 'numeric', editable: true, formatter: numericFormatter },
  { sortable: true, filter: true, field: 'balance', headerName: 'Balance', type: 'currency', editable: true },
  { sortable: true, filter: true, field: 'happiness', headerName: 'Happiness percent', type: 'percent', editable: true },
  { sortable: true, filter: true, field: 'isActive', headerName: 'Is active', type: 'boolean', editable: true },
  { sortable: true, filter: false, field: 'picture', headerName: 'Picture', type: 'link', editable: false }
]


export default {
  name: 'home',
  components: {
      SchemaForm,
      SchemaTable,
      VueEditableGrid
  },
  data() {
      return {
          schemaName: this.$route.query.schema,
          schemas: null,
          options: [],
          columnDefs: columnDefinition,
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
