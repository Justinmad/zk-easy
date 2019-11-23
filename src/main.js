import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import Prompt from "./plugins/prompt";

import {ipcRenderer, remote} from 'electron'

Vue.use(Prompt)
Vue.config.productionTip = false
let currentWindow = remote.getCurrentWindow();
Vue.prototype.$win = currentWindow
Vue.prototype.$winMax = () => {
  ipcRenderer.send('window-max');
  if (currentWindow.isMaximized()) {
    currentWindow.unmaximize()
  } else {
    currentWindow.maximize();
  }
}
Vue.prototype.$winMin = () => {
  currentWindow.minimize();
}
Vue.prototype.$winClose = () => {
  currentWindow.close();
}

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app');
