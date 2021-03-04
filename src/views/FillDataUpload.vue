<template>
    <div style="min-height: 500px" >

        <div v-if="schema && !publicationReady" class="rf-container rf-pb-6w rf-pt-2w">
            <h3>{{ schema.title }} - Chargement des données</h3>
            <br />

            <div class="large-12 medium-12 small-12 cell">
                <label>Veuillez charger votre fichier :
                    <input type="file" id="file" ref="file" v-on:change="handleFileUpload()"/>
                </label>
                <br/><br/>
            </div>
            <br/>
            <br/>
            <div v-if="report">
                <h3>{{reportValidStatus}}</h3>
                <img v-bind:src="badgeUrl"/>
                <div v-if="reportErrorInfo">
                  <br/>
                  La tâche de validation a échouée. {{ reportErrorInfo }}.
                </div>
                <br/>
                <br/><br/>

                <vsa-list>
                <!-- Here you can use v-for to loop through items  -->
                <vsa-item v-if="reportStructureErrors.length != 0">
                    <vsa-heading>
                        Erreurs de structure ({{ reportStructureErrors.length }})
                    </vsa-heading>
                    <vsa-content>
                        <ul v-bind:key="error.name" v-for="error in reportStructureErrors">
                            <li><b>{{ error.name }}</b> : {{ error.note }}</li>
                        </ul>
                    </vsa-content>
                </vsa-item>
                <vsa-item v-if="reportContentErrors.length != 0" >
                    <vsa-heading>
                        Erreurs de contenu ({{ reportContentErrors.length }})
                    </vsa-heading>
                    <vsa-content>
                        <ul v-bind:key="error.name" v-for="error in reportContentErrors">
                            <li>
                              <b>{{ error.name }}</b> :
                              <span v-if="error.fieldName">
                                colonne <i>{{ error.fieldName }}</i>,
                              </span> rang {{ error.rowPosition }}
                            </li>
                        </ul>
                    </vsa-content>
                </vsa-item>
                <vsa-item v-if="reportRecos.length != 0">
                    <vsa-heading>
                        Recommandations ({{ reportRecos.length }})
                    </vsa-heading>
                    <vsa-content>
                        <ul v-bind:key="error.name" v-for="error in reportRecos">
                            <li><b>{{ error.name }}</b> : {{ error.message }}</li>
                        </ul>
                    </vsa-content>
                </vsa-item>
                <vsa-item v-if="reportJson.length != 0">
                    <vsa-heading>
                        Erreurs ({{ reportJson.length }})
                    </vsa-heading>
                    <vsa-content>
                        <ul v-bind:key="error" v-for="error in this.reportJson">
                            <li><b>{{ error }}</b></li>
                        </ul>
                    </vsa-content>
                </vsa-item>
                </vsa-list>
            </div>
            <br/><br/>
            <div v-if="publication">
                <button
                  type="submit"
                  class="rf-btn"
                  title="Publier sur datagouv"
                  @click="publicationForm()"
                >
                  {{ publicationMessage }}
                </button>
            </div>
        </div>

        <div v-if="publicationReady && !publicationOK" class="rf-container rf-pb-6w rf-pt-2w">
            <publish-form-upload
                v-model="dataToPublish"
                :schemaName="schemaName"
                :organizations="userOrganizations"
                :publicationIntro="publicationIntro"
                v-on:form-state-change="togglePublishButtonState"
            />
            <div v-if="!publishButtonDisabled">
                <button
                  type="submit"
                  class="rf-btn"
                  title="Publier sur datagouv"
                  @click="publishDataset()"
                >
                  Publier
                </button>
            </div>
            <div v-if="publishButtonDisabled">
                <button
                  type="submit"
                  class="rf-btn-light"
                  title="Publier sur datagouv"
                >
                  Publier
                </button>
            </div>
        </div>

        <div v-if="publicationOK" class="rf-container rf-pb-6w rf-pt-2w">
            <h3>Félicitations, votre fichier a été uploadé sur datagouv avec succès !</h3>
            <br/><br/><br/>
            <div style="text-align: center;">
                <button
                  @click="btnClick()"
                  class="rf-btn"
                  title="Voir le jeu de données sur Datagouv"
                >
                  Voir le jeu de données sur Datagouv
                </button>
            </div>
        </div>

        <b-modal
          class="rf-container rf-pb-6w rf-pt-2w"
          ref="modal1"
          id="modal1"
          hide-footer
          title="Attention, vous n'êtes pas connecté"
        >
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
                  <button
                    class="rf-btn-light"
                    block
                    @click="hideModal"
                  >
                    Je n'ai pas l'intention de publier mes données
                  </button>
                </div>
              </div>
        </b-modal>
    </div>
</template>

<script>

import ClientOnly from 'vue-client-only';
import {
  VsaList,
  VsaItem,
  VsaHeading,
  VsaContent,
} from 'vue-simple-accordion';

import PublishFormUpload from '../components/PublishFormUpload.vue';
import NavUser from '../components/NavUser.vue';

import PublishRessources from '../mixins/PublishResources.vue';

const lkInvalide = require('../static/images/badge-invalide.svg');
const lkPartiellementValide = require('../static/images/badge-partiellement-valide.svg');
const lkValide = require('../static/images/badge-valide.svg');

const VALIDATA_API_URL = process.env.VUE_APP_VALIDATA_API_URL;

