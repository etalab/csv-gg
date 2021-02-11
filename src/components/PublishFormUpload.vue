<template>
  <div>
    <b-form>
      <p class="text-muted">
        {{ publicationIntro }}
      </p>
      <div class="radio-boxes">
        <div class="radio-box">
          <p style="line-height: 50px;">Je souhaite publier :</p>
        </div>
        <div class="radio-box" @click="radioclick('me')">
          <input type="radio" id="one" value="me" v-model="whoPicked">
          <label for="one">&nbsp;en mon nom
          &nbsp;&nbsp;&nbsp;
          <img src="../static/images/man.png" width="50" height="50"/></label>
        </div>
        <div class="radio-box" @click="radioclick('org')">
          <input type="radio" id="two" value="org" v-model="whoPicked">
          <label for="two">&nbsp;au nom de mon organisation
          &nbsp;&nbsp;&nbsp;
          <img src="../static/images/group.png" width="50" height="50"/></label>
        </div><span class="text-danger">*</span>
      </div>

      <!-- Organisation -->
      <b-form-group
        v-if="orgaShow"
        id="input-group-org"
        label-for="input-org"
        description="Choisissez l'organisation dans laquelle sera créé le jeu de données"
      >
        <template v-slot:label>
          Organisation <span class="text-danger">*</span>
        </template>
        <b-form-select
            id="input-org"
            v-model="form.org"
            :options="organizations"
            v-on:change="onChange"
            required
          ></b-form-select>
      </b-form-group>

      <div v-if="jddShow" class="radio-boxes">
        <div class="radio-box">
          <p style="line-height: 50px;">Jeu de données :</p>
        </div>
        <div class="radio-box" @click="radioclickJDD('existing')">
          <input type="radio" id="three" value="existing" v-model="typePicked">
          <label for="three">&nbsp;déjà existant
          &nbsp;&nbsp;&nbsp;
          <img src="../static/images/edit.png" width="50" height="50"/></label>
        </div>
        <div class="radio-box" @click="radioclickJDD('new')">
          <input type="radio" id="four" value="new" v-model="typePicked">
          <label for="four">&nbsp;à créer
          &nbsp;&nbsp;&nbsp;
          <img src="../static/images/new.png" width="50" height="50"/></label>
        </div><span class="text-danger">*</span>
      </div>

      <!-- existing Dataset -->
      <b-form-group
        v-if="jddShow && editJDDShow && selectMe"
        id="input-group-editjdd-me"
        label-for="input-editjdd-me"
        description="Choisissez le jeu de données dans lequel sera chargé votre fichier"
      >
        <template v-slot:label>
          Sélectionner votre jeu de données : <span class="text-danger">*</span>
        </template>
        <b-form-select
          id="input-editjdd-me"
          v-model="form.existingDataset"
          v-on:change="onChangeJDDMe"
        >
          <option v-for="ds in datasetsMe" v-bind:key="ds.id" :value="ds.id" >
            {{ ds.title }}
          </option>
        </b-form-select>
      </b-form-group>

      <!-- existing Dataset -->
      <b-form-group
        v-if="jddShow && editJDDShow && selectOrg"
        id="input-group-editjdd-org"
        label-for="input-editjdd-org"
        description="Choisissez le jeu de données dans lequel sera chargé votre fichier"
      >
        <template v-slot:label>
          Sélectionner votre jeu de données : <span class="text-danger">*</span>
        </template>
        <b-form-select
          id="input-editjdd-org"
          v-model="form.existingDataset"
          v-on:change="onChangeJDDOrg"
        >
          <option v-for="ds in datasetsOrg"  v-bind:key="ds.id" :value="ds.id">
            {{ ds.title }}
          </option>
        </b-form-select>
      </b-form-group>

      <!-- Dataset title -->
      <b-form-group
        v-if="jddShow && newJDDShow"
        id="input-group-dataset-title"
        label-for="input-dataset-title"
      >
        <template v-slot:label>
          Nom du jeu de données <span class="text-danger">*</span>
        </template>
        <b-form-input
          id="input-dataset-title"
          v-model="form.dataset.title"
          v-on:input="onChange"
          :trim="true"
        ></b-form-input>
      </b-form-group>

      <!-- Dataset description -->
      <b-form-group
        v-if="jddShow && (newJDDShow || editJDDShow)"
        id="input-group-dataset-description"
        label-for="input-dataset-description"
      >
        <template v-slot:label>
          Description du jeu de données <span class="text-danger">*</span>
        </template>
        <b-form-textarea
          id="input-dataset-description"
          v-model="form.dataset.description"
          rows="4"
          v-on:input="onChange"
          :trim="true"
        ></b-form-textarea>
      </b-form-group>

      <div v-if="jddShow && editJDDShow && this.form.existingDataset != ''" class="radio-boxes">
        <div class="radio-box">
          <p style="line-height: 50px;">Ressource :</p>
        </div>
        <div class="radio-box" @click="radioclickRes('existing')">
          <input type="radio" id="five" value="existing" v-model="typeResPicked">
          <label for="five">&nbsp;déjà existante (à écraser)
          &nbsp;&nbsp;&nbsp;
          <img src="../static/images/edit.png" width="50" height="50"/></label>
        </div>
        <div class="radio-box" @click="radioclickRes('new')">
          <input type="radio" id="six" value="new" v-model="typeResPicked">
          <label for="six">&nbsp;à créer
          &nbsp;&nbsp;&nbsp;
          <img src="../static/images/new.png" width="50" height="50"/></label>
        </div><span class="text-danger">*</span>
      </div>

      <!-- existing resource -->
      <b-form-group
        v-if="jddShow && editJDDShow && editResShow"
        id="input-group-editres"
        label-for="input-editres"
        description="Choisissez la ressource que vous souhaitez écraser"
      >
        <template v-slot:label>
          Sélectionner votre ressource : <span class="text-danger">*</span>
        </template>
        <b-form-select
          id="input-editres"
          v-model="form.existingResource"
        >
          <option v-for="res in resources"  v-bind:key="res.id" :value="res.id" >
            {{ res.title }}
          </option>
        </b-form-select>
      </b-form-group>

      <!-- Resource title -->
      <b-form-group
        v-if="jddShow && (newJDDShow || (editJDDShow && typeResPicked != ''))"
        id="input-group-resource-title"
        label-for="input-resource-title"
      >
        <template v-slot:label>
          Nom du fichier CSV <span class="text-danger">*</span>
        </template>
        <b-form-input
          id="input-resource-title"
          v-model="form.resource.title"
          v-on:input="onChange"
          :trim="true"
          placeholder="data.csv"
        ></b-form-input>
      </b-form-group>
      <p class="text-muted">
        Les champs suivis d'une astérisque (<span class="text-danger">*</span>)
        sont obligatoires
      </p>
    </b-form>
  </div>
