import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import Prompt from "./plugins/prompt";
Vue.use(Prompt)
Vue.config.productionTip = false
new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app');
