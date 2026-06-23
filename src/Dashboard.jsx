import { useMemo, useState } from "react";
import StorageRoom from "./StorageRoom";

const FOOD_LIBRARY = [
  { id: "milk", name: "Milk", shelfLifeDays: 7, baseRisk: 18, color: "#f8fafc" },
  { id: "chicken", name: "Chicken", shelfLifeDays: 4, baseRisk: 42, color: "#f97316" },
  { id: "fish", name: "Fish", shelfLifeDays: 3, baseRisk: 48, color: "#38bdf8" },
  { id: "vegetables", name: "Vegetables", shelfLifeDays: 9, baseRisk: 14, color: "#4ade80" },
  { id: "fruits", name: "Fruits", shelfLifeDays: 8, baseRisk: 12, color: "#f59e0b" },
  { id: "cheese", name: "Cheese", shelfLifeDays: 12, baseRisk: 20, color: "#fde68a" },
  { id: "meat", name: "Meat", shelfLifeDays: 5, baseRisk: 38, color: "#ef4444" },
  { id: "ready-to-eat", name: "Ready to Eat", shelfLifeDays: 2, baseRisk: 55, color: "#c084fc" },
];

const INITIAL_ITEMS = [
  { id: 1, foodId: "milk", zoneId: "A1", placedHoursAgo: 18, quantity: 6 },
  { id: 2, foodId: "chicken", zoneId: "B2", placedHoursAgo: 54, quantity: 4 },
  { id: 3, foodId: "fish", zoneId: "C3", placedHoursAgo: 21, quantity: 3 },
  { id: 4, foodId: "vegetables", zoneId: "D1", placedHoursAgo: 32, quantity: 10 },
  { id: 5, foodId: "cheese", zoneId: "E2", placedHoursAgo: 12, quantity: 5 },
];

const ZONES = [
  { id: "A1", label: "Chilled Dock", temp: 4.2, humidity: 62, gas: 120, x: 0.16, y: 0.18 },
  { id: "B2", label: "Center Rack", temp: 7.8, humidity: 68, gas: 210, x: 0.49, y: 0.43 },
  { id: "C3", label: "Warm Wall", temp: 12.6, humidity: 75, gas: 350, x: 0.81, y: 0.22 },
  { id: "D1", label: "Front Shelf", temp: 3.9, humidity: 60, gas: 110, x: 0.28, y: 0.74 },
  { id: "E2", label: "Back Shelf", temp: 9.1, humidity: 66, gas: 180, x: 0.64, y: 0.67 },
];

const heatColor = (score) => {
  if (score < 25) return "#22c55e";
  if (score < 50) return "#facc15";
  if (score < 75) return "#fb923c";
  return "#ef4444";
};

const formatDays = (value) => `${value.toFixed(1)} days`;

function scoreItem(food, zone, elapsedDays) {
  const shelfProgress = Math.min(100, (elapsedDays / food.shelfLifeDays) * 100);
  const environmentalPenalty =
    Math.max(0, zone.temp - 4) * 5 + Math.max(0, zone.humidity - 60) * 0.7 + Math.max(0, zone.gas - 120) * 0.08;
  return Math.max(0, Math.min(100, food.baseRisk + shelfProgress * 0.45 + environmentalPenalty));
}

