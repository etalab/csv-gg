import axios from 'axios'
import store from '../store'

const instance = axios.create()

instance.interceptors.request.use(config => {
  const token = store.state.auth.user.token
  if (token) {
    const headers = {
      Authorization: `Bearer ${token}`
    }

    config.headers = headers

    return config
  } else {
    return config
  }
}, error => {
  return Promise.reject(error)
})

instance.interceptors.response.use(response => {
  return response
})

function defaultErrorCallback (res) {
  console.error('API error', res)
}

export default class Api {
  constructor () {
    this.API_BASE_URL = process.env.GRIDSOME_BASE_URL
    this.UPLOADER_BASE_URL = 'http://localhost:3000/api'
  }

  get (path, params, errorCallback) {
    params = params || {}
    errorCallback = errorCallback || defaultErrorCallback

    return instance.get(`${this.API_BASE_URL}/api/1/${path}/`, { params }).catch(errorCallback)
  }

  post (path, data, errorCallback) {
    errorCallback = errorCallback || defaultErrorCallback
    return instance.post(`${this.API_BASE_URL}/api/1/${path}/`, data).catch(errorCallback)
  }

  put (path, data, errorCallback) {
    errorCallback = errorCallback || defaultErrorCallback
    return instance.put(`${this.API_BASE_URL}/api/1/${path}/`, data).catch(errorCallback)
  }

  delete (path, data, errorCallback) {
    errorCallback = errorCallback || defaultErrorCallback
    return instance.delete(`${this.API_BASE_URL}/api/1/${path}/`, data).catch(errorCallback)
  }
}
