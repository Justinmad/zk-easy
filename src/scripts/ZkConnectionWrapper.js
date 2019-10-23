export const DefaultHost = 'localhost';
export const DefaultPort = 2181;
const Zookeeper = require('node-zookeeper-client');

export default class ZkConnectionWrapper {
  title
  menu
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
    } else {
      throw new Error(`Illegal Argument,host or port is null`);
    }
  }

  init() {
    if (!this.client || !this.connected) {
      let uri = `${this.host}:${this.port}`;
      let newZk = Zookeeper.createClient(uri, {
        sessionTimeout: 60000,
        spinDelay: 1000,
        retries: 0
      })
      newZk.once("connected", () => {
        this.connected = true
        this.loading = false
        this.onConnected()
      })
      newZk.once("disconnected", () => {
        this.connected = false
        this.loading = false
        this.onClosed()
      })
      this.client = newZk
    }
    this.client.connect();
  }

  close() {
    this.client.close();
  }
}
