// src/services/enterpriseModel.js
import axios from 'axios';
import https from 'https';
import config from '../config.js';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
})

export class EnterpriseModel {
  constructor() {
    this._version = null;
    this._build = null;
    this._portal = {
      baseUrl: config.PORTAL_BASE_URL,
      url: '',
      version: null,
      build: null,
    };
    this._server = {
      baseUrl: config.SERVER_BASE_URL,
      url: '',
      version: null,
      build: null,
    };
    this._initUrls();
    this._dataStores = [];
  }
  async _initUrls() {
    try {
      const resp = await axios.get(`${this._portal.baseUrl}/sharing/rest/info/portal`, {
        params: {
          f: 'json',
        },
        httpsAgent,
      });
      if (!resp.data) {
        throw new Error('Failed to fetch portal info');
      }
      this._portal.url = resp.data.owningSystemUrl;
    }
    catch (err) {
      console.error('Failed to fetch portal info');
      throw err;
    }
    try {
      // guess the server url from the server base url
      // e.g. serverBaseUrl = https://echo.esri.com:6443/arcgis/
      // then serverUrl = https://echo.esri.com/server
      const serverUrl = this._server.baseUrl.replace(
        // eslint-disable-next-line no-useless-escape
        /^https?:\/\/([^\/:]+)(?::\d+)?\/arcgis\/?$/i,
        'https://$1/server'
      );
      this._server.url = serverUrl;
      // try to access the server url
      const resp = await axios.get(`${this._server.url}/rest/info/healthCheck`, {
        params: {
          f: 'json',
        },
        httpsAgent,
      });
      if (!resp.data) {
        throw new Error('Failed to fetch server info');
      }
    }
    catch (err) {
      console.error('Failed to guess server url');
      throw err;
    }
  }
  async _fetchAndSetPortalMetaInfo(token) {
    try{
      const resp = await axios.get(`${this._portal.url}/portaladmin/info`, {
        params: {
          f: 'json',
          token: token,
        },
        httpsAgent,
      })
      if (!resp.data) {
        throw new Error('Failed to fetch portal meta info');
      }
      this._portal.version = resp.data.currentversion;
      this._portal.build = resp.data.currentbuild;
    }
    catch (err) {
      console.error('Failed to fetch portal meta info');
      throw err;
    }
    return {
      url: this._portal.url,
      version: this._portal.version,
      build: this._portal.build,
    }
  }
  async _fetchAndSetServerMetaInfo(token) {
    try {
      const resp = await axios.get(`${this._server.url}/admin/info`, {
        params: {
          f: 'json',
          token: token,
        },
        httpsAgent,
      })
      if (!resp.data) {
        throw new Error('Failed to fetch server meta info');
      }
      this._server.version = resp.data.currentversion;
      this._server.build = resp.data.currentbuild;
    }
    catch (err) {
      console.error('Failed to fetch server meta info');
      throw err;
    }
    return {
      url: this._server.url,
      version: this._server.version,
      build: this._server.build,
    }
  }
  async _fetchAndSetPortalWAMetaInfo(token) {
    try {
      const resp = await axios.get(`${this._portal.url}/portaladmin/system/webadaptors`, {
        params: {
          f: 'json',
          token: token,
        },
        httpsAgent,
      })
      if (!resp.data) {
        throw new Error('Failed to fetch portal web adaptor meta info');
      }
      const data = resp.data.webAdaptors[0];
      this._portal.machineName = data.machineName;
      this._portal.machineIp = data.machineIP;
      this._portal.url = data.webAdaptorURL;
      this._portal.id = data.id;
      this._portal.httpPort = data.httpPort;
      this._portal.httpsPort = data.httpsPort;

    }
    catch (err) {
      console.error('Failed to fetch portal web adaptor meta info');
      throw err;
    }
    return {
      name: this._portal.machineName,
      ip: this._portal.machineIp,
      url: this._portal.url,
      id: this._portal.id,
      httpPort: this._portal.httpPort,
      httpsPort: this._portal.httpsPort,
    }
  }
  async _fetchAndSetServerWAMetaInfo(token) {
    try {
      const resp = await axios.get(`${this._server.url}/admin/system/webadaptors`, {
        params: {
          f: 'json',
          token: token,
        },
        httpsAgent,
      })
      if (!resp.data) {
        throw new Error('Failed to fetch server web adaptor meta info');
      }
      const data = resp.data.webAdaptors[0];
      this._server.machineName = data.machineName;
      this._server.machineIp = data.machineIP;
      this._server.url = data.webAdaptorURL;
      this._server.id = data.id;
      this._server.httpPort = data.httpPort;
      this._server.httpsPort = data.httpsPort;
      
    }
    catch (err) {
      console.error('Failed to fetch server web adaptor meta info');
      throw err;
    }
    return {
      name: this._server.machineName,
      ip: this._server.machineIp,
      url: this._server.url,
      id: this._server.id,
      httpPort: this._server.httpPort,
      httpsPort: this._server.httpsPort,
    }
  }
  async _fetchFileShareDataStores(token) {
    try {
      const resp = await axios.post(
        `${this._server.url}/admin/data/findItems`,
        {}, // 如果API需要body就写body内容，否则传空对象
        {
          params: {
            f: 'json',
            token: token,
            ancestorPath: '/fileShares',
            types: 'folder',
            decrypt: true,
          },
          httpsAgent,
        }
      );
      if (!resp.data) {
        throw new Error('Failed to fetch file share data stores');
      }
      const data = resp.data.items;
      return data;
    }
    catch (err) {
      console.error('Failed to fetch file share data stores');
      throw err;
    }
  }
  async _fetchBigDataFileShareDataStores(token) {
    try {
      const resp = await axios.post(
        `${this._server.url}/admin/data/findItems`,
        {}, // 如果API需要body就写body内容，否则传空对象
        {
          params: {
            f: 'json',
            token: token,
            ancestorPath: '/bigDataFileShares',
            types: 'bigDataFileShare',
            decrypt: true,
          },
          httpsAgent,
        }
      );
      if (!resp.data) {
        throw new Error('Failed to fetch big data file share data stores');
      }
      const data = resp.data.items;
      return data;
    }
    catch (err) {
      console.error('Failed to fetch big data file share data stores');
      throw err;
    }
  }

