<template>
  <div>
    <div v-if="lines.length > 0" class="my-4">
      <b-table striped hover :items="items" :fields="fields">
        <template slot="actions" slot-scope="row">
          <b-button
            size="sm"
            variant="danger"
            @click="deleteLine(row.index)"
            class="mr-1"
          >
            Supprimer
          </b-button>
        </template>
      </b-table>
      <b-button
        :href="csvLink"
        :download="filename"
        type="button"
        variant="primary"
        class="mr-2"
        >Télécharger le CSV</b-button
      >
      <b-button
        type="button"
        variant="primary"
        class="mr-2"
        :disabled="!userLoggedInWithSomeOrganizations"
        :title="publishButtonTitle"
        v-b-modal="'publish-modal'"
        >Publier sur data.gouv.fr</b-button
      >
      <b-button
        @click.prevent="addLine"
        :disabled="addingLine"
        type="button"
        variant="primary"
        >Ajouter une ligne</b-button
      >
      <!-- Publish modal -->
      <b-modal
        id="publish-modal"
        title="Publier sur data.gouv.fr"
        ok-title="Publier"
        :ok-disabled="publishButtonDisabled"
        v-on:ok="publishDataset"
        cancel-title="Annuler"
      >
        <publish-form
          v-model="dataToPublish"
          :schemaName="schemaName"
          :organizations="userOrganizations"
          v-on:form-state-change="togglePublishButtonState"
        />
      </b-modal>
    </div>
    <b-form
      @submit.prevent="submit"
      v-show="addingLine"
      novalidate
      class="my-4"
    >
      <div ref="container"></div>
      <b-button type="submit" variant="primary" :disabled="!hasValues"
        >Valider la ligne</b-button
      >
    </b-form>
  </div>
</template>

<script>
import Vue from 'vue'
import StringField from '@/components/StringField.vue'
import SelectField from '@/components/SelectField.vue'
import RadioField from '@/components/RadioField.vue'
import PublishForm from '@/components/PublishForm.vue'
import { EventBus } from '@/event-bus.js'

const VALIDATA_API_URL = process.env.VUE_APP_VALIDATA_API_URL

export default {
  name: 'schemaForm',
  components: {
    PublishForm
  },
  props: {
    schemaMeta: Object,
    schemaName: String
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
      publishButtonDisabled: true
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
      this.buildForm()
    }
  },
  mounted() {
    this.buildForm()
    EventBus.$on('field-value-changed', (field, value) => {
      this.values[field] = value
      this.computeHasValues()
    })
  },
  computed: {
    filename() {
      let date = new Date()
      let name = [this.schemaName, date.toISOString()].join('_')
      return `${name}.csv`
    },
    fields() {
      return [
        ...this.fieldNames.map(f => {
          return {
            key: f,
            label: f
          }
        }),
        { key: 'actions', label: '' }
      ]
    },
    csvLink() {
      const csv = this.buildFullCsvContent()
      // Forcing UTF-8 encoding. See https://stackoverflow.com/questions/17879198
      let data = new Blob(['\uFEFF' + csv], { type: 'text/csv' })
      return window.URL.createObjectURL(data)
    },
    items() {
      return this.lines.map(line => {
        let obj = {}
        this.fieldNames.forEach((field, idx) => {
          obj[field] = line[idx]
        })
        return obj
      })
    },
    user() {
      return this.$store.state.auth.user
    },
    userLoggedIn() {
      return this.user && this.user.loggedIn
    },
    userLoggedInWithSomeOrganizations() {
      return this.userLoggedIn && this.user.data.organizations.length > 0
    },
    publishButtonTitle() {
      if (!this.userLoggedIn) {
        return 'Connectez-vous pour publier une ressource'
      }
      if (this.user.data.organizations.length == 0) {
        return 'Inscrivez-vous à une organisation pour publier une ressource'
      }
      return 'Publier le jeu de données'
    },
    userOrganizations() {
      if (!this.userLoggedIn) {
        return []
      }
      return this.user.data.organizations.map(org => ({
        value: org.id,
        text: org.name
      }))
    }
  },
  methods: {
    buildForm() {
      let loader = this.$loading.show()
      fetch(this.schemaMeta.schema_url)
        .then(r => {
          return r.json()
        })
        .then(data => {
          this.schema = data
          this.schema.fields.forEach(field => {
            this.fieldNames.push(field.name)
            this.fieldNodes.push(this.addField(field))
          })
        })
        .finally(() => {
          loader.hide()
        })
    },
    // in a method because of {} binding not allowed
    computeHasValues() {
      this.hasValues =
        Object.keys(this.values).length > 0 &&
        Object.values(this.values).some(v => v !== '')
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
        this.buildLine(this.getCurrentLine())
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
      // Forcing UTF-8 encoding. See https://stackoverflow.com/questions/17879198
      var blob = new Blob(['\uFEFF' + this.buildCurrentCsvContent()], {
        type: 'text/csv'
      })
      formData.append('file', blob, 'data.csv')
      formData.append('schema', this.schemaMeta.schema_url)
      return formData
    },
    removeFieldNodes() {
      this.fieldNodes.forEach(child => {
        this.$refs.container.removeChild(child)
      })
      this.fieldNodes = []
    },
    addField(field) {
      const hasEnum = field.constraints && field.constraints.enum
      const isBoolean = field.type === 'boolean'

      const factory = (klass, field) => {
        const className = Vue.extend(klass)
        let instance = new className({ propsData: { field } })
        instance.$mount()
        return this.$refs.container.appendChild(instance.$el)
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
      this.faultyFields.push(this.fieldNames[index - 1])
      EventBus.$emit('field-error', this.fieldNames[index - 1], error)
    },
    dispatchNoError() {
      this.fieldNames.forEach(field => {
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
      let loader = this.$loading.show()
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
            errors.forEach(error => {
              this.dispatchError(error)
            })
          } else {
            this.addingLine = false
            this.lines.push(this.getCurrentLine())
            this.values = {}
          }
          this.dispatchNoError()
          this.dispatchFormValidated()
        })
        .finally(() => {
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
    togglePublishButtonState(formState) {
      this.publishButtonDisabled = !formState
    },
    publishDataset() {
      // Get structured publish form content
      const publishContent = this.dataToPublish
      // add fresh CSV content
      publishContent.resource.content = this.buildFullCsvContent()

      // TODO: really publish
      alert(JSON.stringify(publishContent, null, 2))
    }
  }
}
</script>
