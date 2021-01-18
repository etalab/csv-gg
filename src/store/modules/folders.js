import Api from '@/services/Api.js'

const $api = new Api()

const module = {
  namespaced: true,
  state () {
    return {
      cache: []
    }
  },
  getters: {
    cache: state => state.cache
  },
  mutations: {
    setFolders (state, data) {
      state.cache = data
    }
  },
  actions: {
    createExample () {
      const info = {
        title: 'Mes playlists',
        description: 'mes belles playlists',
        private: true,
        extras: {
          playlist: true
        }
      }

      $api.post('datasets', info)
    },
    async fetchMe ({ dispatch, commit }) {
      const folders = []

      try {
        const res = await $api.get('me/datasets')

        for (const k in res.data) {
          const dataset = res.data[k]
          if ('playlist' in dataset.extras && !dataset.deleted) {
            folders.push(dataset)
          }
        }

        if (folders.length === 0) {
          dispatch('createExample')
        }
      } catch (e) {
        // console.log(e)
      }

      commit('setFolders', folders)
    }
  }
}

export default module
