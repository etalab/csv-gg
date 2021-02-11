<template>
<div>
    <div v-if="!publicationReady" ref="test">
      <div  class="rf-container rf-pb-1w rf-pt-2w">
          <h3>Saisir vos données via un tableur</h3>
          <br />
          <div
            style="min-height: 270px;"
            class="rf-callout rf-fi-information-line rf-callout--scheme-soft-blue-soft rf-mb-3w"
          >
            <p>{{ messageInfo }}</p>
            <p>{{ exempleInfo }}</p>
            <p v-if="warningInfo != ''" class='warningInfo'>{{ warningInfo }}</p>
            <p
              v-if="errorInfo != null & errorInfo != ''"
              class='errorInfo'
            >
              Message d'erreur : {{ errorInfo }}
            </p>
          </div>
      </div>
      <div style="padding-left: 3%; padding-right: 3%;">
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
              @maybe-add-row='maybeAddRow'
              @add-multiple-rows='addMultipleRows'
              >
              <template v-slot:header-r>
                  Nombre de lignes : {{ rows.length }}
              </template>
          </vue-editable-grid>
      </div>
      <br />
      <div  class="rf-container">
          <button
            style="margin-right: 20px"
            @click="submit()"
            type="submit"
            class="rf-btn"
          >
            Valider le fichier
          </button>
          <button
            style="margin-right: 20px"
            class="rf-btn"
            v-if="publicationButtons"
            @click="csvLinkData"
          >
            Télécharger le CSV
          </button>
          <button
            style="margin-right: 20px"
            class="rf-btn"
            v-if="publicationButtons"
            @click="showPublishForm()"
          >
            Publier sur data.gouv.fr
          </button>
      </div>
    </div>

    <div class="rf-container rf-pb-1w rf-pt-2w" v-if="publicationReady & !publicationOK">
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
            <button type="submit" class="rf-btn-light" title="Publier sur datagouv">Publier</button>
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
import Vue from 'vue';
import ClientOnly from 'vue-client-only';
import StringField from '../components/StringField.vue';
import SelectField from '../components/SelectField.vue';
import RadioField from '../components/RadioField.vue';

import { EventBus } from '../event-bus.js';
import PublishFormUpload from '../components/PublishFormUpload.vue';
import $api from '../services/Api';

import NavUser from '../components/NavUser.vue';
import VueEditableGrid from '../grid/VueEditableGrid.vue';

const VALIDATA_API_URL = process.env.VUE_APP_VALIDATA_API_URL;
const SCHEMAS_CATALOG_URL = process.env.VUE_APP_SCHEMAS_CATALOG_URL;
const DGV_BASE_URL = process.env.VUE_APP_DATAGOUV_API_URL;

export const defaultDateFormat = 'MMM dd, yyyy';
export const defaultDateTimeFormat = 'yyyy-M-dd';

/*
const numericFormatter = event => {
  if (event.reverse) {
    return event.value && +event.value.replace(' years')
  }
  return `${event.value} years`
} */