</template>
<script>
import $api from '../services/Api';

export default {
  props: {
    schemaName: String,
    organizations: Array,
    publicationIntro: String,
    value: {
      type: undefined,
      required: true,
    },
  },
  data() {
    return {
      form: {
        org: '',
        dataset: {
          title: '',
          description: '',
        },
        resource: {
          title: '',
        },
        existingDataset: '',
        existingResource: '',
      },
      whoPicked: '',
      typePicked: '',
      typeResPicked: '',
      orgaShow: false,
      jddShow: false,
      descShow: false,
      filenameShow: false,
      newJDDShow: false,
      editJDDShow: false,
      datasetsMe: [],
      selectMe: false,
      selectOrg: false,
      datasetsOrg: [],
      resources: [],
      editResShow: false,
    };
  },
  mounted() {
    this.$emit('form-state-change', this.okState);
  },
  computed: {
    okState() {
      return (
        this.form.org !== ''
        && (this.form.dataset.title !== '' || this.form.existingDataset !== '')
        && this.form.dataset.description !== ''
        && this.form.resource.title !== ''
      );
    },
    payload() {
      return {
        organizationId: this.form.org,
        dataset: {
          title: this.form.dataset.title,
          description: this.form.dataset.description,
        },
        resource: {
          title: this.form.resource.title,
          schemaName: this.schemaName,
        },
        existingDataset: this.form.existingDataset,
        existingResource: this.form.existingResource,
      };
    },
  },
  methods: {
    onChange() {
      // eslint-disable-next-line prefer-destructuring
      const okState = this.okState;
      if (this.form.org !== '') {
        this.jddShow = true;
      }
      this.$emit('form-state-change', okState);
      if (okState) {
        this.$emit('input', this.payload);
      }
    },
    onChangeJDDMe() {
      this.datasetsMe.forEach((ds) => {
        if (ds.id === this.form.existingDataset) {
          this.form.dataset.title = ds.title;
          this.form.dataset.description = ds.description;
          this.resources = ds.resources;
          this.typeResPicked = '';
          this.form.resource.title = '';
          this.form.existingResource = '';
          this.editResShow = false;
        }
      });
    },
    onChangeJDDOrg() {
      this.datasetsOrg.forEach((ds) => {
        if (ds.id === this.form.existingDataset) {
          this.form.dataset.title = ds.title;
          this.form.dataset.description = ds.description;
          this.resources = ds.resources;
          this.typeResPicked = '';
          this.form.resource.title = '';
          this.form.existingResource = '';
          this.editResShow = false;
        }
      });
    },
    radioclick(who) {
      this.form.org = '';
      this.form.dataset.title = '';
      this.form.dataset.description = '';
      this.form.resource.title = '';
      this.form.existingDataset = '';
      this.editJDDShow = false;
      this.newJDDShow = false;
      this.typePicked = '';
      this.onChange();

      if (who === 'me') {
        this.orgaShow = false;
        this.jddShow = true;
        this.form.org = 'me';
        this.selectMe = true;
        this.selectOrg = false;
      }
      if (who === 'org') {
        this.orgaShow = true;
        this.jddShow = false;
        this.selectMe = false;
        this.selectOrg = true;
      }
    },
    radioclickJDD(type) {
      this.form.dataset.title = '';
      this.form.dataset.description = '';
      this.form.resource.title = '';
      this.form.existingDataset = '';
      this.form.resource.title = '';
      this.typeResPicked = '';
      this.form.existingResource = '';
      this.editResShow = false;
      if (type === 'existing') {
        this.newJDDShow = false;
        this.editJDDShow = true;
        if (this.orgaShow) {
          this.getMyDatasetsOrg();
        } else {
          this.getMyDatasetsMe();
        }
      } else {
        this.newJDDShow = true;
        this.editJDDShow = false;
        this.datasetsMe = [];
      }
    },
    radioclickRes(type) {
      this.form.resource.title = '';
      this.typeResPicked = '';
      this.form.existingResource = '';
      if (type === 'existing') {
        this.editResShow = true;
      } else {
        this.editResShow = false;
      }
      this.onChange();
    },
    getMyDatasetsMe() {
      $api
        .get(
          'me/datasets',
          {},
          (err) => {
            // eslint-disable-next-line no-alert
            alert(`Erreur lors de la publication du jeu de données : ${err}`);
          },
        )
        .then((response) => {
          this.datasetsMe = response.data;
        });
    },
    getMyDatasetsOrg() {
      $api
        .get(
          `organizations/${this.form.org}/datasets`,
          {},
          (err) => {
            // eslint-disable-next-line no-alert
            alert(`Erreur lors de la publication du jeu de données : ${err}`);
          },
        )
        .then((response) => {
          this.datasetsOrg = response.data.data;
        });
    },
  },
};
</script>
