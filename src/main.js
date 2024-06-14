import Vue from 'vue'
import App from './App.vue'
// 删除这个引入
// import './styles/comm.scss';

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
