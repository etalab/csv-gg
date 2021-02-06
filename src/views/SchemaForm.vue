<template>
  <div class="rf-container rf-pb-6w rf-pt-2w">
      <div v-if="!publicationReady">
        <h3>Saisir vos données via un formulaire</h3>
        <br />
        <div class="rf-callout rf-fi-information-line rf-callout--scheme-soft-blue-soft rf-mb-3w">
            <p>Cet outil vous permet de créer un fichier CSV en vous assurant qu'il est conforme à un schéma, c'est-à-dire que ses données sont complètes, valides et structurées.</p>
            <ol class="mb-0">
                <li>Remplissez le formulaire à l'aide des descriptions des différents champs et des valeurs d'exemples. Les champs indiqués par un astérisque rouge doivent obligatoirement être renseignés au moment de la saisie.</li>
                <li>L'outil vous prévient d'éventuelles erreurs de validation, le cas échéant vous pouvez les corriger.</li>
                <li>Une fois votre formulaire valide, les valeurs apparaissent sous la forme d'une ligne dans un tableau récapitulatif.</li>
                <li>Vous pouvez alors choisir d'ajouter une ou plusieurs lignes (répétez les étapes 1 à 4)</li>
                <li>Vous pouvez ensuite choisir de télécharger le fichier CSV ou de le publier directement sur la plateforme datagouv.</li>
                <li v-if="schemaMeta && schemaMeta.name === 'etalab/schema-lieux-covoiturage'">Une fois votre fichier complété et téléchargé, vous pouvez l'envoyer à <a href="mailto:contact@transport.beta.gouv.fr">contact@transport.beta.gouv.fr</a> pour qu'il soit intégré à la base nationale.</li>
            </ol>

            <div v-if="schemaMeta && schemaMeta.name === 'etalab/schema-lieux-covoiturage'">
                <br/>
                <div>Pour toute question, n'hésitez pas à adresser un mail à <a href="mailto:contact@transport.beta.gouv.fr">contact@transport.beta.gouv.fr</a></div>
            </div>
        </div>
        <br/>
      </div>
    <div v-if="!publicationReady && lines.length > 0" class="my-4">
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
        class="rf-btn"
        style="margin-right: 20px"
        >Télécharger le CSV</b-button
      >
      <b-button
        type="button"
        class="rf-btn"
        style="margin-right: 20px"
        :disabled="!userLoggedInWithSomeOrganizations"
        :title="publishButtonTitle"
        @click="showPublishForm()"
        >Publier sur data.gouv.fr</b-button
      >
      <b-button
        @click.prevent="addLine"
        :disabled="addingLine"
        type="button"
        class="rf-btn"
        style="margin-right: 20px"
        >Ajouter une ligne</b-button
      >
    </div>
    <b-form
      @submit.prevent="submit"
      v-show="addingLine"
      novalidate
      class="my-4"
    >
      <div ref="container"></div>
      <b-button 
        type="submit"
        class="rf-btn"
        style="margin-right: 20px" 
        :disabled="!hasValues"
        >Valider la ligne</b-button
      >
    </b-form>

    <div>
    

    <div v-if="publicationReady && !publicationOK" class="rf-container rf-pb-6w rf-pt-2w">
        <publish-form-upload
            v-model="dataToPublish"
            :schemaName="schemaName"
            :organizations="userOrganizations"
            :publicationIntro="publicationIntro"
            v-on:form-state-change="togglePublishButtonState"
        />
        <div v-if="!publishButtonDisabled">
            <button type="submit" class="rf-btn" title="Publier sur datagouv" @click="publishDataset()">Publier</button>
        </div>
        <div v-if="publishButtonDisabled">
            <button type="submit" class="rf-btn-light" title="Publier sur datagouv">Publier</button>
        </div>
    </div>

    <div v-if="publicationOK" class="rf-container rf-pb-6w rf-pt-2w">
        <h3>Félicitations, votre fichier a été uploadé sur datagouv avec succès !</h3>
        <br/><br/><br/>
        <div style="text-align: center;">
            <button @click="btnClick()" class="rf-btn" title="Voir le jeu de données sur Datagouv">Voir le jeu de données sur Datagouv</button>
        </div>
    </div>

  </div>


        <b-modal class="rf-container rf-pb-6w rf-pt-2w" ref="modal1" id="modal1" hide-footer title="Attention, vous n'êtes pas connectés">
          <div>
            <p>Pour publier vos données sur datagouv, il est nécessaire de vous connecter.</p>
          </div>
            <div class="button-boxes">
                <div style="padding-right: 30px; text-align: center;">
                  <client-only>
                      <nav-user />
                  </client-only>
                </div>
                <br /><br /><br />
                <div style="padding-right: 30px; text-align: center;">
                  <button class="rf-btn-light" block @click="hideModal">Je n'ai pas l'intention de publier mes données</button>
                </div>
              </div>
        </b-modal>

  </div>
</template>

<script>
import Vue from 'vue'
import StringField from '@/components/StringField.vue'
import SelectField from '@/components/SelectField.vue'
import RadioField from '@/components/RadioField.vue'
import AddressField from '@/components/AddressField.vue'
import PublishFormUpload from '@/components/PublishFormUpload.vue'
import { EventBus } from '@/event-bus.js';
import $api from '@/services/Api'

