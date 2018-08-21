<template>
  <div id="app">
    <s-map></s-map>
  </div>
</template>

<script lang="ts">
  import {Component, Vue} from 'vue-property-decorator';
  import SMap from './components/map.vue';
  import '@/assets/css/main.scss'

  @Component({
    components: {
      SMap,
    }
  })
  export default class App extends Vue {
    drawLine() {
      console.log(SgMap)
    }
  }
</script>

<style>
  * {
    margin: 0;
    padding: 0;
  }

  html, body, #app {
    height: 100%;
  }
</style>
