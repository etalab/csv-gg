<template>
    <div>
        <div class="rf-container rf-pb-6w rf-pt-2w">
        <br /><br/>
            <div class="boxes">
                <div class="homepage-box">
                   <br />
                   <p class="color: blue; text-align: left; border: 1px solid black;">
                       Saisissez, validez et publiez 
                       <br/>
                       vos données structurées
                    </p>
                </div>
                <div class="homepage-box">
                    <img src="../static/images/logo.png" width="450" />
                </div>
            </div>
            <br/><br />
            <p>
                Cet outil vous permet de saisir, valider et publier des données obéissant à un schéma de données sur la plateforme ouverte des données publiques françaises  <a href="http://www.data.gouv.fr/">data.gouv.fr</a>.</p>
                <p>Les schémas proposés sont référencés sur la plateforme <a href="http://schema.data.gouv.fr">schema.data.gouv.fr</a>.
            </p>
            <br />
            <vsa-list>
                <!-- Here you can use v-for to loop through items  -->
                <vsa-item>
                    <vsa-heading>
                        <p>Qu'est-ce qu'un schéma de données ?</p>
                    </vsa-heading>
                    <vsa-content>
                        <p>
                            Les schémas de données permettent de décrire la structure
                            d'un jeu de données. Ils indiquent clairement quels sont les
                            différents champs (colonnes), comment sont représentées les données, 
                            quelles sont les valeurs possibles etc.
                        </p>
                        <i>Synonymes : modèle de données, modèle logique de données, schéma.</i>
                    </vsa-content>
                </vsa-item>
                <vsa-item>
                    <vsa-heading>
                        <p>Comment réaliser son propre schéma de données ?</p>
                    </vsa-heading>
                    <vsa-content>
                        <p>
                            Un guide a été publié en 2020 pour accompagner les futurs
                            producteurs de schéma de données. N'hésitez pas à le lire et
                            nous faire part de vos retours :
                        </p>
                        <ul>
                            <li>
                                <a href="" @click="btnGuideClick()">
                                   Lire le guide
                                </a>
                            </li>
                        </ul>
                    </vsa-content>
                </vsa-item>
                <vsa-item>
                    <vsa-heading>
                        <p>Comment faire référencer son schéma de données ?</p>
                    </vsa-heading>
                    <vsa-content>
                        <p>
                            Vous envisagez de créer un schéma ou vous êtes en phase d'élaboration
                            d'un schéma et vous souhaitez recueillir des retours de la part de la
                            communauté. Vous pouvez déclarer cette initiative auprès de
                            schema.data.gouv.fr :
                        </p>
                        <ul>
                            <li>
                                <a href="https://github.com/etalab/schema.data.gouv.fr/issues/new?template=referencer-un-schema.md">
                                    En ouvrant un ticket sur GitHub ;
                                </a>
                            </li>
                            <li>
                                En envoyant un e-mail à l'adresse schema@data.gouv.fr.
                            </li>
                        </ul>
                    </vsa-content>
                </vsa-item>
            </vsa-list>

        </div>
        <div class="rf-container-fluid rf-bg--alt rf-centered rf-pb-6w rf-pt-2w">
            <div class="rf-grid-row rf-grid-row--center">
                <div class="rf-col-6"><h2>Produire des données de qualité</h2></div>
            </div>
            <div class="rf-grid-row rf-grid-row--center rf-grid-row--gutter">
                <div class="rf-col-xs-12 rf-col-md-3 rf-p-3w">
                    <div class="rf-text--lg rf-pb-2w">
                        <img src="../static/images/writing.png" width="30" height="30"/>
                        <br/>
                        Saisir
                    </div>
                    <div class="rf-text--sm">Saisir ou charger vos données structurées</div>
                </div>
                <div style="display: flex; align-items: center;">
                    <img src="../static/images/right-arrow.png" width="30" height="30"/>
                </div>
                <div class="rf-col-xs-12 rf-col-md-3 rf-p-3w">
                <div class="rf-text--lg rf-pb-2w">
                    <img src="../static/images/clipboard.png" width="30" height="30"/>
                    <br/>
                    Valider
                </div>
                <div class="rf-text--sm">Vérifier la conformité de vos données</div>
                </div>
                <div style="display: flex; align-items: center;">
                    <img src="../static/images/right-arrow.png" width="30" height="30"/>
                </div>
                <div class="rf-col-xs-12 rf-col-md-3 rf-p-3w">
                <div class="rf-text--lg rf-pb-2w">
                    <img src="../static/images/broadcast.png" width="30" height="30"/>
                    <br/>
                    Publier
                </div>
                <div class="rf-text--sm">Publier vos données sur la plateforme data.gouv.fr</div>
                </div>
            </div>
        </div>

        <div class="rf-container rf-pb-6w rf-pt-2w">
            <br />
            <h3>Sélectionner votre schéma</h3>
            <br />
            <p>
                Les schémas ci-dessous sont issues du référentiel de schéma de
                la plateforme schema.data.gouv.fr.
            </p>
            <br />
            <div class="rf-search-bar" id="header-search">
                <label class="rf-label" for="header-search-input">
                    Label de la barre de recherche
                </label>
                <input
                    v-model="searchText"
                    v-on:input="filterSchema()"
                    class="rf-input"
                    placeholder="Rechercher un schéma"
                    type="search" id="header-search-input"
                    name="header-search-input"
                >
                <button class="rf-btn" title="Rechercher un schéma">
                    <span>
                        Rechercher un schéma
                    </span>
                </button>
            </div>
        </div>
        <div style="background-color: #EFEFEF;">
            <div class="rf-container rf-pb-6w rf-pt-2w">
                <p>{{ messageSchema }}</p>
                <div class="boxes">
                    <div
                        class="box style-schema"
                        v-for="schema in schemasToShow"
                        :key="schema.name"
                        @click="goto(schema)"
                    >
                        <div style="color: black;" class="box-header">
                            {{ schema.title }}
                        </div>
                        <div class="box-logo">
                            <img src="../static/images/diagram_black.png" width="30" height="30"/>
                        </div>
                        <div style="color: black;" class="box-content">{{ truncateText(schema.description) }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style>

</style>

<script>

import {
  VsaList,
  VsaItem,
  VsaHeading,
  VsaContent,
} from 'vue-simple-accordion';

const SCHEMAS_CATALOG_URL = process.env.VUE_APP_SCHEMAS_CATALOG_URL;

export default {
  name: 'homepage',
  components: {
    VsaList,
    VsaItem,
    VsaHeading,
    VsaContent,
  },
  data() {
    return {
      schemas: null,
      schemasToShow: null,
      searchText: '',
      messageSchema: '',
    };
  },
  mounted() {
    const loader = this.$loading.show();
    fetch(`${SCHEMAS_CATALOG_URL}`).then((r) => r.json()).then((data) => {
      this.schemas = data.schemas;
      this.schemasToShow = data.schemas;
    }).finally(() => {
      loader.hide();
    });
  },
  computed: {
  },
  watch: {
  },
  methods: {
    truncateText(desc){
        if (desc.length > 200) {
            return desc.slice(0,200)+' [...]';
        } 
        return desc;
    },
    goto(schema) {
      this.$router.push(`select?schema=${schema.name}`);
    },
    filterSchema() {
      if (this.searchText !== '') {
        const obj = [];
        this.schemas.forEach((schema) => {
          if (schema.title.toLowerCase().includes(this.searchText.toLowerCase())) {
            obj.push(schema);
          }
        });
        this.schemasToShow = obj;
        if (this.schemasToShow.length === 0) {
          this.messageSchema = 'Aucun schéma trouvé';
        }
      } else {
        this.schemasToShow = this.schemas;
      }
    },
    btnGuideClick() {
      window.open('https://guides.etalab.gouv.fr/producteurs-schemas/#a-qui-s-adresse-ce-guide');
    },
  },
};
</script>
