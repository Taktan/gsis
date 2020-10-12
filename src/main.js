import Vue from 'vue'
import App from './App.vue'
import VueZoomer from 'vue-zoomer'
Vue.use(VueZoomer)
import vuetify from './plugins/vuetify';

Vue.config.productionTip = false
new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app') 