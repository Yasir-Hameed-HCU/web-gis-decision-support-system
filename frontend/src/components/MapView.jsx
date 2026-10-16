import { useEffect, useRef} from "react";
import { MapContainer, TileLayer, WMSTileLayer, GeoJSON, Pane, ScaleControl, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { WMS_BASE, MV_CENTER, MV_ZOOM, BASEMAPS, SERVICE_LABEL, THRESHOLDS } from "../config";

function pointToLayer(feature, latlng, serviceGroup) {
  const capable = feature.properties[serviceGroup] === 1;
  return L.circleMarker(latlng, {
    radius: 6, fillColor: capable ? "#d73027" : "#3478b5",
    color: "#ffffff", weight: 1.5, fillOpacity: capable ? 0.95 : 0.5,
  });
}
function onEachHospital(feature, layer, serviceGroup, showLabels) {
  const p = feature.properties;
  const svc = [p.surgery && "surgery", p.geriatrics && "geriatrics", p.emergency && "emergency"].filter(Boolean).join(", ") || "n/a";
  layer.bindPopup(`<b>${p.hospital_name}</b><br/>${p.city}<br/>Beds: ${p.beds ?? "n/a"}<br/>Services: ${svc}`);
  const capable = p[serviceGroup] === 1;
  layer.bindTooltip(p.hospital_name, { permanent: showLabels && capable, direction: "top", offset: [0, -6], className: "hosp-label", opacity: 0.95 });
}

// District outlines + permanent name labels; focused district drawn bold.
function Districts({ data, focus }) {
  if (!data) return null;
  const style = (f) => f.properties.district_name === focus
    ? { fill: false, color: "#1f3a5f", weight: 3.5, opacity: 1 }
    : { fill: false, color: "#37424d", weight: 1.1, opacity: 0.7, dashArray: "3 3" };
  return (
    <GeoJSON key={`dist-${focus}`} data={data} style={style}
      onEachFeature={(f, l) => l.bindTooltip(f.properties.district_name, { permanent: true, direction: "center", className: "dist-label" })} />
  );
}

// Pan/zoom to a district when a bar is clicked
// Fit the initial view to the study area once the districts arrive, so the state
// fills the map on any screen width instead of sitting inside a fixed zoom.
// The map container can still be zero-sized on the first frames of layout; fitting
// against a zero size makes Leaflet pick its maximum zoom, so wait for a real size.
function FitToStudyArea({ data }) {
  const map = useMap();
  const done = useRef(false);
  useEffect(() => {
    if (done.current || !data || !data.features?.length) return;
    const b = L.geoJSON(data).getBounds();
    if (!b.isValid()) return;
    let raf;
    const tryFit = () => {
      map.invalidateSize();
      const size = map.getSize();
      if (size.x < 50 || size.y < 50) { raf = requestAnimationFrame(tryFit); return; }
      map.fitBounds(b, { padding: [24, 24] });
      done.current = true;
    };
    raf = requestAnimationFrame(tryFit);
    return () => cancelAnimationFrame(raf);
  }, [data, map]);
  return null;
}

function FitToDistrict({ data, focus }) {
  const map = useMap();
  useEffect(() => {
    if (!focus || !data) return;
    const feats = data.features.filter((f) => f.properties.district_name === focus);
    if (!feats.length) return;
    const b = L.geoJSON({ type: "FeatureCollection", features: feats }).getBounds();
    if (b.isValid()) map.fitBounds(b, { padding: [30, 30] });
  }, [focus, data, map]);
  return null;
}

function ClickInfo({ queryLayer, title }) {
  const map = useMapEvents({
    click(e) {
      if (!queryLayer) return;
      const size = map.getSize(), pt = map.latLngToContainerPoint(e.latlng), b = map.getBounds();
      const url = `${WMS_BASE}?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo`
        + `&LAYERS=${queryLayer}&QUERY_LAYERS=${queryLayer}&SRS=EPSG:4326`
        + `&BBOX=${b.getWest()},${b.getSouth()},${b.getEast()},${b.getNorth()}`
        + `&WIDTH=${size.x}&HEIGHT=${size.y}&X=${Math.round(pt.x)}&Y=${Math.round(pt.y)}`
        + `&INFO_FORMAT=application/json&FEATURE_COUNT=1`;
      fetch(url).then((r) => r.json()).then((d) => {
        const f = d.features && d.features[0]; if (!f) return;
        const skip = new Set(["bbox", "grid_id", "score_id"]);
        const rows = Object.entries(f.properties)
          .filter(([k, v]) => !skip.has(k) && v !== null && k !== "geom")
          .map(([k, v]) => `<tr><td style="color:#7f8c8d;padding-right:8px">${k}</td><td><b>${typeof v === "number" ? Math.round(v * 100) / 100 : v}</b></td></tr>`).join("");
        L.popup({ maxWidth: 280 }).setLatLng(e.latlng)
          .setContent(`<div style="font-size:12px"><b>${title}</b><table style="margin-top:4px">${rows}</table></div>`).openOn(map);
      }).catch(() => {});
    },
  });
  return null;
}

export default function MapView({ serviceGroup, layers, hospitals, scenarioOn, basemap, opacity, showLabels, highlight, districts, showDistricts, focusDistrict }) {
  const bm = BASEMAPS[basemap] || BASEMAPS.light;
  const T = THRESHOLDS[serviceGroup] ?? 30;
  const wms = (name, op) => (
    // key forces a remount when the layer name changes; without it React reuses the
    // Leaflet layer and the new `layers` parameter never reaches GeoServer, so the
    // raster stays on whichever service loaded first.
    <WMSTileLayer key={name} url={WMS_BASE} layers={`healthcare_mv:${name}`} format="image/png" transparent version="1.3.0" opacity={op} />
  );
  const q = scenarioOn ? ["scenario_diff", "Scenario Δ"]
    : layers.vulnerability ? [`vulnerability_${serviceGroup}`, `Vulnerability: ${SERVICE_LABEL[serviceGroup]}`]
    : layers.fragility ? [`fragility_${serviceGroup}`, `Fragility: ${SERVICE_LABEL[serviceGroup]}`]
    : layers.accessibility ? [`accessibility_${serviceGroup}`, `Travel time: ${SERVICE_LABEL[serviceGroup]}`]
    : [null, null];

  return (
    <MapContainer center={MV_CENTER} zoom={MV_ZOOM} style={{ height: "100%", width: "100%" }}>
      <TileLayer url={bm.url} attribution={bm.attribution} />
      {layers.accessibility && wms(`accessibility_${serviceGroup}`, highlight ? 0.12 : opacity)}
      {highlight && (
        <WMSTileLayer key={`hl-${serviceGroup}-${highlight}`} url={WMS_BASE}
          layers={`healthcare_mv:accessibility_${serviceGroup}`} styles={highlight === "uncovered" ? "cell_red" : "cell_green"}
          format="image/png" transparent version="1.3.0" opacity={0.85}
          cql_filter={highlight === "uncovered" ? `travel_min > ${T}` : `travel_min <= ${T}`} />
      )}
      {layers.fragility && wms(`fragility_${serviceGroup}`, 0.6)}
      {layers.vulnerability && wms(`vulnerability_${serviceGroup}`, 0.55)}
      {scenarioOn && wms("scenario_diff", opacity)}
      {bm.labels && (
        <Pane name="labels" style={{ zIndex: 450, pointerEvents: "none" }}><TileLayer url={bm.labels} /></Pane>
      )}
      {showDistricts && <Districts data={districts} focus={focusDistrict} />}
      {layers.hospitals && hospitals && (
        <GeoJSON key={`hosp-${serviceGroup}-${showLabels}-${hospitals.features?.length ?? 0}`} data={hospitals}
          pointToLayer={(f, ll) => pointToLayer(f, ll, serviceGroup)}
          onEachFeature={(f, l) => onEachHospital(f, l, serviceGroup, showLabels)} />
      )}
      <FitToStudyArea data={districts} />
      <FitToDistrict data={districts} focus={focusDistrict} />
      <ClickInfo queryLayer={q[0]} title={q[1]} />
      <ScaleControl position="bottomleft" imperial={false} />
    </MapContainer>
  );
}
