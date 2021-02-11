import axios from 'axios';
import store from '../store';

const instance = axios.create();

instance.interceptors.request.use((config) => {
  // eslint-disable-next-line prefer-destructuring
  const token = store.state.auth.user.token;
  if (token) {
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    // eslint-disable-next-line no-param-reassign
    config.headers = headers;

    return config;
  }
  return config;
// eslint-disable-next-line arrow-body-style
}, (error) => { return Promise.reject(error); });

// eslint-disable-next-line arrow-body-style
instance.interceptors.response.use((response) => { return response; });

// function defaultErrorCallback (res) {
// console.error('API error', res)
function defaultErrorCallback() {
}

export default new class {
  constructor() {
    this.API_BASE_URL = process.env.VUE_APP_DATAGOUV_API_URL;
  }

  get(path, params, errorCallback) {
    // eslint-disable-next-line no-param-reassign
    params = params || {};
    // eslint-disable-next-line no-param-reassign
    errorCallback = errorCallback || defaultErrorCallback;

    return instance.get(`${this.API_BASE_URL}/api/1/${path}/`, { params }).catch(errorCallback);
  }

  post(path, data, errorCallback, headers) {
    // eslint-disable-next-line no-param-reassign
    errorCallback = errorCallback || defaultErrorCallback;
    // eslint-disable-next-line no-param-reassign
    headers = headers || {};
    return instance.post(`${this.API_BASE_URL}/api/1/${path}/`, data, headers).catch(errorCallback);
  }

  put(path, data, errorCallback) {
    // eslint-disable-next-line no-param-reassign
    errorCallback = errorCallback || defaultErrorCallback;
    return instance.put(`${this.API_BASE_URL}/api/1/${path}/`, data).catch(errorCallback);
  }

  delete(path, data, errorCallback) {
    // eslint-disable-next-line no-param-reassign
    errorCallback = errorCallback || defaultErrorCallback;
    return instance.delete(`${this.API_BASE_URL}/api/1/${path}/`, data).catch(errorCallback);
  }
}();