export default {
  name: 'schemaTable',
  components: {
    VueEditableGrid,
    PublishFormUpload,
    ClientOnly,
    NavUser,
  },
  data() {
    return {
      schemaName: this.$route.query.schema,
      schemas: null,
      options: [],
      selectedRow: null,
      schemaMeta: {},
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
      columnDefs: [
        {
          field: 'selectCol',
          headerName: '',
          size: '40px',
          type: 'supp',
        },
      ],
      emptyRow: {},
      emptyRowInfo: {},
      emptyRowError: {},
      emptyRowColor: {},
      rows: [],
      rowsInfo: [],
      rowsError: [],
      rowsColor: [],
      toRemove: 0,
      messageInfo: 'Veuillez sélectionner une cellule',
      exempleInfo: '',
      warningInfo: '',
      validInfo: '',
      errorInfo: '',
      publicationReady: false,
      publicationButtons: false,
      publicationOK: false,
      dataToPublish: {},
    };
  },
  watch: {
    schemaMeta() {
      this.buildForm();
    },
  },
  mounted() {
    const loader = this.$loading.show();
    fetch(`${SCHEMAS_CATALOG_URL}`).then((r) => r.json()).then((data) => {
      this.schemas = data.schemas;
      this.options = this.schemas.map((s) => ({
        value: s.name,
        text: s.title || s.name,
      }));
      this.schema = this.schemas.find((s) => s.name === this.schemaName);
      this.schemaMeta = this.schema;
    }).finally(() => {
      loader.hide();
    });

    this.buildForm();
    EventBus.$on('field-value-changed', (field, value) => {
      this.values[field] = value;
      this.computeHasValues();
    });
    this.rows.push(this.emptyRow);
    this.rowsInfo.push({ ...this.emptyRowInfo });
    this.rowsError.push({ ...this.emptyRowError });
    this.rowsColor.push({ ...this.emptyRowColor });

    if (!this.user.loggedIn) {
      this.showModal();
    }
  },
  computed: {
    filename() {
      const date = new Date();
      const name = [
        this.schemaName,
        date.toISOString(),
      ].join('_');
      return `${name}.csv`;
    },
    fields() {
      return [...this.fieldNames.map((f) => ({
        key: f,
        label: f,
      })),
      { key: 'actions', label: '' }];
    },
    csvLink() {
      const csv = this.buildFullCsvContent();
      // Forcing UTF-8 encoding. See https://stackoverflow.com/questions/17879198
      const data = new Blob([`\uFEFF${csv}`], { type: 'text/csv' });
      return window.URL.createObjectURL(data);
    },
    items() {
      return this.lines.map((line) => {
        const obj = {};
        this.fieldNames.forEach((field, idx) => {
          obj[field] = line[idx];
        });
        return obj;
      });
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
  methods: {
    maybeAddRow($event){
      console.log('test');
      console.log($event);
      console.log(this.rows)
      if ($event.rowIndex === (this.rows.length - 1)) {
        this.addEmptyRow()
      }
    },
    addMultipleRows($event) {
      console.log($event)
      for(let i = 0;i<$event.rowsToAdd;i++) {
        this.addEmptyRow()
      }
    },
    buildForm() {
      const loader = this.$loading.show();
      fetch(this.schemaMeta.schema_url).then((r) => r.json()).then((data) => {
        this.schema = data;

        this.schema.fields.forEach((field) => {
          this.fieldNames.push(field.name);
          const myobj = {};
          myobj.sortable = true;
          myobj.filter = true;
          myobj.field = field.name;
          myobj.headerName = field.name;
          myobj.editable = true;

          if (field.type === 'string') {
            this.emptyRow[field.name] = '';
            this.emptyRowInfo[field.name] = '';
            this.emptyRowError[field.name] = '';
          } else if (field.type === 'date') {
            myobj.type = 'date';
            myobj.format = defaultDateTimeFormat;
            this.emptyRow[field.name] = null;
            this.emptyRowInfo[field.name] = null;
            this.emptyRowError[field.name] = null;
          } else if (field.type === 'number') {
            myobj.type = 'numeric';
            this.emptyRow[field.name] = null;
            this.emptyRowInfo[field.name] = null;
            this.emptyRowError[field.name] = null;
          } else if (field.type === 'integer') {
            myobj.type = 'numeric';
            this.emptyRow[field.name] = null;
            this.emptyRowInfo[field.name] = null;
            this.emptyRowError[field.name] = null;
          }
          this.columnDefs.push(myobj);
        });
        const uniqueid = this.makeid(15);
        this.emptyRow.idRowVEG = uniqueid;
        this.emptyRowInfo.idRowVEG = uniqueid;
        this.emptyRowError.idRowVEG = uniqueid;
        this.emptyRowColor.idRowVEG = '#ebebeb';
      }).catch((_) => _)
        .finally(() => {
        loader.hide();
      });
    },
    // in a method because of {} binding not allowed
    computeHasValues() {
      this.hasValues = Object.keys(this.values).length > 0 && Object.values(this.values).some((v) => v !== '');
    },
    buildHeaderLine() {
      return this.fieldNames.map((v) => `"${v}"`).join(',');
    },
    getCurrentLine() {
      return this.fieldNames.map((f) => this.values[f] || '');
    },
    buildLine(line) {
      let linecsv = '';
      let cpt = 0;
      this.fieldNames.forEach((field) => {
        if (cpt === 0) {
          linecsv = `"${line[field]}"`;
          cpt = 1;
        } else {
          linecsv = `${linecsv},"${line[field]}"`;
        }
      });
      return linecsv;
    },
    buildCurrentCsvContent() {
      let finalcsv = '';
      finalcsv = this.buildHeaderLine();
      this.rows.forEach((row) => {
        finalcsv = `${finalcsv}\r\n`;
        finalcsv += this.buildLine(row);
      });
      return finalcsv;
    },
    buildFullCsvContent() {
      const lines = this.lines.map((l) => this.buildLine(l));
      return [this.buildHeaderLine(), ...lines].join('\r\n');
    },
    csvLinkData() {
      const blob = new Blob([`\uFEFF${this.buildCurrentCsvContent()}`], { type: 'text/csv' });
      const a = document.createElement('a');
      const url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = 'data.csv';
      a.click();
    },
    getCSVBlob() {
      return new Blob([`\uFEFF${this.buildCurrentCsvContent()}`], { type: 'text/csv' });
    },
    buildFormData() {
      const formData = new FormData();
      const blob = new Blob([`\uFEFF${this.buildCurrentCsvContent()}`], { type: 'text/csv' });
      formData.append('file', blob, 'data.csv');
      formData.append('schema', this.schemaMeta.schema_url);
      return formData;
    },
    addField(field) {
      const hasEnum = field.constraints && field.constraints.enum;
      const isBoolean = field.type === 'boolean';

      // eslint-disable-next-line no-shadow
      const factory = (klass, field) => {
        const className = Vue.extend(klass);
        // eslint-disable-next-line new-cap
        const instance = new className({ propsData: { field } });
        instance.$mount();
        return this.$refs.test.appendChild(instance.$el);
      };

      if (hasEnum) {
        return factory(SelectField, field);
      }
      if (isBoolean) {
        return factory(RadioField, field);
      }
      return factory(StringField, field);
    },
    dispatchError(error) {
      const index = error.fieldNumber
        ? error.fieldNumber // new validation report
        : error['column-number']; // legacy validation report
      this.faultyFields.push(this.fieldNames[index - 1]);
      EventBus.$emit('field-error', this.fieldNames[index - 1], error);
    },
    dispatchNoError() {
      this.fieldNames.forEach((field) => {
        if (this.faultyFields.indexOf(field) === -1) {
          EventBus.$emit('field-no-error', field);
        }
      });
    },
    dispatchFormValidated() {
      EventBus.$emit('form-validated');
    },
    dispatchReset() {
      EventBus.$emit('form-reset');
    },
    submit() {
      const loader = this.$loading.show();
      this.rowsError.forEach((re) => {
        // eslint-disable-next-line no-restricted-syntax
        for (var property in re) {
          if (property !== 'idRowVEG') {
            // eslint-disable-next-line no-param-reassign
            re[property] = '';
          }
        }
      });

      this.rowsColor.forEach((rc) => {
        // eslint-disable-next-line no-restricted-syntax
        for (var property in rc) {
          if (property !== 'idRowVEG') {
            // eslint-disable-next-line no-param-reassign
            rc[property] = '';
          }
        }
      });
      fetch(`${VALIDATA_API_URL}/validate`, {
        method: 'POST',
        body: this.buildFormData(),
      })
        .then((r) => r.json())
        .then((data) => {
          this.formValidated = true;
          this.faultyFields = [];
          const errors = data.report.tasks
            ? data.report.tasks[0].errors // new validation report
            : data.report.tables[0].errors; // legacy validation report
          if (errors && errors.length > 0) {
            this.validInfo = 'Il y a des erreurs TBC...';
            this.publicationReady = false;
            this.publicationButtons = false;

            errors.forEach((error) => {
              // eslint-disable-next-line no-bitwise
              if (error.code === 'type-error' | error.code === 'constraint-error') {
                this.rowsError[error.rowNumber - 1][error.fieldName] = error.name;
                this.rowsColor[error.rowNumber - 1][error.fieldName] = '#FF0000';
                this.$refs.grid.selectCell(error.rowNumber - 1, 1);
              }
            });
          } else {
            this.validInfo = 'Fichier valide et prêt pour publication';
            this.publicationReady = false;
            this.publicationButtons = true;
            this.lines.push(this.getCurrentLine());
          }
          this.dispatchNoError();
          this.dispatchFormValidated();
        }).finally(() => {
          loader.hide();
        });
    },
    addLine() {
      this.addingLine = true;
      this.formValidated = false;
      this.dispatchReset();
    },
    deleteLine(idx) {
      this.lines.splice(idx, 1);
      if (this.lines.length === 0) {
        this.addLine();
      }
    },
    formatRow(row) {
      const red = '#ffe5e5';
      const green = '#b6f7b6';
      const { happiness } = row;
      const priceRateBgColor = happiness > 0.6 ? green : red;
      // eslint-disable-next-line no-param-reassign
      row.$cellStyle = {
        happiness: priceRateBgColor && { backgroundColor: priceRateBgColor },
      };
      if (row.eyeColor === 'blue') {
        // eslint-disable-next-line no-param-reassign
        row.$rowStyle = { color: 'blue' };
      }
    },
    cellUpdated($event) {
      if ($event.column.field.toLowerCase().includes('insee')) {
        this.handleInseeInput($event);
      }
      if ($event.column.field.toLowerCase().includes('siret')) {
        this.handleSiretInput($event);
      }
      if ($event.column.field.toLowerCase().includes('siren')) {
        this.handleSirenInput($event);
      }
      // eslint-disable-next-line no-bitwise
      if ($event.column.field.toLowerCase().includes('codepostal') | $event.column.field.toLowerCase().includes('code-postal') | $event.column.field.toLowerCase().includes('code_postal')) {
        this.handlePostcodeInput($event);
      }
    },
    rowSelected($event) {
      this.selectedRow = $event.rowData;

      if (this.schema.fields) {
        this.schema.fields.forEach((field) => {
          if ($event.colData) {
            if (field.name === $event.colData.field) {
              this.messageInfo = field.description;
              this.exempleInfo = `Exemple : ${field.example}`;
            }
          }
        });
      }
      if ($event.colData) {
        this.warningInfo = this.rowsInfo[$event.rowIndex][$event.colData.field];
        this.errorInfo = this.rowsError[$event.rowIndex][$event.colData.field];
        if ($event.colData.field === 'selectCol') {
          this.removeCurrentRow();
          this.$refs.grid.selectCell(0, 1);
        }
      }
    },
    linkClicked() {
    },
    removeCurrentRow() {
      this.rows = this.rows.filter((row) => row.idRowVEG !== this.selectedRow.idRowVEG);
    },
    contextMenu() {
    },
    addEmptyRow() {
      const myobj = {};
      const myobjInfo = {};
      const myobjError = {};
      const myobjColor = {};

      this.schema.fields.forEach((field) => {
        if (field.type === 'string') {
          myobj[field.name] = '';
          myobjInfo[field.name] = '';
          myobjError[field.name] = '';
        } else if (field.type === 'date') {
          myobj.type = 'date';
          myobj.format = defaultDateTimeFormat;
          myobj[field.name] = null;
          myobjInfo.type = 'date';
          myobjInfo.format = defaultDateTimeFormat;
          myobjInfo[field.name] = null;
          myobjError.type = 'date';
          myobjError.format = defaultDateTimeFormat;
          myobjError[field.name] = null;
        } else if (field.type === 'number') {
          myobj.type = 'numeric';
          myobj[field.name] = null;
          myobjInfo.type = 'numeric';
          myobjInfo[field.name] = null;
          myobjError.type = 'numeric';
          myobjError[field.name] = null;
        } else if (field.type === 'integer') {
          myobj.type = 'numeric';
          myobj[field.name] = null;
          myobjInfo.type = 'numeric';
          myobjInfo[field.name] = null;
          myobjError.type = 'numeric';
          myobjError[field.name] = null;
        }
      });
      let uniqueid = this.makeid(15);
      myobj.idRowVEG = uniqueid;
      myobjInfo.idRowVEG = uniqueid;
      myobjError.idRowVEG = uniqueid;
      myobjColor.idRowVEG = '#ebebeb';
      this.rows.push(myobj);
      this.rowsInfo.push(myobjInfo);
      this.rowsError.push(myobjError);
      this.rowsColor.push(myobjColor);
    },
    makeid(length) {
      let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let charactersLength = characters.length;
      let result = '';
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < length; i++) {
        // eslint-disable-next-line no-const-assign
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
    },
    handleInseeInput(event) {
      fetch(`https://geo.api.gouv.fr/communes/${event.value}`).then((r) => {
        if (!r.ok) {
          this.city = null;
          throw new Error('Not 200 response');
        }
        return r.json();
      }).then((data) => {
        this.city = data.nom;
        this.rowsInfo[event.rowIndex][event.column.field] = `Info : Ce code INSEE correspond à ${data.nom}.`;
        this.$refs.grid.selectCell(event.rowIndex, event.columnIndex);
      }).catch((_) => _);
    },
    handleSiretInput(event) {
      this.siretDescription = null;
      if (event.value.length !== 14) return;

      fetch(`https://entreprise.data.gouv.fr/api/sirene/v3/etablissements/${event.value}`).then((r) => {
        if (!r.ok) {
          this.siretDescription = null;
          throw new Error('Not 200 response');
        }
        return r.json();
      }).then((data) => {
        this.siretDescription = data.etablissement.unite_legale.denomination;
        this.rowsInfo[event.rowIndex][event.column.field] = `Info : Ce SIRET correspond à ${data.etablissement.unite_legale.denomination}.`;

        this.$refs.grid.selectCell(event.rowIndex, event.columnIndex);
      }).catch((_) => _);
    },
    handleSirenInput(event) {
      this.sirenDescription = null;
      if (event.value.length !== 9) return;

      fetch(`https://entreprise.data.gouv.fr/api/sirene/v3/unites_legales/${event.value}`).then((r) => {
        if (!r.ok) {
          this.sirenDescription = null;
          throw new Error('Not 200 response');
        }
        return r.json();
      }).then((data) => {
        this.sirenDescription = data.unite_legale.denomination;
        this.rowsInfo[event.rowIndex][event.column.field] = `Info : Ce SIREN correspond à ${data.unite_legale.denomination}.`;

        this.$refs.grid.selectCell(event.rowIndex, event.columnIndex);
      }).catch((_) => _);
    },
    handlePostcodeInput(event) {
      fetch(`https://geo.api.gouv.fr/communes?codePostal=${event.value}&boost=population`).then((r) => {
        if (!r.ok) {
          this.city = null;
          throw new Error('Not 200 response');
        }
        return r.json();
      }).then((data) => {
        this.city = data.map((c) => c.nom).join(' ou ');
        this.rowsInfo[event.rowIndex][event.column.field] = `Info : Ce code postal correspond à ${data.map((c) => c.nom).join(' ou ')}.`;

        this.$refs.grid.selectCell(event.rowIndex, event.columnIndex);
      }).catch((_) => _);
    },
    fieldHasKeyword(keyword) {
      const name = this.field.name.toLowerCase();
      const description = (this.field.description || '').toLowerCase();
      return name.includes(keyword) || new RegExp(`\\b${keyword}\\b`).test(description);
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
          formData.append('file', this.getCSVBlob(), 'data.csv');
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
          formData.append('file', this.getCSVBlob(), 'data.csv');
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
          formData.append('file', this.getCSVBlob(), 'data.csv');
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
      // Si resource id : on modifie resource
      // Si pas de ressource id mais dataset id, on ajoute une ressource
      // Si pas de dataset id on créé un dataset avec ou sans orga avec la ressource
      if (publishContent.existingResource !== '') {
        // Mise à jour dataset
        // Ecrasement resource
        // Modification metadonnées
        this.updateDatasetUpdateResource(publishContent);
      } else if (publishContent.existingDataset !== '') {
        // Mise à jour dataset
        // création nouvelle ressource
        // modiciation métaonnées
        this.updateDatasetCreateResource(publishContent);
      } else {
        // Création dataset
        // création ressource
        // modification métadonnées
        this.createDatasetCreateResource(publishContent);
      }
    },
    showPublishForm() {
      this.publicationReady = true;
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
};
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
