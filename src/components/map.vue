<template>
  <div id="map"></div>
</template>
<script lang="ts">
  import eMap from 'esri/Map';
  import eview from "esri/views/MapView";
  import {Component, Vue} from 'vue-property-decorator';

  @Component
  export default class SMap extends Vue {
    mounted() {
      //初始化地图
      let view = new eview({
        map: new eMap({
          basemap: 'streets'
        }),
        container: "map"
      })
      // 添加图层树
      new SgMap.LayerList(view)

    }
  }


</script>
<style scoped lang="scss">
  #map {
    height: 100%;
  }
</style>

