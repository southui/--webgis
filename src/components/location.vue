<template>
  <div class="location">
    <ul class="location_tab">
      <li v-for="(i,index) in tabs" :key="index" :class="{active:active==index}" @click="change(index)">{{i}}</li>
    </ul>
    <ul class="location_tabs">
      <li v-show="active==0">
        <p>请输入坐标</p>
        <div>x: <input type="text" v-model="x"></div>
        <div>y: <input type="text" v-model="y"></div>
      </li>
      <li v-show="active==1">
        <p>请输入坐标</p>
        <div>图幅号: <input type="text" v-model="sheetNum"></div>
        <div>图幅名: <input type="text" v-model="sheetName"></div>
      </li>
      <li v-show="active==2">
        3
      </li>
    </ul>
    <button class="location_ok" @click="test" v-show="active==0">确定</button>
    <button class="location_ok" @click="layer" v-show="active==1">确定</button>
  </div>
</template>

<script>
  import esriLoader from 'esri-loader'

  export default {
    data() {
      return {
        tabs: ['坐标定位', '图幅定位', '行政区定位'],
        active: 0,
        x: 500810.29699042614,
        y: 2777879.918373673,
        sheetNum: 1,
        sheetName: '',
        Graphic: '',
        Point: '',
        SpatialReference: '',
        FeatureLayer: ''
      }
    },
    props: [
      'dojoUrl',
      'wkid'
    ],
    methods: {
      change(idx) {
        this.active = idx;
      },
      test() {
        let map = this.$root.map
        let view = this.$root.view
        let Graphic = this.Graphic;
        let Point = this.Point;
        let SpatialReference = this.SpatialReference;
        let _this = this;

        let spatialReference = new SpatialReference({
          wkid: _this.wkid
          // wkid: 2383
        })

        var point = {
          type: "point",
          longitude: _this.x,
          latitude: _this.y,
          spatialReference: spatialReference
        };

        var markerSymbol = {
          type: "simple-marker",
          color: [51, 140, 253],
          outline: {
            color: [255, 255, 255],
            width: 2
          }
        };

        var pointGraphic = new Graphic({
          geometry: point,
          symbol: markerSymbol
        });
        // debugger
        var zs = {
          center: [500810.29699042614, 2777879.918373673]
        }
        console.log(pointGraphic)
        view.goTo(pointGraphic)
        view.graphics.add(pointGraphic)
        view.on("click", function (event) {
          console.log(event.mapPoint)
        });

      },
      layer() {
        let FeatureLayer = this.FeatureLayer
        let map = this.$root.map
        let view = this.$root.view
        var queryUrl = 'http://183.3.132.227:6080/arcgis/rest/services/LYWebGIS/LongYanWebPlan_TMP/MapServer'
        const fl = new FeatureLayer({
          url: "http://183.3.132.227:6080/arcgis/rest/services/LONGYAN80/MapServer/2"
        });
        // map.add(fl);  // adds the layer to the map
        fl.queryFeatures().then(function (results) {
          console.log(results);  // prints all the client-side graphics to the console
        });
        // view.whenLayerView(fl).then(function(lyrView){
        //     lyrView.watch("updating", function(val){
        //         if(!val){  // wait for the layer view to finish updating
        //         lyrView.queryFeatures().then(function(results){
        //             console.log(results);  // prints all the client-side graphics to the console
        //         });
        //         }
        //     });
        // });
      },
      load() {
        let _this = this;
        const options = {
          url: _this.dojoUrl
          //   url: "http://192.168.10.9:3002/arcgis_js_api/library/4.7/dojo/dojo.js"
        };
        esriLoader.loadModules(
          [
            "esri/config",
            "esri/Graphic",
            "esri/geometry/Point",
            "esri/geometry/SpatialReference",
            "esri/layers/FeatureLayer",
            "esri/tasks/support/Query",
            "esri/tasks/QueryTask",
            "dojo/domReady!"
          ],
          options
        ).then(([esriConfig, Graphic, Point, SpatialReference, FeatureLayer, Query, QueryTask]) => {

          _this.Graphic = Graphic
          _this.Point = Point
          _this.SpatialReference = SpatialReference
          _this.FeatureLayer = FeatureLayer

        });
      }
    },
    mounted() {
      this.load()
    }
  }
</script>

<style scoped>
  .location {
    position: absolute;
    top: 90px;
    left: 100px;
    width: 350px;
    height: 250px;
    z-index: 10;
    background: #f8f8f8;
    border: 1px solid #e4e4e4;
  }

  .location_tab {
    height: 50px;
    border-bottom: 1px solid #e4e4e4;
    background: #fff;
  }

  .location_tab li {
    float: left;
    width: 33.3%;
    height: 50px;
    line-height: 50px;
    color: #338cfd;
    cursor: pointer;
  }

  .location_tab .active {
    background: #338cfd;
    color: #fff;
  }

  .location_tabs {
    height: 150px;
  }

  .location_tabs li {
    height: 150px;
    box-sizing: border-box;
    padding: 10px;
  }

  .location_tabs p {
    color: #333333;
    padding: 10px;
  }

  .location_tabs div {
    height: 40px;
    line-height: 40px;
  }

  .location_tabs div input {
    height: 30px;
    width: 250px;
    border-radius: 5px;
    border: 1px solid #e4e4e4;
    text-indent: 10px;
  }

  .location_ok {
    width: 80px;
    height: 30px;
    color: #fff;
    background: #338cfd;
    border: none;
    border-radius: 5px;
  }
</style>