export default {
  name: 'fillDataUpload',
  mixins: [PublishRessources],
  components: {
    VsaList,
    VsaItem,
    VsaHeading,
    VsaContent,
    PublishFormUpload,
    ClientOnly,
    NavUser,
  },
  data() {
    return {
      schemaObject: null,
      file: '',
      report: null,
      reportValidStatus: '',
      badgeUrl: null,
      reportStructureErrors: [],
      reportContentErrors: [],
      reportRecos: [],
      reportErrorInfo: null,
      reportJson: [],
      publication: false,
      publicationMessage: null,
      publicationReady: false,
      dataToPublish: {},
      publicationOK: false,
      linkDgv: '',
      contentFile: '',
      ext: '',
    };
  },
  computed: {
  },
  watch: {
  },
  methods: {
    handleFileUpload() {
      if (this.schema.schema_type == 'tableschema') {
        // eslint-disable-next-line prefer-destructuring
        this.file = this.$refs.file.files[0];
        this.report = null;
        this.reportValidStatus = null;
        this.reportStructureErrors = [];
        this.reportContentErrors = [];
        this.reportRecos = [];
        this.badgeUrl = null;
        this.reportErrorInfo = null;
        this.publication = false;
        this.publicationMessage = null;
        const formData = new FormData();
        formData.append('file', this.file);
        formData.append('schema', `https://schema.data.gouv.fr/schemas/${this.schemaName}/latest/schema.json`);

        fetch(`${VALIDATA_API_URL}/validate`, {
          method: 'POST',
          body: formData,
        })
        .then((r) => r.json())
        .then((data) => {
          this.report = data;
          if (data.report.errors.length > 0) {
            this.reportValidStatus = 'Malheureusement, le fichier soumis est invalide.';
            this.badgeUrl = lkInvalide;
            this.reportErrorInfo = data.report.errors[0].note;
          } else if (data.report.tables[0].errors) {
            if (data.report.tables[0].errors.length > 0) {
              this.reportValidStatus = 'Malheureusement, le fichier soumis est invalide.';
              this.badgeUrl = lkInvalide;
              this.reportErrors = data.report.tables[0].errors;

              data.report.tables[0].errors.forEach((error) => {
                if (error.tags.includes('#content')) {
                  this.reportContentErrors.push(error);
                }
                if (error.tags.includes('#structure')) {
                  this.reportStructureErrors.push(error);
                }
              });

              if (data.report.tables[0].structure_warnings.length > 0) {
                this.reportRecos = data.report.tables[0].structure_warnings;
              }
            } else if (data.report.tables[0].structure_warnings.length > 0) {
              this.reportValidStatus = 'Votre fichier est partiellement valide.';
              this.badgeUrl = lkPartiellementValide;
              this.reportRecos = data.report.tables[0].structure_warnings;
              this.publication = true;
              this.publicationMessage = 'Malgré les recommandations, publier sur datagouv';
              this.ext = "csv"
            } else {
              this.reportValidStatus = 'Félicitations, votre fichier est conforme au schéma !';
              this.badgeUrl = lkValide;
              this.publication = true;
              this.publicationMessage = 'Publier sur datagouv';
              this.ext = "csv"
            }
          }
        }).finally(() => {
          // eslint-disable-next-line no-console
          console.log('finally');
        });
      } else if (this.schema.schema_type == 'jsonschema') {

        this.file = this.$refs.file.files[0];
        this.report = null;
        this.reportJson = []
        this.reportValidStatus = null;
        this.badgeUrl = null;
        this.publication = false;
        this.publicationMessage = null;

        var reader = new FileReader();
        reader.onloadend = () => {
          this.contentFile = reader.result;

          let bod = JSON.stringify({schema: this.schema.schema_url, json: JSON.parse(this.contentFile)});

          fetch(('https://jsonschema.app.etalab.studio/validate'), {
            method: 'POST',
            body: bod,
          })
          .then((r) => r.json())
          .then((data) => {
            console.log(data);
            this.report = data;
            this.reportJson = data.errors
            if(data.errors.length > 0) {
              this.reportValidStatus = 'Malheureusement, le fichier soumis est invalide.';
              this.badgeUrl = lkInvalide;
            } else {
              this.reportValidStatus = 'Félicitations, votre fichier est conforme au schéma !';
              this.badgeUrl = lkValide;
              this.publication = true;
              this.publicationMessage = 'Publier sur datagouv';
              this.ext = "json"
            }
        

          });
        }
        reader.readAsText(this.$refs.file.files[0]);
        
      }
    },
    publicationForm() {
      this.publicationReady = true;
    },
    publishDataset() {
      // Get structured publish form content
      const publishContent = this.dataToPublish;
      // Dataset creation
      // Si resource id : on modifie resource
      // Si pas de ressource id mais dataset id, on ajoute une ressource
      // Si pas de dataset id on créé un dataset avec ou sans orga avec la ressource
      if (publishContent.existingResource !== '') {
        this.updateDatasetUpdateResource(publishContent,this.file,this.ext);
      } else if (publishContent.existingDataset !== '') {
        this.updateDatasetCreateResource(publishContent,this.file,this.ext);
      } else {
        this.createDatasetCreateResource(publishContent,this.file,this.ext);
      }
    },
  },
  mounted() {
    fetch(`https://schema.data.gouv.fr/schemas/${this.schemaName}/latest/schema.json`).then((r) => r.json()).then((data) => {
      this.schemaObject = data;
    });
  },
};
</script>

<style>
.vsa-list{
    min-height: 50px;
}
.vsa-item{
    border-bottom: 1px solid #ebebeb;
    width: 100%;
    height: 100%;
}
.vsa-item__trigger{
    width: 100%;
    height: 50px;
    border: 0px;
    text-align: left;
    background-color: white;
}
.vsa-item__content{
    margin-top: 20px;
    margin-bottom: 20px;
}
</style>
