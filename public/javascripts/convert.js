
let locationToFeature = (location) => {
  location["marker-symbol"] = "marker"
  location.title = location.organizations.reduce((prev, curr) => { return prev === "" ? prev + curr.name : prev + " & " + curr.name}, "")
  //XXX: This is a workaround for
  //https://github.com/mapbox/mapbox-gl-js/issues/2434
  location.organizations = JSON.stringify(location.organizations)
  return {
    "type": "Feature",
    "properties": location,
    geometry: {
      "type": "Point",
      coordinates: [ location.lng, location.lat ]
    }
  }
}

class Convert {

  constructor() {
  }

  static toGeojson(locations) {
    return {
      "type": "FeatureCollection",
      "features": locations.map(locationToFeature)
    }
  }

}

export default Convert
