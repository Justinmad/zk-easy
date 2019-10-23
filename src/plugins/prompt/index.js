import PromptVue from "./Prompt";
import vuetify from '../vuetify'

const Prompt = {}

Prompt.install = function (Vue) {
  let PromptTpl = Vue.extend(PromptVue);
  let components = new PromptTpl({
    vuetify,
  });
  let $mount = components.$mount();
  Vue.prototype.$confirm = (configOrMsg, cb) => {
    components.confirm(configOrMsg, cb)
  };
  Vue.prototype.$info = (config) => {
    components._alert(config, 'info')
  }
  Vue.prototype.$success = (config) => {
    components._alert(config, 'success')
  }
  Vue.prototype.$warn = (config) => {
    components._alert(config, 'warn')
  }
  Vue.prototype.$error = (config) => {
    components._alert(config, 'error')
  }
  Vue.mixin({
    mounted() {
      if (!this.$parent) {
        $mount.$el.classList.add("v-application")
        document.body.appendChild($mount.$el)
      }
    }
  })
}
export default Prompt
