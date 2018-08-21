<template>
  <div id="topbar">
    <button class="action-button esri-icon-blank-map-pin" id="pointButton" type="button"
            title="标记"></button>
    <button class="action-button esri-icon-polyline" id="polylineButton" type="button"
            title="测距" @click="measureLength"></button>
    <button class="action-button esri-icon-polygon esri-widget-button esri-widget esri-interactive" id="polygonButton" type="button"
            title="测面积" @click = "measureArea"></button>
    <button class="action-button esri-icon-trash" id="resetBtn" type="button" title="清除" @click = "clearGraphics"></button>
  </div>
</template>

<script>
  import {draw} from '@/utils'
  import {mapState} from 'vuex'

  export default {
    name: "measuring",
    data() {
      return {
        draw:'',
        Draw:'',
        Map:'',
        MapView:'',
        Graphic:'',
        Polygon:'',
        geometryEngine:'',
        SketchViewModel:'',
        tempGraphicsLayer:'',
        pointSymbol:'',
        polylineSymbol:'',
        polygonSymbol:'',
        Polyline:''
      }
    },
    computed: {
      ...mapState([
        'view'
      ])
    },
    methods: {
      createTool() {
        var view = this.view;
        this.$esriLoader.loadModules(
          [
            'esri/widgets/Expand',
            "esri/views/2d/draw/Draw",
            "esri/Map",
            "esri/views/MapView",
            "esri/widgets/Sketch/SketchViewModel",
            "esri/Graphic",
            "esri/layers/GraphicsLayer",
            "esri/geometry/Polyline",
            "esri/geometry/Polygon",
            "esri/geometry/geometryEngine",
            "dojo/domReady!",
          ],
        ).then(([Expand,Draw,Map, MapView,SketchViewModel, Graphic, GraphicsLayer,Polyline,Polygon,geometryEngine, ready]) => {
          var _this = this;
          var tempGraphicsLayer = new GraphicsLayer();
          _this.tempGraphicsLayer = tempGraphicsLayer;
          var updateGraphic;
          var map = new Map({
            layers: [tempGraphicsLayer]
          });
          var view = _this.view;

          view.when(() => {
            const toolExpand = new Expand({
              view: view,
              content: document.getElementById('topbar'),
              expandIconClass: 'esri-icon-maximize',
              expandTooltip: '通用工具'
            })
            view.ui.add(toolExpand, 'top-right');
            document.getElementById('topbar').style.display = 'block';
            var draw = new Draw({
              view: _this.view
            });
            _this.draw = draw;
            _this.Draw =Draw;
            _this.Map = Map;
            _this.MapView = MapView;
            _this.Graphic = Graphic;
            _this.Polygon = Polygon;
            _this.geometryEngine = geometryEngine;
            _this.SketchViewModel = SketchViewModel;
            _this.Polyline = Polyline;
          })

        });
      },
      clearGraphics(){
        var view = this.view;
        view.graphics.removeAll();
      },
      measureLength(){
        var draw = this.draw;
        var Draw = this.Draw;
        var Map = this.Map;
        var MapView = this.MapView;
        var Graphic = this.Graphic;
        var Polyline = this.Polyline;
        var geometryEngine = this.geometryEngine;
        var view = this.view;
        view.graphics.removeAll();
        enableCreateLine(draw, view);
        function enableCreateLine(draw, view) {
          // creates and returns an instance of PolyLineDrawAction
          // can only draw a line by clicking on the map
          var action = draw.create("polyline", {mode: "click"});

          // focus the view to activate keyboard shortcuts for sketching
          view.focus();

          // listen to vertex-add event on the polyline draw action
          action.on("vertex-add", updateVertices);

          // listen to vertex-remove event on the polyline draw action
          action.on("vertex-remove", updateVertices);

          // listen to cursor-update event on the polyline draw action
          action.on("cursor-update", createGraphic);

          // listen to draw-complete event on the polyline draw action
          action.on("draw-complete", updateVertices);
        }
        function updateVertices(evt) {
          // create a polyline from returned vertices
          var result = createGraphic(evt);

          // if the last vertex is making the line intersects itself,
          // prevent "vertex-add" or "vertex-remove" from firing
          if (result.selfIntersects) {
            evt.preventDefault();
          }
        }

        // create a new graphic presenting the polyline that is being drawn on the view
        function createGraphic(evt) {
          var vertices = evt.vertices;
          view.graphics.removeAll();

          // a graphic representing the polyline that is being drawn
          var graphic = new Graphic({
            geometry: new Polyline({
              paths: vertices,
              spatialReference: view.spatialReference
            }),
            symbol: {
              type: "simple-line", // autocasts as new SimpleFillSymbol
              color: [4, 90, 141],
              width: 4,
              cap: "round",
              join: "round"
            }
          });

          // check the polyline intersects itself.
          var intersectingFeature = getIntersectingFeature(graphic.geometry);

          // Add a new graphic for the intersecting segment.
          if (intersectingFeature) {
            view.graphics.addMany([graphic, intersectingFeature]);
          }
          // Just add the graphic representing the polyline if no intersection
          else {
            view.graphics.add(graphic);
          }
          //计算
          var length;
          let geoSR = graphic.geometry.spatialReference;
          if(geoSR.isGeographic == true)
          {
            length = geometryEngine.geodesicLength(graphic.geometry, "meters");
          }else {
            length = geometryEngine.planarLength(graphic.geometry, "meters");
          }

          if (length < 0) {
            // simplify the polygon if needed and calculate the area again
            var simplifiedPolyline = geometryEngine.simplify(graphic.geometry);
            if (simplifiedPolyline) {
              if(geoSR.isGeographic == true)
              {
                length = geometryEngine.geodesicLength(graphic.geometry, "meters");
              }else {
                length = geometryEngine.planarLength(graphic.geometry, "meters");
              }
              // area = geometryEngine.geodesicArea(simplifiedPolygon, "acres");
             // length = geometryEngine.planarLength(simplifiedPolyline, "meters");
            }
          }
          labelLength(graphic.geometry, length);
          // return the graphic and intersectingSegment
          return {
            graphic: graphic,
            selfIntersects: intersectingFeature
          }
          // start displaying the area of the polygon

        }

        function labelLength(geom, length) {

          if(geom.paths[0][1]){
          var labelPoint = {
            type:"point",
          x:(geom.paths[0][0][0]+geom.paths[0][1][0])/2,
          y:(geom.paths[0][0][1]+geom.paths[0][1][1])/2,
          spatialReference:geom.spatialReference}
          var graphic = new Graphic({
            geometry: labelPoint,
            symbol: {
              type: "text",
              color: "red",
              haloColor: "black",
              haloSize: "1px",
              text: length.toFixed(2) + " meters",
              xoffset: 3,
              yoffset: 3,
              font: { // autocast as Font
                size: 14,
                family: "sans-serif"
              }
            }
          });
          view.graphics.add(graphic);
          }
        }
        // function that checks if the line intersects itself
        function isSelfIntersecting(polyline) {
          if (polyline.paths[0].length < 3) {
            return false
          }
          var line = polyline.clone();

          //get the last segment from the polyline that is being drawn
          var lastSegment = getLastSegment(polyline);
          line.removePoint(0, line.paths[0].length - 1);

          // returns true if the line intersects itself, false otherwise
          return geometryEngine.crosses(lastSegment, line);
        }

        // Checks if the line intersects itself. If yes, changes the last
        // segment's symbol giving a visual feedback to the user.
        function getIntersectingFeature(polyline) {
          if (isSelfIntersecting(polyline)) {
            return new Graphic({
              geometry: getLastSegment(polyline),
              symbol: {
                type: "simple-line", // autocasts as new SimpleLineSymbol
                style: "short-dot",
                width: 3.5,
                color: "yellow"
              }
            });
          }
          return null;
        }

        // Get the last segment of the polyline that is being drawn
        function getLastSegment(polyline) {
          var line = polyline.clone();
          var lastXYPoint = line.removePoint(0, line.paths[0].length - 1);
          var existingLineFinalPoint = line.getPoint(0, line.paths[0].length -
            1);

          return new Polyline({
            spatialReference: view.spatialReference,
            hasZ: false,
            paths: [
              [
                [existingLineFinalPoint.x, existingLineFinalPoint.y],
                [lastXYPoint.x, lastXYPoint.y]
              ]
            ]
          });
        }

      },
      measureArea(){
        var draw = this.draw;
        var Draw = this.Draw;
        var Map = this.Map;
        var MapView = this.MapView;
        var Graphic = this.Graphic;
        var Polygon = this.Polygon;
        var geometryEngine = this.geometryEngine;
        var view = this.view;
        view.graphics.removeAll();
        enableCreatePolygon(draw, view);
        function enableCreatePolygon(draw, view) {
          // create() will return a reference to an instance of PolygonDrawAction
          var action = draw.create("polygon");

          // focus the view to activate keyboard shortcuts for drawing polygons
          view.focus();

          // listen to vertex-add event on the action
          action.on("vertex-add", drawPolygon);

          // listen to cursor-update event on the action
          action.on("cursor-update", drawPolygon);

          // listen to vertex-remove event on the action
          action.on("vertex-remove", drawPolygon);

          // *******************************************
          // listen to draw-complete event on the action
          // *******************************************
          action.on("draw-complete", drawPolygon);
        }

        // this function is called from the polygon draw action events
        // to provide a visual feedback to users as they are drawing a polygon
        function drawPolygon(evt) {
          var vertices = evt.vertices;

          //remove existing graphic
          view.graphics.removeAll();

          // create a new polygon
          var polygon = createPolygon(vertices);

          // create a new graphic representing the polygon, add it to the view
          var graphic = createGraphic(polygon);
          view.graphics.add(graphic);

          // calculate the area of the polygon
          //  var area = geometryEngine.geodesicArea(polygon, "acres");
          var area;
          let geoSR = graphic.geometry.spatialReference;
          if(geoSR.isGeographic == true)
          {
            area = geometryEngine.geodesicArea(polygon, "acres");
          }else {
            area = geometryEngine.planarArea(polygon, "acres");
          }
         // var area = geometryEngine.planarArea(polygon, "acres");
          if (area < 0) {
            // simplify the polygon if needed and calculate the area again
            var simplifiedPolygon = geometryEngine.simplify(polygon);
            if (simplifiedPolygon) {
              // area = geometryEngine.geodesicArea(simplifiedPolygon, "acres");
              if(geoSR.isGeographic == true)
              {
                area = geometryEngine.geodesicArea(simplifiedPolygon, "acres");
              }else {
                area = geometryEngine.planarArea(simplifiedPolygon, "acres");
              }
             // area = geometryEngine.planarArea(simplifiedPolygon, "acres");
            }
          }
          // start displaying the area of the polygon
          labelAreas(polygon, area);
        }

        // create a polygon using the provided vertices
        function createPolygon(vertices) {
          return new Polygon({
            rings: vertices,
            spatialReference: view.spatialReference
          });
        }

        // create a new graphic representing the polygon that is being drawn on the view
        function createGraphic(polygon) {
          var graphic = new Graphic({
            geometry: polygon,
            symbol: {
              type: "simple-fill", // autocasts as SimpleFillSymbol
              color: [178, 102, 234, 0.8],
              style: "solid",
              outline: { // autocasts as SimpleLineSymbol
                color: [255, 255, 255],
                width: 2
              }
            }
          });
          return graphic;
        }

        //Label polyon with its area
        function labelAreas(geom, area) {
          var graphic = new Graphic({
            geometry: geom.centroid,
            symbol: {
              type: "text",
              color: "white",
              haloColor: "black",
              haloSize: "1px",
              text: area.toFixed(2) + " acres",
              xoffset: 3,
              yoffset: 3,
              font: { // autocast as Font
                size: 14,
                family: "sans-serif"
              }
            }
          });
          view.graphics.add(graphic);
        }
      },
    },
    watch: {
      view: function (evt) {
        if (this.view) {
          this.createTool();
        }

      }
    }
  }
</script>

<style scoped lang="scss">
  #topbar {
    background: #fff;
    padding: 10px;
    display: none; //防止闪烁
  }

  .action-button {
    font-size: 16px;
    background-color: transparent;
    border: 1px solid #D3D3D3;
    color: #6e6e6e;
    height: 32px;
    width: 32px;
    text-align: center;
    box-shadow: 0 0 1px rgba(0, 0, 0, 0.3);
  }

  .action-button:hover,
  .action-button:focus {
    background: #0079c1;
    color: #e4e4e4;
  }

  .active {
    background: #0079c1;
    color: #e4e4e4;
  }
</style>
