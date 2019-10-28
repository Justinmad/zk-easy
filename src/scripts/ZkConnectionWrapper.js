import {parseStat} from "./Utils";

export const DefaultHost = 'localhost';
export const DefaultPort = 2181;
const Zookeeper = require('node-zookeeper-client');
const EMPTY = Buffer.alloc(0)

function formatJson(nodeData, space) {
  try {
    let parse = JSON.parse(nodeData)
    nodeData = JSON.stringify(parse, null, space)
    return nodeData;
  } catch (e) {
    return nodeData;
  }
}

function dataWrapper(data) {
  let str = formatJson(data);
  return str ? Buffer.from(str) : EMPTY
}

function dataUnwrapper(data) {
  return formatJson(data, 2);
}

export default class ZkConnectionWrapper {
  title
  view
  client
  loading = false
  connected = false
  onConnected
  onClosed
  host
  port

  constructor(c) {
    if (c.host && c.port) {
      this.host = c.host || DefaultHost
      this.port = c.port || DefaultPort
      this.title = c.title || `${this.host}:${this.port}`
      this.view = c.view || 'directory'
    } else {
      throw new Error(`Illegal Argument,host or port is null`);
    }
  }

  init() {
    this.loading = true
    return new Promise((resolve, reject) => {
      if (!this.client || !this.connected) {
        let uri = `${this.host}:${this.port}`;
        let newZk = Zookeeper.createClient(uri, {
          sessionTimeout: 60000,
          spinDelay: 1000,
          retries: 0
        })
        let timeoutId = setTimeout(() => {
          if (!this.connected) {
            this.loading = false
            reject("Connection Timeout")
          }
        }, 5000)
        newZk.once("connected", () => {
          clearTimeout(timeoutId)
          this.connected = true
          this.loading = false
          resolve()
        })
        this.client = newZk
        this.client.connect()
      } else {
        resolve()
        this.loading = false
      }
    })
  }

  close() {
    this.loading = true
    return new Promise(resolve => {
      if (this.client && this.connected) {
        this.client.once("disconnected", () => {
          this.connected = false
          this.loading = false
          resolve()
        })
        this.client.close();
      } else {
        resolve()
        this.loading = false
      }
    })
  }

  create(path, data, mode) {
    return new Promise((resolve, reject) => {
      if (this.client && this.connected) {
        this.client.create(path, dataWrapper(data), mode, (err, path) => {
          if (err) {
            reject(err)
          } else {
            resolve(path)
          }
        })
      } else {
        reject("Not connected")
      }
    })
  }

  delete(path, version, recursive) {
    return new Promise((resolve, reject) => {
      if (this.client && this.connected) {
        let cb = err => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        }
        if (recursive) {
          this.client.removeRecursive(path, -1, cb)
        } else {
          this.client.remove(path, version, cb)
        }
      } else {
        reject("Not connected")
      }
    })
  }

  setData(path, data, version) {
    return new Promise((resolve, reject) => {
      this.client.setData(path, dataWrapper(data), version,
        (error) => {
          if (error) {
            reject(error)
          } else {
            resolve()
          }
        })
    })
  }

  getData(path) {
    return new Promise((resolve, reject) => {
      this.client.getData(path, (error, nodeData, stat) => {
        if (error) {
          reject(error)
        } else {
          let data = nodeData && nodeData.toString() || ''
          if (data) {
            data = dataUnwrapper(data);
          }
          let metadata = parseStat(stat)
          resolve({
            data,
            metadata
          })
        }
      })
    })
  }

  getChildren(path) {
    return new Promise((resolve, reject) => {
      this.client.getChildren(path, (error, children) => {
        if (error) {
          reject(error)
        } else {
          resolve(children)
        }
      })
    })
  }
}
