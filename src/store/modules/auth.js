import $api from '../../services/Api';

const module = {
  namespaced: true,
  state() {
    return {
      user: {
        loggedIn: false,
        token: '',
        data: {},
      },
    };
  },
};

const mutations = {
  setLoggedIn(state) {
    // eslint-disable-next-line no-param-reassign
    state.user.loggedIn = true;
  },
  unsetLoggedIn(state) {
    // eslint-disable-next-line no-param-reassign
    state.user.loggedIn = false;
  },
  setToken(state, token) {
    // eslint-disable-next-line no-param-reassign
    state.user.token = token;
  },
  setUserData(state, data) {
    // eslint-disable-next-line no-param-reassign
    state.user.data = data;
  },
};

const actions = {
  login({ commit }, token) {
    commit('setLoggedIn');
    commit('setToken', token);
  },
  fillUserData({ commit }, data) {
    commit('setUserData', data);
  },
  checkToken({ dispatch }) {
    $api.get('me', {}, () => {
      dispatch('logout');
    });
  },
  logout({ commit }) {
    commit('unsetLoggedIn');
    commit('setToken', '');
    commit('setUserData', {});
  },
};

export default { ...module, mutations, actions };
