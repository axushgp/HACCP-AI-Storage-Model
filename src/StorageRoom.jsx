import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";

function Room() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[14, 9]} />
        <meshStandardMaterial color="#1d2434" />
      </mesh>
      <mesh position={[0, 1.75, -4]}>
        <boxGeometry args={[14, 3.5, 0.1]} />
        <meshStandardMaterial color="#2d3444" />
      </mesh>
      <mesh position={[-6, 1.75, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[9, 3.5, 0.1]} />
        <meshStandardMaterial color="#2a3040" />
      </mesh>
      <mesh position={[6, 1.75, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[9, 3.5, 0.1]} />
        <meshStandardMaterial color="#2a3040" />
      </mesh>
      <mesh position={[0, 3.5, 0]}>
        <boxGeometry args={[14, 0.1, 9]} />
        <meshStandardMaterial color="#101522" />
      </mesh>
    </group>
  );
}

function ShelfBay({ position, height = 2.5, width = 1.25, depth = 0.72, accent = "#64748b" }) {
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#0f172a" transparent opacity={0.18} />
      </mesh>
      {[0.18, 0.82, 1.46, 2.08].map((level) => (
        <mesh key={level} position={[0, level, 0]}>
          <boxGeometry args={[width * 0.95, 0.06, depth * 0.92]} />
          <meshStandardMaterial color={accent} />
        </mesh>
      ))}
      <mesh position={[-width / 2 + 0.08, height / 2, 0]}>
        <boxGeometry args={[0.08, height, depth]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      <mesh position={[width / 2 - 0.08, height / 2, 0]}>
        <boxGeometry args={[0.08, height, depth]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      <mesh position={[0, 0.05, depth / 2 - 0.04]}>
        <boxGeometry args={[width * 0.96, 0.08, 0.08]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
    </group>
  );
}

function FoodBlock({ position, color, label, risk }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.34, 0.22, 0.26]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.15} />
      </mesh>
      <Html distanceFactor={9} transform position={[0, 0.22, 0]}>
        <div className="floating-label" style={{ "--glow": color }}>
          <strong>{label}</strong>
          <span>{Math.round(risk)} risk</span>
        </div>
      </Html>
    </group>
  );
}

function HeatField({ position, color, intensity }) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[2.8, 2.8, 1, 1]} />
      <meshBasicMaterial color={color} transparent opacity={0.12 + intensity * 0.003} />
    </mesh>
  );
}

export default function StorageRoom({ items, zones }) {
  return (
    <div className="canvas-shell">
      <Canvas camera={{ position: [8.2, 5.9, 9.5], fov: 40 }}>
        <ambientLight intensity={1.3} />
        <directionalLight position={[5, 8, 5]} intensity={2.5} color="#ffffff" />
        <directionalLight position={[-6, 3, -3]} intensity={0.9} color="#6ee7ff" />
        <fog attach="fog" args={["#0b1020", 14, 30]} />
        <OrbitControls enablePan={false} minDistance={7} maxDistance={18} />

        <Room />

        <mesh position={[0, -0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[13, 8.2, 1, 1]} />
          <meshStandardMaterial color="#0f172a" transparent opacity={0.55} />
        </mesh>

        {zones.map((zone) => (
          <group key={zone.id}>
            <HeatField
              position={[(zone.x - 0.5) * 8.5, 0.02, (zone.y - 0.5) * 6.5]}
              color={zone.temp > 10 ? "#ef4444" : zone.temp > 6 ? "#facc15" : "#22c55e"}
              intensity={zone.temp * 5 + zone.humidity * 0.5 + zone.gas * 0.08}
            />
          </group>
        ))}

        <ShelfBay position={[-4.8, 0, -2.5]} />
        <ShelfBay position={[-2.9, 0, -2.5]} />
        <ShelfBay position={[-1.0, 0, -2.5]} />
        <ShelfBay position={[0.9, 0, -2.5]} />
        <ShelfBay position={[2.8, 0, -2.5]} />
        <ShelfBay position={[4.7, 0, -2.5]} />

        <ShelfBay position={[-4.8, 0, 0]} height={2.7} />
        <ShelfBay position={[-2.9, 0, 0]} height={2.7} />
        <ShelfBay position={[-1.0, 0, 0]} height={2.7} />
        <ShelfBay position={[0.9, 0, 0]} height={2.7} />
        <ShelfBay position={[2.8, 0, 0]} height={2.7} />
        <ShelfBay position={[4.7, 0, 0]} height={2.7} />

        <ShelfBay position={[-4.8, 0, 2.5]} />
        <ShelfBay position={[-2.9, 0, 2.5]} />
        <ShelfBay position={[-1.0, 0, 2.5]} />
        <ShelfBay position={[0.9, 0, 2.5]} />
        <ShelfBay position={[2.8, 0, 2.5]} />
        <ShelfBay position={[4.7, 0, 2.5]} />

        {items.map((item, index) => {
          const zone = zones.find((candidate) => candidate.id === item.zoneId) ?? zones[0];
          const xOffset = (index % 4) * 0.18 - 0.26;
          const zOffset = Math.floor(index / 4) * 0.16 - 0.24;
          const placement = [((zone.x - 0.5) * 9.2) + xOffset, 0.26 + (index % 2) * 0.24, ((zone.y - 0.5) * 6.8) + zOffset];
          return (
            <FoodBlock
              key={item.id}
              position={placement}
              color={item.food.color}
              label={item.food.name}
              risk={item.risk}
            />
          );
        })}

        <mesh position={[0, 3.1, -3.9]}>
          <boxGeometry args={[1.4, 0.4, 0.3]} />
          <meshStandardMaterial color="#94a3b8" emissive="#94a3b8" emissiveIntensity={0.15} />
        </mesh>
      </Canvas>
    </div>
  );
}