  async _fetchCloudStoreDataStores(token) {
    try {
      const resp = await axios.post(
        `${this._server.url}/admin/data/findItems`,
        {}, // 如果API需要body就写body内容，否则传空对象
        {
          params: {
            f: 'json',
            token: token,
            ancestorPath: '/cloudStores',
            types: 'cloudStore',
            decrypt: true,
          },
          httpsAgent,
        }
      );
      if (!resp.data) {
        throw new Error('Failed to fetch cloud store data stores');
      }
      const data = resp.data.items;
      return data;
    } catch (err) {
      console.error('Failed to fetch cloud store data stores');
      throw err;
    }
  }

  async _fetchNoSQLDataBaseDataStores(token) {
    try {
      const resp = await axios.post(
        `${this._server.url}/admin/data/findItems`,
        {}, // 如果API需要body就写body内容，否则传空对象
        {
          params: {
            f: 'json',
            token: token,
            ancestorPath: '/nosqlDatabases',
            decrypt: true,
          },
          httpsAgent,
        }
      );
      if (!resp.data) {
        throw new Error('Failed to fetch noSQL database data stores');
      }
      const data = resp.data.items;
      return data;
    }
    catch (err) {
      console.error('Failed to fetch noSQL database data stores');
      throw err;
    }
  }

  async _fetchRasterStoreDataStores(token) {
    try {
      const resp = await axios.post(
        `${this._server.url}/admin/data/findItems`,
        {}, // 如果API需要body就写body内容，否则传空对象
        {
          params: {
            f: 'json',
            token: token,
            ancestorPath: '/rasterStores',
            types: 'rasterStore',
            decrypt: true,
          },
          httpsAgent,
        }
      );
      if (!resp.data) {
        throw new Error('Failed to fetch raster store data stores');
      }
      const data = resp.data.items;
      return data;
    }
    catch (err) {
      console.error('Failed to fetch raster store data stores');
      throw err;
    }
  }

  async _fetchObjectStoreDataStores(token) {
    try {
      const resp = await axios.post(
        `${this._server.url}/admin/data/findItems`,
        {}, // 如果API需要body就写body内容，否则传空对象
        {
          params: {
            f: 'json',
            token: token,
            ancestorPath: '/objectStores',
            types: 'objectStore',
            decrypt: true,
          },
          httpsAgent,
        }
      );
      if (!resp.data) {
        throw new Error('Failed to fetch object store data stores');
      }
      const data = resp.data.items;
      return data;
    }
    catch (err) {
      console.error('Failed to fetch object store data stores');
      throw err;
    }
  }

  async _fetchAndSetDataStores(token) {
    try {
      const fileShareDataStores = await this._fetchFileShareDataStores(token);
      const bigDataFileShareDataStores = await this._fetchBigDataFileShareDataStores(token);
      const cloudStoreDataStores = await this._fetchCloudStoreDataStores(token);
      const noSQLDataBaseDataStores = await this._fetchNoSQLDataBaseDataStores(token);
      const rasterStoreDataStores = await this._fetchRasterStoreDataStores(token);
      const objectStoreDataStores = await this._fetchObjectStoreDataStores(token);

      const dataStores = [
        ...fileShareDataStores,
        ...bigDataFileShareDataStores,
        ...cloudStoreDataStores,
        ...noSQLDataBaseDataStores,
        ...rasterStoreDataStores,
        ...objectStoreDataStores,
      ]
      this._dataStores = dataStores;
      return dataStores;
    }
    catch (err) {
      console.error('Failed to fetch data stores');
      throw err;
    }
  }

  async _setAll(token){
    await this._fetchAndSetPortalMetaInfo(token);
    await this._fetchAndSetServerMetaInfo(token);
    await this._fetchAndSetPortalWAMetaInfo(token);
    await this._fetchAndSetServerWAMetaInfo(token);
    await this._fetchAndSetDataStores(token);
  }
}


const enterprise = new EnterpriseModel();
export default enterprise;