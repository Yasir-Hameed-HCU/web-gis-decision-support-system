import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import MapView from "./components/MapView";
import StatsPanel from "./components/StatsPanel";
import Charts from "./components/Charts";
import ScenarioConsole from "./components/ScenarioConsole";
import VulnerabilityPanel from "./components/VulnerabilityPanel";
import About from "./components/About";
import { getHospitals, getStatistics, getMCDA, getScenarios, getHealth, getDistricts } from "./api/client";
import "./App.css";

export default function App() {
  const [serviceGroup, setServiceGroup] = useState("geriatrics");
  const [layers, setLayers] = useState({ accessibility: true, fragility: false, vulnerability: false, hospitals: true });
  const [scenarioOn, setScenarioOn] = useState(false);
  const [basemap, setBasemap] = useState("light");
  const [opacity, setOpacity] = useState(0.7);
  const [showLabels, setShowLabels] = useState(false);
  const [showDistricts, setShowDistricts] = useState(true);
  const [highlight, setHighlight] = useState(null);
  const [focusDistrict, setFocusDistrict] = useState(null);
  const [aboutOpen, setAboutOpen] = useState(false);

  const [hospitals, setHospitals] = useState(null);
  const [stats, setStats] = useState([]);
  const [mcda, setMcda] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [districts, setDistricts] = useState(null);
  const [online, setOnline] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      getHospitals(serviceGroup).then(setHospitals),
      getStatistics(serviceGroup).then(setStats),
      getMCDA(serviceGroup).then(setMcda),
    ]).finally(() => setLoading(false));
  }, [serviceGroup]);

  useEffect(() => {
    getScenarios().then(setScenarios).catch(() => setScenarios([]));
    getDistricts().then(setDistricts).catch(() => setDistricts(null));
    getHealth().then(() => setOnline(true)).catch(() => setOnline(false));
  }, []);

  return (
    <div className="app">
      <header className="topbar">
        <span className="title">A Web GIS Decision-Support Platform: Healthcare Accessibility, Mecklenburg-Vorpommern</span>
        <span className="topbar-right">
          <button className="about-btn" onClick={() => setAboutOpen(true)}>About / Methods</button>
          <span className={`status ${online ? "ok" : online === false ? "down" : ""}`}>
            {online === null ? "…" : online ? "API online" : "API offline"}
          </span>
        </span>
      </header>

      <div className="body">
        <Sidebar
          serviceGroup={serviceGroup} setServiceGroup={setServiceGroup}
          layers={layers} setLayers={setLayers}
          basemap={basemap} setBasemap={setBasemap}
          opacity={opacity} setOpacity={setOpacity}
          showLabels={showLabels} setShowLabels={setShowLabels}
          showDistricts={showDistricts} setShowDistricts={setShowDistricts}
          scenarioOn={scenarioOn}
        />

        <main className="mapwrap">
          {loading && <div className="loading">Loading…</div>}
          {focusDistrict && <button className="reset-view" onClick={() => setFocusDistrict(null)}>↺ Reset view ({focusDistrict})</button>}
          <MapView
            serviceGroup={serviceGroup} layers={layers} hospitals={hospitals}
            scenarioOn={scenarioOn} basemap={basemap} opacity={opacity} showLabels={showLabels}
            highlight={highlight} districts={districts} showDistricts={showDistricts} focusDistrict={focusDistrict}
          />
        </main>

        <section className="rightpanel">
          <StatsPanel stats={stats} />
          <Charts stats={stats} onHighlight={setHighlight} onFocusDistrict={setFocusDistrict} />
          <ScenarioConsole scenarios={scenarios} scenarioOn={scenarioOn} setScenarioOn={setScenarioOn} serviceGroup={serviceGroup} />
          <VulnerabilityPanel scores={mcda} />
        </section>
      </div>

      <About open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}
