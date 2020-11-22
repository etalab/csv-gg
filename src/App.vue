<template>
  <div id="app">
    <router-view/>
    <footer class="text-center">
        <hr/>
        <p class="mb-0">
            <strong>csv-gg</strong> est un <a title="dépôt github" href="https://github.com/etalab/csv-gg">logiciel libre</a> développé par <a title="site d'Etalab" href="https://www.etalab.gouv.fr/">Etalab</a>.
        </p>
        <p class="mt-0">
            <span class="badge badge-pill badge-warning">Attention</span> il s'agit d'un projet expérimental. En cas de question ou de problème, vous pouvez <a title="ouvrir un ticket" href="https://github.com/etalab/csv-gg/issues/new">ouvrir un ticket ici</a> ou nous <a title="contact mail" href="mailto:validation@data.gouv.fr?subject=A%20propos%20de%20csv-gg">envoyer un email</a>.
        </p>
    </footer>
  </div>
</template>
<style>
#app {
    margin: 30px;
}
</style>
