import '@/assets/styles/tailwind.css';
import Vue from 'vue'
import App from './App.vue'
import commerce from 'commerce-components'
Vue.config.productionTip = false
Vue.use(commerce, { commercejsPublicKey: process.env.VUE_APP_CHEC_PUBLIC_KEY });
new Vue({
  render: h => h(App),
}).$mount('#app')
