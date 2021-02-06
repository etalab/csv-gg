<template>
    <div>
        <div v-if="schema"  class="rf-container rf-pb-6w rf-pt-2w">
            <h3>{{ schema.title }}</h3>
            <br/>
            {{ schema.description }}
            <br />
            <br />
            <div class="button-boxes">
                <div style="padding-right: 30px; text-align: center;">
                    <button @click="btnDocClick()" class="rf-btn" title="Documentation schéma">Voir la documentation du schéma</button>
                </div>
                <div style="padding-right: 30px; text-align: center;">
                    <button @click="btnFilesClick()" class="rf-btn" title="Documentation schéma">Voir les ressources déjà publiées</button>
                </div>
                <div style="padding-right: 30px; text-align: center;">
                    <button @click="btnConsolidationClick()" class="rf-btn" title="Documentation schéma">Voir la base de consolidation</button>
                </div>
            </div>
            <br />
            <br />
            <h3>Comment souhaitez-vous saisir vos données ?</h3>
            <br />
            <div class="boxes">
                <div class="box style-saisie" @click="goto('upload')">
                    <div class="box-header">
                        Mes données sont déjà structurées
                    </div>
                    <div class="box-logo">
                        <img src="../static/images/biceps.png" width="30" height="30"/>
                    </div>
                    <br/>
                    <div class="box-content">
                        Je souhaite m'assurer de la validité des données et/ou les publier sur la plateforme datagouv
                    </div>
                </div>  
                <div class="box style-saisie" @click="goto('form')">
                    <div class="box-header">
                        Je souhaite saisir mes données dans un formulaire
                    </div>
                    <div class="box-logo">
                        <img src="../static/images/bullet-form.png" width="30" height="30"/>
                    </div>
                    <div class="box-content">
                        Générez-moi un formulaire adapté au schéma de données pour que je puisse saisir mes données.
                    </div>
                </div>  
                <div class="box style-saisie" @click="goto('table')">
                    <div class="box-header">
                        Je souhaite saisir mes données sur un tableur
                    </div>
                    <div class="box-logo">
                        <img src="../static/images/table.png" width="30" height="30"/>
                    </div>
                    <div class="box-content">
                        Générez-moi un tableur adapté au schéma de données pour que je puisse saisir mes données.
                    </div>
                </div>  
            </div>   
        </div>
    </div>
</template>


<script>

const SCHEMAS_CATALOG_URL = process.env.VUE_APP_SCHEMAS_CATALOG_URL

const DGV_BASE_URL = process.env.VUE_APP_DATAGOUV_API_URL

export default {
  name: 'selectfillingmode',
  components: {},
  data() {
      return {
          schemaName: this.$route.query.schema,
          schemas: null
      }
  },
  mounted() {
      let loader = this.$loading.show()
      fetch(`${SCHEMAS_CATALOG_URL}`).then(r => {
          return r.json()
      }).then(data => {
          this.schemas = data.schemas
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
  },
  methods: {
      goto(type) {
        this.$router.push(type+'?schema='+this.$route.query.schema);
      },
        btnDocClick(){
            window.open("https://schema.data.gouv.fr/"+this.schemaName+"/latest.html");
        },
        btnFilesClick(){
            window.open(DGV_BASE_URL+"/datasets/?schema="+this.schemaName);
        },
        btnConsolidationClick(){
            window.open(DGV_BASE_URL+"/search/?tag="+this.schemaName.replace("/","-")+"-consolidation");
        }
  }
}
</script>