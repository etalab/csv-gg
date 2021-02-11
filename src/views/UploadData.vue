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
          title="Attention, vous n'êtes pas connectés"
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
import $api from '../services/Api';

const lkInvalide = require('../static/images/badge-invalide.svg');
const lkPartiellementValide = require('../static/images/badge-partiellement-valide.svg');
const lkValide = require('../static/images/badge-valide.svg');

const SCHEMAS_CATALOG_URL = process.env.VUE_APP_SCHEMAS_CATALOG_URL;
const VALIDATA_API_URL = process.env.VUE_APP_VALIDATA_API_URL;
const DGV_BASE_URL = process.env.VUE_APP_DATAGOUV_API_URL;

export default {
  name: 'uploaddata',
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
      schemaName: this.$route.query.schema,
      schemas: null,
      schemaObject: null,
      file: '',
      report: null,
      reportValidStatus: '',
      badgeUrl: null,
      reportStructureErrors: [],
      reportContentErrors: [],
      reportRecos: [],
      reportErrorInfo: null,
      publication: false,
      publicationMessage: null,
      publicationReady: false,
      publicationIntro: 'Publiez le fichier CSV uploadé dans un nouveau jeu de données',
      publishButtonDisabled: true,
      dataToPublish: {},
      publicationOK: false,
      linkDgv: '',
    };
  },
  computed: {
    schema() {
      if (!this.schemaName) return;
      if (!this.schemas) return;
      // eslint-disable-next-line consistent-return
      return this.schemas.find((s) => s.name === this.schemaName);
    },
    user() {
      return this.$store.state.auth.user;
    },
    userLoggedIn() {
      return this.user && this.user.loggedIn;
    },
    userLoggedInWithSomeOrganizations() {
      return this.userLoggedIn && this.user.data.organizations.length > 0;
    },
    publishButtonTitle() {
      if (!this.userLoggedIn) {
        return 'Connectez-vous pour publier une ressource';
      }
      if (this.user.data.organizations.length === 0) {
        return 'Inscrivez-vous à une organisation pour publier une ressource';
      }
      return 'Publier le jeu de données';
    },
    userOrganizations() {
      return this.userLoggedIn
        ? this.user.data.organizations
          .slice(0)
          .sort((a, b) => a.name > b.name)
          .map((org) => ({
            value: org.id,
            text: org.name,
          }))
        : [];
    },
  },
  watch: {
  },
  methods: {
    handleFileUpload() {
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
            } else {
              this.reportValidStatus = 'Félicitations, votre fichier est conforme au schéma !';
              this.badgeUrl = lkValide;
              this.publication = true;
              this.publicationMessage = 'Publier sur datagouv';
            }
          }
        }).finally(() => {
          // eslint-disable-next-line no-console
          console.log('finally');
        });
    },
    publicationForm() {
      this.publicationReady = true;
    },
    togglePublishButtonState(formState) {
      this.publishButtonDisabled = !formState;
    },
    updateDatasetUpdateResource(publishContent) {
      $api
        .put(
          `datasets/${publishContent.existingDataset}`,
          {
            title: publishContent.dataset.title,
            description: publishContent.dataset.description,
          },
          (err) => {
            // eslint-disable-next-line no-alert
            alert(`Erreur lors de la publication du jeu de données : ${err}`);
          },
        )
        .then((response) => {
          // new dataset identifier
          const datasetId = response.data.id;
          // Prepare resource file to upload
          const formData = new FormData();
          formData.append('file', this.file, 'data.csv');
          // Resource upload
          $api
            .post(
              `datasets/${datasetId}/resources/${publishContent.existingResource}/upload`,
              formData,
              (err) => {
                // eslint-disable-next-line
                console.log(
                  `Erreur lors du téléversement de la ressource : ${err}`,
                );
              },
              { 'Content-Type': 'multipart/form-data' },
            )
            // eslint-disable-next-line no-shadow
            .then((response) => {
              // New resource identifier
              const resourceId = response.data.id;
              const payload = {
                title: publishContent.resource.title,
                schema: this.schemaName,
              };
              $api
                .put(
                  `datasets/${datasetId}/resources/${resourceId}/`,
                  payload,
                  (err) => {
                    // eslint-disable-next-line no-alert
                    alert(
                      `Erreur lors de la mise à jour de la ressource : ${err}`,
                    );
                  },
                )
                .then(() => {
                  this.publicationOK = true;
                  this.linkDgv = `${DGV_BASE_URL}/datasets/${publishContent.existingDataset}`;
                });
            });
        });
    },
    updateDatasetCreateResource(publishContent) {
      $api
        .put(
          `datasets/${publishContent.existingDataset}`,
          {
            title: publishContent.dataset.title,
            description: publishContent.dataset.description,
          },
          (err) => {
            // eslint-disable-next-line no-alert
            alert(`Erreur lors de la publication du jeu de données : ${err}`);
          },
        )
        .then((response) => {
          // new dataset identifier
          const datasetId = response.data.id;
          // Prepare resource file to upload
          const formData = new FormData();
          formData.append('file', this.file, 'data.csv');
          // Resource upload
          $api
            .post(
              `datasets/${datasetId}/upload`,
              formData,
              (err) => {
                // eslint-disable-next-line
                console.log(
                  `Erreur lors du téléversement de la ressource : ${err}`,
                );
              },
              { 'Content-Type': 'multipart/form-data' },
            )
            // eslint-disable-next-line no-shadow
            .then((response) => {
              // New resource identifier
              const resourceId = response.data.id;
              const payload = {
                title: publishContent.resource.title,
                schema: this.schemaName,
              };
              $api
                .put(
                  `datasets/${datasetId}/resources/${resourceId}/`,
                  payload,
                  (err) => {
                    // eslint-disable-next-line no-alert
                    alert(
                      `Erreur lors de la mise à jour de la ressource : ${err}`,
                    );
                  },
                )
                .then(() => {
                  this.publicationOK = true;
                  this.linkDgv = `${DGV_BASE_URL}/datasets/${publishContent.existingDataset}`;
                });
            });
        });
    },
    createDatasetCreateResource(publishContent) {
      let body = {};
      if (publishContent.organizationId === 'me') {
        body = {
          title: publishContent.dataset.title,
          description: publishContent.dataset.description,
        };
      } else {
        body = {
          title: publishContent.dataset.title,
          description: publishContent.dataset.description,
          organization: publishContent.organizationId,
        };
      }
      $api
        .post(
          'datasets',
          body,
          (err) => {
            // eslint-disable-next-line no-alert
            alert(`Erreur lors de la publication du jeu de données : ${err}`);
          },
        )
        .then((response) => {
          // new dataset identifier
          const datasetId = response.data.id;
          // Prepare resource file to upload
          const formData = new FormData();
          formData.append('file', this.file, 'data.csv');
          // Resource upload
          $api
            .post(
              `datasets/${datasetId}/upload`,
              formData,
              (err) => {
                // eslint-disable-next-line
                console.log(
                  `Erreur lors du téléversement de la ressource : ${err}`,
                );
              },
              { 'Content-Type': 'multipart/form-data' },
            )
            // eslint-disable-next-line no-shadow
            .then((response) => {
              // New resource identifier
              const resourceId = response.data.id;
              const payload = {
                title: publishContent.resource.title,
                schema: this.schemaName,
              };
              $api
                .put(
                  `datasets/${datasetId}/resources/${resourceId}/`,
                  payload,
                  (err) => {
                    // eslint-disable-next-line no-alert
                    alert(
                      `Erreur lors de la mise à jour de la ressource : ${err}`,
                    );
                  },
                )
                .then(() => {
                  this.publicationOK = true;
                  this.linkDgv = `${DGV_BASE_URL}/datasets/${datasetId}`;
                });
            });
        });
    },
    publishDataset() {
      // Get structured publish form content
      const publishContent = this.dataToPublish;
      // Dataset creation
      // Si resource id : on modifie resource
      // Si pas de ressource id mais dataset id, on ajoute une ressource
      // Si pas de dataset id on créé un dataset avec ou sans orga avec la ressource
      if (publishContent.existingResource !== '') {
        this.updateDatasetUpdateResource(publishContent);
      } else if (publishContent.existingDataset !== '') {
        this.updateDatasetCreateResource(publishContent);
      } else {
        this.createDatasetCreateResource(publishContent);
      }
    },
    btnClick() {
      window.open(this.linkDgv);
    },
    showModal() {
      this.$refs.modal1.show();
    },
    hideModal() {
      this.$refs.modal1.hide();
    },
  },
  mounted() {
    const loader = this.$loading.show();
    fetch(`${SCHEMAS_CATALOG_URL}`).then((r) => r.json()).then((data) => {
      this.schemas = data.schemas;
    }).finally(() => {
      loader.hide();
    });

    fetch(`https://schema.data.gouv.fr/schemas/${this.schemaName}/latest/schema.json`).then((r) => r.json()).then((data) => {
      this.schemaObject = data;
    });
    if (!this.user.loggedIn) {
      this.showModal();
    }
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
