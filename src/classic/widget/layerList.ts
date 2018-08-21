import eLayerList from "esri/widgets/LayerList";
import eExpand from "esri/widgets/Expand";

export default class LayerList {
  constructor(view: null) {
    view.when(function () {
      let layerList = new eLayerList({
        view: view
      });
      let bgExpand = new eExpand({
        view: view,
        content: layerList,
        expandIconClass: "esri-icon-basemap"
      });
      view.ui.add(bgExpand, "top-right");
    }, function (err) {
      console.log(err)
    })

  }
}
