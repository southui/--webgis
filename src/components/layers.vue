<template>

</template>

<script>
  import {mapState} from 'vuex'

  export default {
    name: "layers",
    computed: {
      ...mapState([
        'view'
      ])
    },
    methods: {
      creatLayer(){
        var view = this.view
        this.$esriLoader.loadModules(
          [
            "esri/widgets/LayerList",
            "esri/widgets/Expand",
            "dojo/domReady!",
          ],
        ).then(([LayerList, Expand, ready]) => {
          view.when(() => {
            var layerList = new LayerList({
              container: document.createElement("div"),
              view: view
            });
            const layersExpand = new Expand({
              view: view,
              content: layerList.domNode,
              expandIconClass: 'esri-icon-layer-list',
              expandTooltip: 'Layers'
            })
            view.ui.add(layersExpand, 'top-right')
          })
        });
      }
    },
    watch:{
      view:function () {
        if (this.view) {
          this.creatLayer()
        }
      }
    }
  }
</script>

<style scoped>

</style>
