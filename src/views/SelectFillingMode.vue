<template>
    <div>
        <div v-if="schema"  class="rf-container rf-pb-6w rf-pt-2w">
            <h3>{{ schema.title }}</h3>
            <br/>
            {{ schema.description }}
            <br />
            <br />
            <div>   
                <ul>
                    <li>
                        <a href="" @click="btnDocClick()">
                            Voir la documentation du schéma
                        </a>
                    </li>
                    <li>
                        <a href="" @click="btnFilesClick()">
                            Voir les ressources déjà publiées
                        </a>
                    </li>
                    <li>
                        <a href="" @click="btnConsolidationClick()">
                            Voir la base de consolidation
                        </a>
                    </li>
                </ul>
            </div>
            <br />
            <br />
            <h3 v-if="schema && (schema.schema_type == 'tableschema' || schema.schema_type == 'jsonschema')">Comment souhaitez-vous saisir vos données ?</h3>
            <br />
            <div class="boxes">
                <div v-if="schema && (schema.schema_type == 'tableschema' || schema.schema_type == 'jsonschema')" class="box style-saisie" @click="goto('upload')">
                    <div class="box-header">
                        Mes données sont déjà structurées
                    </div>
                    <div class="box-logo">
                        <img src="../static/images/biceps.png" width="30" height="30"/>
                    </div>
                    <br/>
                    <div class="box-content">
                        Je souhaite m'assurer de la validité des données et/ou
                        les publier sur la plateforme data.gouv.fr
                    </div>
                </div>
                <div v-if="schema && schema.schema_type == 'tableschema'" class="box style-saisie" @click="goto('form')">
                    <div class="box-header">
                        Je souhaite saisir mes données dans un formulaire
                    </div>
                    <div class="box-logo">
                        <img src="../static/images/bullet-form.png" width="30" height="30"/>
                    </div>
                    <div class="box-content">
                        Générez-moi un formulaire adapté au schéma de données pour
                        que je puisse saisir mes données.
                    </div>
                </div>
                <div v-if="schema && schema.schema_type == 'tableschema'" class="box style-saisie" @click="goto('table')">
                    <div class="box-header">
                        Je souhaite saisir mes données sur un tableur
                    </div>
                    <div class="box-logo">
                        <img src="../static/images/table.png" width="30" height="30"/>
                    </div>
                    <div class="box-content">
                        Générez-moi un tableur adapté au schéma de données pour
                        que je puisse saisir mes données.
                    </div>
                </div>
            </div>
            <p  v-if="schema && schema.schema_type == 'other'">Ce schéma obéit à un standard indépendant, notre outil ne propose pas la saisie de ces données</p>
        </div>
    </div>
</template>

<script>

const SCHEMAS_CATALOG_URL = process.env.VUE_APP_SCHEMAS_CATALOG_URL;
const DGV_BASE_URL = process.env.VUE_APP_DATAGOUV_API_URL;

export default {
  name: 'selectfillingmode',
  components: {},
  data() {
    return {
      schemaName: this.$route.query.schema,
      schemas: null,
    };
  },
  mounted() {
    const loader = this.$loading.show();
    fetch(`${SCHEMAS_CATALOG_URL}`).then((r) => r.json()).then((data) => {
      this.schemas = data.schemas;
    }).finally(() => {
      loader.hide();
    });
  },
  computed: {
    schema() {
      if (!this.schemaName) return;
      if (!this.schemas) return;
      // eslint-disable-next-line consistent-return
      return this.schemas.find((s) => s.name === this.schemaName);
    },
  },
  watch: {
  },
  methods: {
    goto(type) {
      this.$router.push(`${type}?schema=${this.$route.query.schema}`);
    },
    btnDocClick() {
      window.open(`https://schema.data.gouv.fr/${this.schemaName}/latest.html`);
    },
    btnFilesClick() {
      window.open(`${DGV_BASE_URL}/datasets/?schema=${this.schemaName}`);
    },
    btnConsolidationClick() {
      window.open(`${DGV_BASE_URL}/search/?tag=${this.schemaName.replace('/', '-')}-consolidation`);
    },
  },
};
</script>