export default function Dashboard() {
  const [selectedFoodId, setSelectedFoodId] = useState("chicken");
  const [selectedZoneId, setSelectedZoneId] = useState("B2");
  const [timelineHours, setTimelineHours] = useState(48);
  const [items, setItems] = useState(INITIAL_ITEMS);

  const selectedFood = FOOD_LIBRARY.find((item) => item.id === selectedFoodId) ?? FOOD_LIBRARY[0];
  const selectedZone = ZONES.find((zone) => zone.id === selectedZoneId) ?? ZONES[1];

  const analytics = useMemo(() => {
    const enriched = items.map((item) => {
      const food = FOOD_LIBRARY.find((candidate) => candidate.id === item.foodId) ?? FOOD_LIBRARY[0];
      const zone = ZONES.find((candidate) => candidate.id === item.zoneId) ?? ZONES[0];
      const elapsedDays = item.placedHoursAgo / 24;
      const risk = scoreItem(food, zone, elapsedDays);
      const remaining = Math.max(0, food.shelfLifeDays - elapsedDays);
      return { ...item, food, zone, elapsedDays, risk, remaining };
    });

    const avgRisk = enriched.reduce((sum, item) => sum + item.risk, 0) / enriched.length;
    const critical = enriched.filter((item) => item.risk >= 70).length;
    const warning = enriched.filter((item) => item.risk >= 45 && item.risk < 70).length;
    const safe = enriched.length - warning - critical;
    const fsi = Math.max(0, Math.min(100, Math.round(100 - avgRisk * 0.7)));
    return { enriched, avgRisk, critical, warning, safe, fsi };
  }, [items]);

  const selectedZoneRisk = useMemo(() => {
    const food = selectedFood;
    const zone = selectedZone;
    const elapsedDays = timelineHours / 24;
    const risk = scoreItem(food, zone, elapsedDays);
    const remaining = Math.max(0, food.shelfLifeDays - elapsedDays);
    return { risk, remaining, elapsedDays };
  }, [selectedFood, selectedZone, timelineHours]);

  const trend = useMemo(() => {
    const points = Array.from({ length: 9 }, (_, index) => {
      const hour = index * 6;
      const elapsedDays = hour / 24;
      const food = selectedFood;
      const zone = selectedZone;
      const risk = scoreItem(food, zone, elapsedDays);
      return { hour, risk };
    });
    return points;
  }, [selectedFood, selectedZone]);

  const addDemoFood = () => {
    const nextId = items.length ? Math.max(...items.map((item) => item.id)) + 1 : 1;
    setItems((current) => [
      ...current,
      {
        id: nextId,
        foodId: selectedFood.id,
        zoneId: selectedZone.id,
        placedHoursAgo: Math.round(timelineHours),
        quantity: 4,
      },
    ]);
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Digital Twin for HACCP Compliance</span>
          <h1>Next-gen intelligent storage unit</h1>
          <p>
            Live 3D room visualization, sensor-driven heatmaps, food placement controls, and AI shelf-life
            prediction in one operating view.
          </p>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <span>Food Safety Index</span>
            <strong>{analytics.fsi}</strong>
          </div>
          <div className="hero-stat">
            <span>Safe Zones</span>
            <strong>{analytics.safe}</strong>
          </div>
          <div className="hero-stat">
            <span>Critical</span>
            <strong>{analytics.critical}</strong>
          </div>
        </div>
      </header>

      <section className="top-grid">
        <div className="panel panel-large">
          <div className="panel-header">
            <div>
              <h2>3D digital twin</h2>
              <p>Rotate, inspect zones, and see food placement across the storage room.</p>
            </div>
            <div className="legend">
              <span><i style={{ background: "#22c55e" }} /> Safe</span>
              <span><i style={{ background: "#facc15" }} /> Warning</span>
              <span><i style={{ background: "#fb923c" }} /> Risky</span>
              <span><i style={{ background: "#ef4444" }} /> Critical</span>
            </div>
          </div>
          <StorageRoom items={analytics.enriched} zones={ZONES} />
        </div>

        <div className="panel compact-panel">
          <h2>Heatmap intelligence</h2>
          <p>Sensor values are fused into a zone score and projected as a live room heat layer.</p>
          <div className="heatmap-card">
            {ZONES.map((zone) => {
              const zoneItems = analytics.enriched.filter((item) => item.zoneId === zone.id);
              const score = zoneItems.length
                ? zoneItems.reduce((sum, item) => sum + item.risk, 0) / zoneItems.length
                : (zone.temp - 3) * 6 + (zone.humidity - 55) * 0.8 + (zone.gas - 100) * 0.08;
              return (
                <button
                  key={zone.id}
                  className={`zone-chip ${selectedZoneId === zone.id ? "active" : ""}`}
                  style={{ "--zone-color": heatColor(score) }}
                  onClick={() => setSelectedZoneId(zone.id)}
                >
                  <strong>{zone.id}</strong>
                  <span>{zone.label}</span>
                  <small>{Math.round(score)} risk</small>
                </button>
              );
            })}
          </div>
          <div className="vertical-scale" />
        </div>
      </section>

      <section className="control-grid compact-grid">
        <div className="panel">
          <h2>Demo foods and placement</h2>
          <label>
            Food library
            <select value={selectedFoodId} onChange={(event) => setSelectedFoodId(event.target.value)}>
              {FOOD_LIBRARY.map((food) => (
                <option key={food.id} value={food.id}>
                  {food.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Shelf or zone
            <select value={selectedZoneId} onChange={(event) => setSelectedZoneId(event.target.value)}>
              {ZONES.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.id} - {zone.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Placement timeline: {timelineHours} hrs
            <input
              type="range"
              min="0"
              max="120"
              step="3"
              value={timelineHours}
              onChange={(event) => setTimelineHours(Number(event.target.value))}
            />
          </label>
          <button className="primary-button" onClick={addDemoFood}>
            Add food item to model
          </button>
          <div className="info-card">
            <strong>{selectedFood.name}</strong>
            <p>
              Estimated shelf life: {selectedFood.shelfLifeDays} days. Zone {selectedZone.id} currently trends
              toward {heatColor(selectedZoneRisk.risk)} risk.
            </p>
          </div>
        </div>

        <div className="panel">
          <h2>AI shelf-life analysis</h2>
          <div className="metric-stack">
            <div className="metric">
              <span>Spoilage risk</span>
              <strong>{Math.round(selectedZoneRisk.risk)}%</strong>
            </div>
            <div className="metric">
              <span>Remaining shelf life</span>
              <strong>{formatDays(selectedZoneRisk.remaining)}</strong>
            </div>
            <div className="metric">
              <span>Elapsed</span>
              <strong>{formatDays(selectedZoneRisk.elapsedDays)}</strong>
            </div>
          </div>
          <ul className="bullets">
            <li>Temperature drift is penalized more heavily for highly perishable foods.</li>
            <li>Humidity and gas exposure push zone risk upward in the heat layer.</li>
            <li>Timeline playback updates the forecast for each food placement.</li>
          </ul>
        </div>

        <div className="panel compact-panel">
          <h2>Room health score</h2>
          <div className="donut">
            <span>{analytics.fsi}</span>
            <small>/100</small>
          </div>
          <div className="small-cards">
            <div>
              <span>Safe</span>
              <strong>{analytics.safe}</strong>
            </div>
            <div>
              <span>Warning</span>
              <strong>{analytics.warning}</strong>
            </div>
            <div>
              <span>Critical</span>
              <strong>{analytics.critical}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="panel timeline-panel compact-timeline">
        <div className="panel-header">
          <div>
            <h2>Timeline and predictions</h2>
            <p>Playback history, spoilage curves, and sensor-driven forecasting.</p>
          </div>
          <div className="timeline-note">Last update: live simulated data</div>
        </div>
        <div className="line-chart" role="img" aria-label="Risk trend over time">
          {trend.map((point) => (
            <div
              key={point.hour}
              className="line-point"
              style={{
                left: `${(point.hour / 48) * 100}%`,
                top: `${100 - point.risk}%`,
                background: heatColor(point.risk),
              }}
              title={`${point.hour} hrs: ${Math.round(point.risk)} risk`}
            />
          ))}
        </div>
      </section>

      <section className="feature-grid compact-features">
        {[
          "Real-time sensor overlays at each shelf and zone",
          "Live heatmap updates when food type or timeline changes",
          "Shelf-life prediction with per-item spoilage forecasting",
          "Risk hotspots for HACCP compliance review",
          "Food placement and reslotting inside the 3D twin",
          "Timeline playback for historical and forward-looking analysis",
          "Alert logic for temperature, humidity, and gas anomalies",
          "Zone-aware recommendations for faster rotation and safer storage",
        ].map((item) => (
          <div className="feature-card" key={item}>
            {item}
          </div>
        ))}
      </section>
    </div>
  );
}
