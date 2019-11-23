import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import Prompt from "./plugins/prompt";

import {ipcRenderer,remote} from 'electron'

Vue.use(Prompt)
Vue.config.productionTip = false
Vue.prototype.$winMax = () => {
  ipcRenderer.send('window-max');
}

Vue.prototype.$winMin = () => {
  ipcRenderer.send('window-min');
}

Vue.prototype.$winClose = () => {
  ipcRenderer.send('window-close');
}

Vue.prototype.$win = remote.getCurrentWindow()

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app');
