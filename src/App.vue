<template>
  <div id="app">
      <b-container>
          <h1 class="text-center mt-2"><img src="./assets/csvgg.gif" alt="csv-gg"></h1>
          <router-view/>
          <footer class="text-center">
              <hr/>
              <p class="mb-0">
                  <strong>csv-gg</strong> est un <a href="https://github.com/etalab/csv-gg">logiciel libre</a> développé par <a href="https://etalab.gouv.fr/">Etalab</a>.
              </p>
              <p class="mt-0">
                  <span class="badge badge-pill badge-warning">Attention</span> il s'agit d'un projet expérimental. En cas de question ou de problème, vous pouvez <a href="https://github.com/etalab/csv-gg/issues/new">ouvrir un ticket ici</a>.
              </p>
          </footer>
      </b-container>
  </div>
</template>
<style>
</style>
