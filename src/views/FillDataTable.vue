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
import Vue from 'vue';
import ClientOnly from 'vue-client-only';
import StringField from '../components/StringField.vue';
import SelectField from '../components/SelectField.vue';
import RadioField from '../components/RadioField.vue';

import PublishFormUpload from '../components/PublishFormUpload.vue';

import NavUser from '../components/NavUser.vue';
import VueEditableGrid from '../grid/VueEditableGrid.vue';

import PublishRessources from '../mixins/PublishResources.vue';

const VALIDATA_API_URL = process.env.VUE_APP_VALIDATA_API_URL;

export const defaultDateFormat = 'MMM dd, yyyy';
export const defaultDateTimeFormat = 'YYYY-mm-dd';

export default {
  name: 'fillDataTable',
  mixins: [PublishRessources],
  components: {
    VueEditableGrid,
    PublishFormUpload,
    ClientOnly,
    NavUser,
  },
  data() {
    return {
      selectedRow: null,
      errors: {},
      faultyFields: [],
      lines: [],
      formValidated: false,
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
    this.buildForm();
    this.rows.push(this.emptyRow);
    this.rowsInfo.push({ ...this.emptyRowInfo });
    this.rowsError.push({ ...this.emptyRowError });
    this.rowsColor.push({ ...this.emptyRowColor });
  },
  computed: {
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
    csvLinkData() {
      const blob = new Blob([`\uFEFF${this.buildCurrentCsvContent()}`], { type: 'text/csv' });
      const a = document.createElement('a');
      const url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = this.filename;
      a.click();
    },
    getCSVBlob() {
      return new Blob([`\uFEFF${this.buildCurrentCsvContent()}`], { type: 'text/csv' });
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
        }).finally(() => {
          loader.hide();
        });
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
        this.updateDatasetUpdateResource(publishContent, this.getCSVBlob());
      } else if (publishContent.existingDataset !== '') {
        // Mise à jour dataset
        // création nouvelle ressource
        // modiciation métaonnées
        this.updateDatasetCreateResource(publishContent, this.getCSVBlob());
      } else {
        // Création dataset
        // création ressource
        // modification métadonnées
        this.createDatasetCreateResource(publishContent, this.getCSVBlob());
      }
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
