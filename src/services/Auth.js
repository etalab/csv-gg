import { create } from 'pkce';
import axios from 'axios';

export default class Auth {
  constructor() {
    this.BASE_URL = process.env.VUE_APP_DATAGOUV_API_URL;
    this.redirectURI = process.env.VUE_APP_OAUTH_CALLBACK;
    this.clientId = process.env.VUE_APP_OAUTH_CLIENT_ID;
    this.clientSecret = process.env.VUE_APP_OAUTH_CLIENT_SECRET;
  }

  // eslint-disable-next-line class-methods-use-this
  generateRandomString() {
    const array = new Uint32Array(28);
    window.crypto.getRandomValues(array);
    return Array.from(array, (dec) => (`0${dec.toString(16)}`).substr(-2)).join('');
  }

  createBasicAuthHeader() {
    const headerStr = btoa(`${this.clientId}:${this.clientSecret}`);
    return { Authorization: `Basic ${headerStr}` };
  }

  authUrl() {
    const pkcePair = create();
    // eslint-disable-next-line prefer-destructuring
    const codeVerifier = pkcePair.codeVerifier;
    // eslint-disable-next-line prefer-destructuring
    const codeChallenge = pkcePair.codeChallenge;
    localStorage.setItem('pkceCodeVerifier', codeVerifier);

    const state = this.generateRandomString();
    localStorage.setItem('pkceState', state);

    const redirectURI = encodeURIComponent(this.redirectURI);
    const encodedState = encodeURIComponent(state);
    const encodedCC = encodeURIComponent(codeChallenge);

    return `${this.BASE_URL}/oauth/authorize?redirect_uri=${redirectURI}&response_type=code&state=${encodedState}&client_id=${this.clientId}&scope=default&code_challenge=${encodedCC}&code_challenge_method=S256`;
  }

  async retrieveToken(queryObject) {
    if (localStorage.getItem('pkceState') !== queryObject.state) {
      // eslint-disable-next-line no-throw-literal
      throw 'States are not matching';
    }
    const bodyFormData = new FormData();
    bodyFormData.append('grant_type', 'authorization_code');
    bodyFormData.append('code', queryObject.code);
    bodyFormData.append('redirect_uri', this.redirectURI);
    bodyFormData.append('client_id', this.clientId);
    bodyFormData.append('client_secret', this.clientSecret);
    bodyFormData.append('code_verifier', localStorage.getItem('pkceCodeVerifier'));
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await axios({
        method: 'post',
        url: `${this.BASE_URL}/oauth/token`,
        data: bodyFormData,
      });
      return response.data.access_token;
    } catch (e) {
      throw e;
    }
  }

  // eslint-disable-next-line consistent-return
  async proceedLogout(token) {
    const bodyFormData = new FormData();
    bodyFormData.append('token', token);
    try {
      const response = await axios({
        method: 'post',
        url: `${this.BASE_URL}/oauth/revoke`,
        data: bodyFormData,
        headers: this.createBasicAuthHeader(),
      });
      return response;
    } catch (e) {
      // eslint-disable-next-line
      console.log(e)
    } finally {
      localStorage.removeItem('pkceState');
      localStorage.removeItem('pkceCodeVerifier');
    }
  }
}
