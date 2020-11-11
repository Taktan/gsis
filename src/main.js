import Vue from 'vue'
import App from './App.vue'
import VueZoomer from 'vue-zoomer'
import EmptyState from './components/EmptyState.vue'
Vue.use(VueZoomer)
Vue.component('empty-state', EmptyState)
import vuetify from './plugins/vuetify';

Vue.config.productionTip = false
new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app') 