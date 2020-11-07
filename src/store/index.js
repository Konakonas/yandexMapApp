/*
  Можно потом перенести модули (modules) в отдельный ООП компонент
*/
import Vue from 'vue';
import Vuex from 'vuex';
import addStore from './modules/addresses';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    addStore,
  },
});

export default store;