import ClientOnly from "vue-client-only"
import NavUser from "@/components/NavUser.vue"

const VALIDATA_API_URL = process.env.VUE_APP_VALIDATA_API_URL

const DGV_BASE_URL = process.env.VUE_APP_DATAGOUV_API_URL

const SCHEMAS_CATALOG_URL = process.env.VUE_APP_SCHEMAS_CATALOG_URL

export default {
  name: 'schemaForm',
  components: {
      PublishFormUpload,
      ClientOnly,
      NavUser
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
      publishButtonDisabled: true,
      publicationOK: false,
      publicationReady: false,
      publicationIntro: "Publiez vos données au format CSV dans un nouveau jeu de données",
          schemaName: this.$route.query.schema,
          schemas: null,
          options: [],
          schemaMeta: {},
          dataToPublish: {}
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
    let loader = this.$loading.show()
    fetch(`${SCHEMAS_CATALOG_URL}`).then(r => {
        return r.json()
    }).then(data => {
        this.schemas = data.schemas
        this.options = this.schemas.map(s => {
            return {value: s.name, text: s.title || s.name}
        })

        this.schema = this.schemas.find(s => s.name === this.schemaName)
        this.schemaMeta = this.schema
    }).finally(() => {
        loader.hide()
    })

    this.buildForm()
    EventBus.$on('field-value-changed', (field, value) => {
      this.values[field] = value
      this.computeHasValues()
    })

      //this.$refs['modal1'].show()
      if(!this.user.loggedIn){
        this.showModal()
      }
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
    csvBlob() {
      // Build CSV content
      let lines = this.lines.map(l => {
        return this.buildLine(l)
      })
      const csv = [this.buildHeaderLine(), ...lines].join('\r\n')
      // Forcing UTF-8 encoding. See https://stackoverflow.com/questions/17879198
      return new Blob(['\uFEFF' + csv], { type: 'text/csv' })
    },
    csvLink() {
      return window.URL.createObjectURL(this.csvBlob)
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
      console.log(this.userLoggedIn && this.user.data.organizations.length > 0)
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
      return this.userLoggedIn
        ? this.user.data.organizations
            .slice(0)
            .sort((a, b) => a.name > b.name)
            .map(org => ({
              value: org.id,
              text: org.name
            }))
        : []
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
    isAddressField(field) {
      const patterns = ['ad_', 'addr_', 'address', 'adr_', 'adresse']
      const lowerFieldName = field.name.toLowerCase()
      return patterns.some(elt => lowerFieldName.includes(elt))
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
      } else if (this.isAddressField(field)) {
        return factory(AddressField, field)
      }
      return factory(StringField, field)
    },
    removeFieldNodes() {
      this.fieldNodes.forEach(child => {
        this.$refs.container.removeChild(child)
      })
      this.fieldNodes = []
    },
    dispatchError(error) {
      let index = error.fieldNumber
        ? error.fieldNumber // new validation report
        : error['column-number'] // legacy validation report
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
          const errors = data.report.tasks
            ? data.report.tasks[0].errors   // new validation report
            : data.report.tables[0].errors  // legacy validation report
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


    updateDatasetUpdateResource(publishContent){

      console.log("updateDatasetUpdateResource")
      console.log(publishContent)
      $api
        .put(
          'datasets/'+publishContent.existingDataset,
          {
            title: publishContent.dataset.title,
            description: publishContent.dataset.description
          },
          err => {
            alert(`Erreur lors de la publication du jeu de données : ${err}`)
          }
        )
        .then(response => {
          // new dataset identifier
          const datasetId = response.data.id
          // Prepare resource file to upload
          const formData = new FormData()
          formData.append('file', this.csvBlob, 'data.csv')
          // Resource upload
          $api
            .post(
              `datasets/${datasetId}/resources/`+publishContent.existingResource+`/upload`,
              formData,
              err => {
                // eslint-disable-next-line
                console.log(
                  `Erreur lors du téléversement de la ressource : ${err}`
                )
              },
              { 'Content-Type': 'multipart/form-data' }
            )
            .then(response => {
              // New resource identifier
              const resourceId = response.data.id
              const payload = {
                title: publishContent.resource.title,
                schema: this.schemaName
              }
              // resource update
              // Warning: fails if schema name is not one of allowed values:
              // Allowed values: etalab/schema-irve, etalab/schema-decp-dpa, scdl/catalogue, scdl/deliberations,
              // scdl/equipements, scdl/subventions, etalab/schema-lieux-covoiturage, etalab/schema-stationnement,
              // scdl/budget, arsante/schema-dae, NaturalSolutions/schema-arbre, etalab/schema-inclusion-numerique"
              $api
                .put(
                  `datasets/${datasetId}/resources/${resourceId}/`,
                  payload,
                  err => {
                    alert(
                      `Erreur lors de la mise à jour de la ressource : ${err}`
                    )
                  }
                )
                .then(() => {
                  this.publicationOK = true
                  this.linkDgv = DGV_BASE_URL+"/datasets/"+publishContent.existingDataset
                })
            })
        })
    },
    updateDatasetCreateResource(publishContent){
      console.log("updateDatasetCreateResource")
      console.log(publishContent)
      $api
        .put(
          'datasets/'+publishContent.existingDataset,
          {
            title: publishContent.dataset.title,
            description: publishContent.dataset.description
          },
          err => {
            alert(`Erreur lors de la publication du jeu de données : ${err}`)
          }
        )
        .then(response => {
          // new dataset identifier
          const datasetId = response.data.id
          // Prepare resource file to upload
          const formData = new FormData()
          formData.append('file', this.csvBlob, 'data.csv')
          // Resource upload
          $api
            .post(
              `datasets/${datasetId}/upload`,
              formData,
              err => {
                // eslint-disable-next-line
                console.log(
                  `Erreur lors du téléversement de la ressource : ${err}`
                )
              },
              { 'Content-Type': 'multipart/form-data' }
            )
            .then(response => {
              // New resource identifier
              const resourceId = response.data.id
              const payload = {
                title: publishContent.resource.title,
                schema: this.schemaName
              }
              // resource update
              // Warning: fails if schema name is not one of allowed values:
              // Allowed values: etalab/schema-irve, etalab/schema-decp-dpa, scdl/catalogue, scdl/deliberations,
              // scdl/equipements, scdl/subventions, etalab/schema-lieux-covoiturage, etalab/schema-stationnement,
              // scdl/budget, arsante/schema-dae, NaturalSolutions/schema-arbre, etalab/schema-inclusion-numerique"
              $api
                .put(
                  `datasets/${datasetId}/resources/${resourceId}/`,
                  payload,
                  err => {
                    alert(
                      `Erreur lors de la mise à jour de la ressource : ${err}`
                    )
                  }
                )
                .then(() => {
                  this.publicationOK = true
                  this.linkDgv = DGV_BASE_URL+"/datasets/"+publishContent.existingDataset
                })
            })
        })
    },
    createDatasetCreateResource(publishContent){

      if(publishContent.organizationId == "me"){
          var body = {
            title: publishContent.dataset.title,
            description: publishContent.dataset.description
          }
      }else{
          var body = {
            title: publishContent.dataset.title,
            description: publishContent.dataset.description,
            organization: publishContent.organizationId
          }
      }
      $api
        .post(
          'datasets',
          body,
          err => {
            alert(`Erreur lors de la publication du jeu de données : ${err}`)
          }
        )
        .then(response => {
          // new dataset identifier
          const datasetId = response.data.id
          // Prepare resource file to upload
          const formData = new FormData()
          formData.append('file', this.csvBlob, 'data.csv')
          // Resource upload
          $api
            .post(
              `datasets/${datasetId}/upload`,
              formData,
              err => {
                // eslint-disable-next-line
                console.log(
                  `Erreur lors du téléversement de la ressource : ${err}`
                )
              },
              { 'Content-Type': 'multipart/form-data' }
            )
            .then(response => {
              // New resource identifier
              const resourceId = response.data.id
              const payload = {
                title: publishContent.resource.title,
                schema: this.schemaName
              }
              // resource update
              // Warning: fails if schema name is not one of allowed values:
              // Allowed values: etalab/schema-irve, etalab/schema-decp-dpa, scdl/catalogue, scdl/deliberations,
              // scdl/equipements, scdl/subventions, etalab/schema-lieux-covoiturage, etalab/schema-stationnement,
              // scdl/budget, arsante/schema-dae, NaturalSolutions/schema-arbre, etalab/schema-inclusion-numerique"
              $api
                .put(
                  `datasets/${datasetId}/resources/${resourceId}/`,
                  payload,
                  err => {
                    alert(
                      `Erreur lors de la mise à jour de la ressource : ${err}`
                    )
                  }
                )
                .then(() => {
                  this.publicationOK = true
                  this.linkDgv = DGV_BASE_URL+"/datasets/"+datasetId
                })
            })
        })
    },
    publishDataset() {
      // Get structured publish form content
      const publishContent = this.dataToPublish
      // Dataset creation
      
      // Si resource id : on modifie resource
      // Si pas de ressource id mais dataset id, on ajoute une ressource
      // Si pas de dataset id on créé un dataset avec ou sans orga avec la ressource
      if(publishContent.existingResource != ''){
          // Mise à jour dataset
          // Ecrasement resource
          // Modification metadonnées
          this.updateDatasetUpdateResource(publishContent)
      }else{
          if(publishContent.existingDataset != ''){
              // Mise à jour dataset
              // création nouvelle ressource
              // modiciation métaonnées
              this.updateDatasetCreateResource(publishContent)
          }else{
              // Création dataset
              // création ressource
              // modification métadonnées
              this.createDatasetCreateResource(publishContent)
          }
      }

    },
    showPublishForm(){
      this.publicationReady = true
    },
    btnClick(){
        window.open(this.linkDgv);
    },


      showModal() {
        this.$refs['modal1'].show()
      },
      hideModal() {
        this.$refs['modal1'].hide()
      }

    
  }
}
</script>
