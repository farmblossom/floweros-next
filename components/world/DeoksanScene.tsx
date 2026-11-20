"use client";
import { Sky, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import WorldHotspot from "./WorldHotspot";
import CharacterSprite from "./CharacterSprite";

// 쑤담이 순찰 경로 — 감자밭 중앙 농로 · 고랑 사이
const SSUDAMI_WAYPOINTS: [number, number, number][] = [
  [0, 0, 10.5],
  [0, 0, 5],
  [0, 0, 0],
  [-3.6, 0, -3],
  [0, 0, -6],
  [3.6, 0, -3],
  [0, 0, 0],
  [0, 0, 10.5],
];

const SSUDAMI_DIALOG = [
  "안녕하세요! 덕산리 감자밭이에요 🥔",
  "2027년 봄 수미·조풍 품종 봄감자 실증을 준비 중이에요",
  "고랑 A-01~A-40까지 40팀이 각각 담당 구역을 갖게 돼요",
  "감자가 발아하고 꽃이 피는 과정을 함께 지켜봐요!",
  "파란 마커를 클릭하면 현장 정보를 볼 수 있어요 📍",
];

interface DeoksanSceneProps {
  onHotspotSelect: (label: string, info: string) => void;
  walkMode?: boolean;
}

function PotatoRow({ position, length = 18 }: { position: [number, number, number]; length?: number }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[0.75, 0.18, length]} />
        <meshStandardMaterial color="#6b4c20" roughness={0.95} />
      </mesh>
      {Array.from({ length: Math.floor(length / 1.4) }).map((_, i) => (
        <group key={i} position={[0, 0.22, -length / 2 + 0.7 + i * 1.4]}>
          <mesh>
            <sphereGeometry args={[0.14, 6, 6]} />
            <meshStandardMaterial color="#4a7a28" roughness={0.8} />
          </mesh>
          <mesh position={[0.08, 0.1, 0.05]} rotation={[0.3, 0.2, 0.4]}>
            <boxGeometry args={[0.04, 0.22, 0.04]} />
            <meshStandardMaterial color="#5a9030" roughness={0.7} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.5, -length / 2 + 0.4]}>
        <boxGeometry args={[0.6, 0.6, 0.06]} />
        <meshStandardMaterial color="#8B6914" />
      </mesh>
    </group>
  );
}

export default function DeoksanScene({ onHotspotSelect, walkMode = false }: DeoksanSceneProps) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 8, 22]} fov={70} />
      <Sky sunPosition={[80, 60, 20]} turbidity={0.5} rayleigh={0.3} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[20, 30, 10]} intensity={1.4} castShadow />
      <fog attach="fog" args={["#c8e8b0", 40, 90]} />

      {/* 평탄한 감자밭 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[90, 90]} />
        <meshStandardMaterial color="#5d7f3a" roughness={0.95} />
      </mesh>

      {/* 고랑 10개 */}
      {Array.from({ length: 10 }).map((_, i) => (
        <PotatoRow key={i} position={[-8.1 + i * 1.8, 0, 0]} length={18} />
      ))}

      {/* 중앙 농로 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <planeGeometry args={[1.4, 20]} />
        <meshStandardMaterial color="#c8a96e" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-9.8, 0.001, 0]}>
        <planeGeometry args={[1.0, 20]} />
        <meshStandardMaterial color="#c8a96e" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[9.8, 0.001, 0]}>
        <planeGeometry args={[1.0, 20]} />
        <meshStandardMaterial color="#c8a96e" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, -10]}>
        <planeGeometry args={[22, 1.2]} />
        <meshStandardMaterial color="#c8a96e" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 10]}>
        <planeGeometry args={[22, 1.2]} />
        <meshStandardMaterial color="#c8a96e" roughness={0.9} />
      </mesh>

      {/* 경계 나무들 */}
      {([-14, 14] as number[]).flatMap((x) =>
        ([-13, 0, 13] as number[]).map((z, j) => (
          <group key={`tree-${x}-${z}`} position={[x, 0, z]}>
            <mesh position={[0, 1.2, 0]}>
              <cylinderGeometry args={[0.18, 0.28, 2.4]} />
              <meshStandardMaterial color="#5a3a18" roughness={0.9} />
            </mesh>
            <mesh position={[0, 3.0, 0]}>
              <sphereGeometry args={[1.3, 8, 8]} />
              <meshStandardMaterial color="#2a5e1e" roughness={0.85} />
            </mesh>
          </group>
        ))
      )}

      {/* 입구 아치 */}
      <group position={[0, 0, 12]}>
        <mesh position={[-1.5, 1.5, 0]}>
          <boxGeometry args={[0.3, 3, 0.3]} />
          <meshStandardMaterial color="#5a3a18" roughness={0.9} />
        </mesh>
        <mesh position={[1.5, 1.5, 0]}>
          <boxGeometry args={[0.3, 3, 0.3]} />
          <meshStandardMaterial color="#5a3a18" roughness={0.9} />
        </mesh>
        <mesh position={[0, 3.1, 0]}>
          <boxGeometry args={[3.5, 0.3, 0.3]} />
          <meshStandardMaterial color="#5a3a18" roughness={0.9} />
        </mesh>
      </group>

      <WorldHotspot
        position={[0, 0, 11]}
        label="🌾 농장 입구"
        info="밀양 덕산농장 입구입니다. 2027 봄감자 실증 중 (시뮬레이션)"
        onSelect={onHotspotSelect}
      />
      <WorldHotspot
        position={[-3.6, 0, 0]}
        label="🥔 A-02 고랑"
        info="A-02 고랑 — 수미 품종 봄감자 재배 구역 (시뮬레이션 초안)"
        onSelect={onHotspotSelect}
      />
      <WorldHotspot
        position={[3.6, 0, -6]}
        label="📸 현장 관측소"
        info="드론·360° 사진 촬영 주요 거점 (실제 자료 준비 중)"
        onSelect={onHotspotSelect}
      />

      <CharacterSprite
        waypoints={SSUDAMI_WAYPOINTS}
        textureUrl="/assets/brand/ssudami-row.png"
        name="쑤담이"
        dialogLines={SSUDAMI_DIALOG}
        speed={1.1}
        size={[1.3, 1.7]}
      />

      {!walkMode && (
        <OrbitControls
          maxPolarAngle={Math.PI / 2.1}
          minDistance={4}
          maxDistance={35}
          enablePan={true}
          target={[0, 1, 0]}
        />
      )}
    </>
  );
}
