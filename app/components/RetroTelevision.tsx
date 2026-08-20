"use client";

import { Html, RoundedBox, useCursor, useTexture } from "@react-three/drei";
import { type ThreeEvent, useFrame } from "@react-three/fiber";
import gsap from "gsap";
import { AdditiveBlending, DataTexture, DoubleSide, Group, MeshBasicMaterial, PointLight, Quaternion, RepeatWrapping, RGBAFormat, Shape, SRGBColorSpace, Vector3 } from "three";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { TV_PROGRAMS } from "../lib/tv-programs";

type RetroTelevisionProps = {
  channel: number;
  powered: boolean;
  onChannelChange: () => void;
  onPowerToggle: () => void;
};

type RodProps = {
  start: [number, number, number];
  end: [number, number, number];
  radius?: number;
  color?: string;
};

type KnobProps = {
  position: [number, number, number];
  turn: number;
  active?: boolean;
  label: string;
  symbol: "tooth" | "tree";
  onActivate: () => void;
};

const KNOB_JEWELS = Array.from({ length: 12 }, (_, index) => {
  const angle = (index / 12) * Math.PI * 2;
  return [Math.cos(angle) * 0.44, Math.sin(angle) * 0.44] as const;
});

const DECORATIVE_STAR_POSITIONS: Array<[number, number, number, number]> = [
  [2.42, 1.9, 1.43, 0.16],
  [3.68, 1.91, 1.43, 0.13],
  [2.4, 1.0, 1.43, 0.12],
  [3.7, 0.98, 1.43, 0.15],
  [2.4, -1.32, 1.43, 0.12],
  [3.7, -1.3, 1.43, 0.13],
  [2.42, -2.12, 1.43, 0.15],
  [3.67, -2.14, 1.43, 0.17],
];

const DECORATIVE_STUDS: Array<[number, number]> = [
  [2.74, 2.04], [3.33, 2.06], [2.28, 1.46], [3.79, 1.48],
  [2.27, -1.72], [3.79, -1.69], [2.74, -2.26], [3.31, -2.28],
];

const BRAND_DEPTH_LAYERS = Array.from({ length: 8 }, (_, index) => {
  const progress = index / 7;
  return {
    position: [0.034 * (1 - progress), -0.028 * (1 - progress), index * 0.013] as [number, number, number],
    color: index < 3 ? "#7c3d1d" : "#b66b34",
  };
});

const BRAND_TEXTURE_CROP = {
  offsetX: 581 / 3824,
  offsetY: 1 - 1355 / 2144,
  repeatX: (3361 - 581) / 3824,
  repeatY: (1355 - 697) / 2144,
};

const TOOTH_INACTIVE_TEXTURE_CROP = {
  offsetX: 1133 / 3824,
  offsetY: 1 - 1803 / 2144,
  repeatX: (2776 - 1133) / 3824,
  repeatY: (1803 - 173) / 2144,
};

const TOOTH_ACTIVE_TEXTURE_CROP = {
  offsetX: 42 / 1736,
  offsetY: 1 - 1656 / 1688,
  repeatX: (1687 - 42) / 1736,
  repeatY: (1656 - 30) / 1688,
};

function useEnamelTexture() {
  const texture = useMemo(() => {
    const size = 128;
    const data = new Uint8Array(size * size * 4);
    let seed = 1957;

    for (let index = 0; index < size * size; index += 1) {
      seed = (seed * 16807) % 2147483647;
      const grain = 196 + Math.floor((seed / 2147483647) * 55);
      const offset = index * 4;
      data[offset] = grain;
      data[offset + 1] = grain;
      data[offset + 2] = grain;
      data[offset + 3] = 255;
    }

    const nextTexture = new DataTexture(data, size, size, RGBAFormat);
    nextTexture.wrapS = RepeatWrapping;
    nextTexture.wrapT = RepeatWrapping;
    nextTexture.repeat.set(5, 3);
    nextTexture.needsUpdate = true;
    return nextTexture;
  }, []);

  useEffect(() => {
    return () => texture.dispose();
  }, [texture]);

  return texture;
}

function useGlowTexture() {
  const texture = useMemo(() => {
    const size = 96;
    const data = new Uint8Array(size * size * 4);

    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const normalizedX = (x / (size - 1)) * 2 - 1;
        const normalizedY = (y / (size - 1)) * 2 - 1;
        const falloff = Math.max(0, 1 - Math.sqrt(normalizedX ** 2 + normalizedY ** 2));
        const offset = (y * size + x) * 4;
        data[offset] = 255;
        data[offset + 1] = 190;
        data[offset + 2] = 112;
        data[offset + 3] = Math.floor(falloff ** 2.2 * 220);
      }
    }

    const nextTexture = new DataTexture(data, size, size, RGBAFormat);
    nextTexture.needsUpdate = true;
    return nextTexture;
  }, []);

  useEffect(() => {
    return () => texture.dispose();
  }, [texture]);

  return texture;
}

function ExtrudedBrandLogo() {
  const sourceTexture = useTexture("/wondervision-logo.png");
  const logoTexture = useMemo(() => {
    const nextTexture = sourceTexture.clone();
    nextTexture.colorSpace = SRGBColorSpace;
    nextTexture.offset.set(BRAND_TEXTURE_CROP.offsetX, BRAND_TEXTURE_CROP.offsetY);
    nextTexture.repeat.set(BRAND_TEXTURE_CROP.repeatX, BRAND_TEXTURE_CROP.repeatY);
    nextTexture.anisotropy = 8;
    nextTexture.needsUpdate = true;
    return nextTexture;
  }, [sourceTexture]);

  useEffect(() => {
    return () => logoTexture.dispose();
  }, [logoTexture]);

  return (
    <group position={[3.03, 0.42, 1.31]}>
      {BRAND_DEPTH_LAYERS.map((layer, index) => (
        <mesh key={index} position={layer.position} castShadow>
          <planeGeometry args={[1.43, 0.338]} />
          <meshBasicMaterial
            map={logoTexture}
            color={layer.color}
            transparent
            alphaTest={0.12}
            toneMapped={false}
          />
        </mesh>
      ))}
      <mesh position={[0, 0, 0.117]} castShadow>
        <planeGeometry args={[1.43, 0.338]} />
        <meshBasicMaterial
          map={logoTexture}
          color="#fff8ea"
          transparent
          alphaTest={0.05}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function TelevisionScreen({ channel, powered }: { channel: number; powered: boolean }) {
  const program = TV_PROGRAMS[channel];
  const screenStyle = {
    "--screen-a": program.palette[0],
    "--screen-b": program.palette[1],
    "--screen-accent": program.palette[2],
  } as CSSProperties;

  return (
    <Html transform center position={[-1.02, 0.08, 1.5]} scale={0.315} className="screenMount">
      <div className={`threeScreen ${powered ? "isOn" : "isOff"}`} style={screenStyle}>
        <div className="threeScanlines" />
        <div className="threeReflection" />
        <div className="threeBroadcast" key={`${channel}-${powered}`}>
          <div className="threeStation"><b>WV</b><span>CH {program.number}</span></div>
          <div className="threeProgram">
            <small>{program.eyebrow}</small>
            <h1>{program.title}</h1>
            <p>{program.tagline}</p>
            <span className="threeAction">{program.action}</span>
          </div>
          <span className="threeSignal">LIVE · COLOR</span>
        </div>
        <div className="threeStandby"><i />Wondervision</div>
      </div>
    </Html>
  );
}

function Rod({ start, end, radius = 0.045, color = "#d88e4d" }: RodProps) {
  const transform = useMemo(() => {
    const startVector = new Vector3(...start);
    const endVector = new Vector3(...end);
    const direction = endVector.clone().sub(startVector);
    const midpoint = startVector.clone().add(endVector).multiplyScalar(0.5);
    const quaternion = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction.clone().normalize());
    return { midpoint, quaternion, length: direction.length() };
  }, [end, start]);

  return (
    <mesh position={transform.midpoint} quaternion={transform.quaternion} castShadow>
      <cylinderGeometry args={[radius, radius, transform.length, 18]} />
      <meshStandardMaterial color={color} emissive="#54200d" emissiveIntensity={0.12} metalness={0.7} roughness={0.18} />
    </mesh>
  );
}

function Starburst({ active }: { active: boolean }) {
  const glowTexture = useGlowTexture();
  const halo = useRef<Group>(null);
  const antennaLight = useRef<PointLight>(null);
  const rays = useMemo(
    () =>
      Array.from({ length: 8 }, (_, index) => {
        const angle = (index / 8) * Math.PI * 2;
        const length = index % 2 === 0 ? 0.6 : 0.38;
        return {
          start: [0, 4.2, 0] as [number, number, number],
          end: [Math.cos(angle) * length, 4.2 + Math.sin(angle) * length, 0] as [number, number, number],
        };
      }),
    [],
  );

  useFrame((state) => {
    const pulse = (Math.sin(state.clock.elapsedTime * 2.2) + 1) / 2;
    if (halo.current) {
      const scale = active ? 0.96 + pulse * 0.12 : 0.68;
      halo.current.scale.setScalar(scale);
    }
    if (antennaLight.current) {
      antennaLight.current.intensity = active ? 22 + pulse * 8 : 1.4;
    }
  });

  return (
    <group position={[0.2, 0, 0]}>
      {rays.map((ray, index) => (
        <Rod key={index} start={ray.start} end={ray.end} radius={index % 2 === 0 ? 0.028 : 0.02} color="#e7a15c" />
      ))}
      <mesh position={[0, 4.2, 0]}>
        <sphereGeometry args={[0.11, 24, 24]} />
        <meshStandardMaterial color="#ffe2a5" emissive="#ff9141" emissiveIntensity={active ? 2.2 : 0.45} metalness={0.46} roughness={0.08} />
      </mesh>
      <group ref={halo}>
        <mesh position={[0, 4.2, -0.03]} scale={active ? 1.8 : 1.25}>
          <sphereGeometry args={[0.18, 24, 24]} />
          <meshBasicMaterial color="#ffb66d" transparent opacity={active ? 0.13 : 0.035} depthWrite={false} />
        </mesh>
        <sprite position={[0, 4.2, -0.08]} scale={active ? [1.45, 1.45, 1] : [0.62, 0.62, 1]}>
          <spriteMaterial
            map={glowTexture}
            color="#ffb76d"
            transparent
            opacity={active ? 0.2 : 0.045}
            depthWrite={false}
            blending={AdditiveBlending}
          />
        </sprite>
        <sprite position={[0, 4.2, -0.1]} scale={active ? [2.25, 2.25, 1] : [0.9, 0.9, 1]}>
          <spriteMaterial
            map={glowTexture}
            color="#ff9f50"
            transparent
            opacity={active ? 0.07 : 0.012}
            depthWrite={false}
            blending={AdditiveBlending}
          />
        </sprite>
      </group>
      <pointLight
        ref={antennaLight}
        position={[0, 4.2, 0.45]}
        color="#ffb15f"
        intensity={active ? 26 : 1.4}
        distance={7}
        decay={2}
      />
    </group>
  );
}

function TexturedToothFace({
  visible,
  textureUrl,
  crop,
  size,
  positionZ,
  renderOrder,
}: {
  visible: boolean;
  textureUrl: string;
  crop: typeof TOOTH_INACTIVE_TEXTURE_CROP;
  size: [number, number];
  positionZ: number;
  renderOrder: number;
}) {
  const sourceTexture = useTexture(textureUrl);
  const faceTexture = useMemo(() => {
    const nextTexture = sourceTexture.clone();
    nextTexture.colorSpace = SRGBColorSpace;
    nextTexture.offset.set(crop.offsetX, crop.offsetY);
    nextTexture.repeat.set(crop.repeatX, crop.repeatY);
    nextTexture.anisotropy = 8;
    nextTexture.needsUpdate = true;
    return nextTexture;
  }, [crop, sourceTexture]);
  const material = useRef<MeshBasicMaterial>(null);
  const initialVisibility = useRef(visible);

  useEffect(() => {
    return () => faceTexture.dispose();
  }, [faceTexture]);

  useLayoutEffect(() => {
    if (!material.current) return;
    const fade = gsap.to(material.current, {
      opacity: visible ? 1 : 0,
      duration: visible ? 0.28 : 0.16,
      ease: "power2.out",
    });
    return () => {
      fade.kill();
    };
  }, [visible]);

  return (
    <mesh position={[0, 0, positionZ]} renderOrder={renderOrder} castShadow>
      <planeGeometry args={size} />
      <meshBasicMaterial
        ref={material}
        map={faceTexture}
        transparent
        opacity={initialVisibility.current ? 1 : 0}
        alphaTest={0.04}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function KnobEmblem({ symbol, active }: { symbol: KnobProps["symbol"]; active: boolean }) {
  const shape = useMemo(() => {
    const nextShape = new Shape();

    if (symbol === "tooth") {
      nextShape.moveTo(-0.3, 0.35);
      nextShape.bezierCurveTo(-0.48, 0.23, -0.45, -0.02, -0.34, -0.16);
      nextShape.bezierCurveTo(-0.24, -0.3, -0.26, -0.53, -0.13, -0.53);
      nextShape.bezierCurveTo(-0.02, -0.53, -0.05, -0.25, 0.06, -0.22);
      nextShape.bezierCurveTo(0.18, -0.25, 0.16, -0.53, 0.28, -0.53);
      nextShape.bezierCurveTo(0.42, -0.51, 0.37, -0.27, 0.43, -0.1);
      nextShape.bezierCurveTo(0.5, 0.12, 0.45, 0.33, 0.3, 0.4);
      nextShape.bezierCurveTo(0.16, 0.46, 0.05, 0.34, 0, 0.34);
      nextShape.bezierCurveTo(-0.08, 0.35, -0.16, 0.47, -0.3, 0.35);
    } else {
      nextShape.moveTo(0, 0.54);
      nextShape.lineTo(-0.2, 0.2);
      nextShape.lineTo(-0.09, 0.2);
      nextShape.lineTo(-0.33, -0.12);
      nextShape.lineTo(-0.16, -0.12);
      nextShape.lineTo(-0.42, -0.42);
      nextShape.lineTo(-0.1, -0.42);
      nextShape.lineTo(-0.1, -0.58);
      nextShape.lineTo(0.1, -0.58);
      nextShape.lineTo(0.1, -0.42);
      nextShape.lineTo(0.42, -0.42);
      nextShape.lineTo(0.16, -0.12);
      nextShape.lineTo(0.33, -0.12);
      nextShape.lineTo(0.09, 0.2);
      nextShape.lineTo(0.2, 0.2);
      nextShape.closePath();
    }

    return nextShape;
  }, [symbol]);

  return (
    <group position={[0, 0, 0.39]} scale={symbol === "tooth" ? 0.5 : 0.43}>
      <mesh position={[0, 0, -0.012]} scale={1.16}>
        <shapeGeometry args={[shape, 12]} />
        <meshStandardMaterial color="#713819" emissive="#321005" emissiveIntensity={0.12} roughness={0.3} side={DoubleSide} />
      </mesh>
      <mesh castShadow>
        <shapeGeometry args={[shape, 12]} />
        <meshPhysicalMaterial
          color={active ? "#fff7d8" : "#8b7456"}
          emissive={active ? "#e8a25b" : "#000000"}
          emissiveIntensity={active ? 0.3 : 0}
          metalness={0.18}
          roughness={0.18}
          clearcoat={1}
          side={DoubleSide}
        />
      </mesh>
    </group>
  );
}

function CrystalKnob({ position, turn, active = true, label, symbol, onActivate }: KnobProps) {
  const group = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const engagementTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toothEngaged = symbol === "tooth" && (hovered || engaged);
  useCursor(hovered);

  useEffect(() => {
    return () => {
      if (engagementTimer.current) clearTimeout(engagementTimer.current);
    };
  }, []);

  useLayoutEffect(() => {
    if (!group.current) return;
    const tween = gsap.to(group.current.rotation, {
      z: turn,
      duration: 0.62,
      ease: "back.out(2.4)",
    });
    return () => {
      tween.kill();
    };
  }, [turn]);

  function activate(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    trigger();
  }

  function trigger() {
    if (!group.current) return;
    if (symbol === "tooth") {
      setEngaged(true);
      if (engagementTimer.current) clearTimeout(engagementTimer.current);
      engagementTimer.current = setTimeout(() => setEngaged(false), 720);
    }
    const press = gsap.timeline();
    press.to(group.current.scale, { x: 0.9, y: 0.9, z: 0.9, duration: 0.09 });
    press.to(group.current.scale, { x: 1, y: 1, z: 1, duration: 0.28, ease: "back.out(3)" });
    onActivate();
  }

  return (
    <group
      ref={group}
      position={position}
      onClick={activate}
      onPointerEnter={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      userData={{ label }}
    >
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.55, 0.25, 64]} />
        <meshPhysicalMaterial color="#d98a4e" emissive="#54200d" emissiveIntensity={0.1} metalness={0.68} roughness={0.2} clearcoat={1} clearcoatRoughness={0.08} />
      </mesh>
      <mesh position={[0, 0, 0.14]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.4, 0.2, 12]} />
        <meshPhysicalMaterial
          color={active ? "#c78350" : "#5f4835"}
          emissive={active ? "#6e2a14" : "#000000"}
          emissiveIntensity={active ? 0.16 : 0}
          metalness={0.32}
          roughness={0.12}
          transmission={0.18}
          thickness={0.65}
          clearcoat={1}
        />
      </mesh>
      <mesh position={[0, 0.31, 0.29]}>
        <sphereGeometry args={[0.055, 20, 20]} />
        <meshStandardMaterial color="#fff0be" emissive="#ec9b55" emissiveIntensity={active ? 0.9 : 0.12} />
      </mesh>
      <mesh position={[0, 0, 0.255]}>
        <torusGeometry args={[0.405, 0.055, 18, 64]} />
        <meshPhysicalMaterial color="#f0a75d" metalness={0.72} roughness={0.16} clearcoat={1} />
      </mesh>
      {KNOB_JEWELS.map(([x, y], index) => (
          <mesh key={index} position={[x, y, 0.31]} scale={[1, 1, 0.45]}>
            <octahedronGeometry args={[0.062, 0]} />
            <meshPhysicalMaterial color="#ffe3b1" metalness={0.36} roughness={0.08} transmission={0.24} clearcoat={1} />
          </mesh>
      ))}
      <KnobEmblem symbol={symbol} active={active} />
      {symbol === "tooth" ? (
        <>
          <TexturedToothFace
            visible={!toothEngaged}
            textureUrl="/tooth-knob-inactive.png"
            crop={TOOTH_INACTIVE_TEXTURE_CROP}
            size={[1.08, 1.071]}
            positionZ={0.43}
            renderOrder={4}
          />
          <TexturedToothFace
            visible={toothEngaged}
            textureUrl="/tooth-knob-active.png"
            crop={TOOTH_ACTIVE_TEXTURE_CROP}
            size={[1.08, 1.068]}
            positionZ={0.435}
            renderOrder={5}
          />
        </>
      ) : null}
      {hovered ? (
        <pointLight position={[0, 0, 0.8]} color="#ffd39a" intensity={2.2} distance={2.5} />
      ) : null}
      <Html transform center position={[0, 0, 0.34]} scale={0.34} className="meshKnobMount">
        <button
          type="button"
          className="meshKnobHit"
          aria-label={label}
          onPointerDown={(event) => event.stopPropagation()}
          onFocus={() => setHovered(true)}
          onBlur={() => setHovered(false)}
          onClick={(event) => {
            event.stopPropagation();
            trigger();
          }}
        />
      </Html>
    </group>
  );
}

function SpeakerGrille() {
  return (
    <group position={[3.03, -0.27, 1.39]}>
      {Array.from({ length: 8 }, (_, index) => (
        <RoundedBox key={index} args={[1.32, 0.07, 0.08]} radius={0.035} smoothness={4} position={[0, -index * 0.13, 0]} castShadow>
          <meshPhysicalMaterial color="#9c5125" emissive="#3a1608" emissiveIntensity={0.08} metalness={0.48} roughness={0.31} clearcoat={0.55} />
        </RoundedBox>
      ))}
      <RoundedBox args={[0.035, 0.91, 0.085]} radius={0.017} smoothness={3} position={[0, -0.455, 0.025]}>
        <meshStandardMaterial color="#c97838" metalness={0.6} roughness={0.25} />
      </RoundedBox>
    </group>
  );
}

function DecorativeStars() {
  return (
    <group>
      {DECORATIVE_STAR_POSITIONS.map(([x, y, z, size], index) => (
        <group key={index} position={[x, y, z]} rotation={[0, 0, index * 0.42]}>
          <RoundedBox args={[size * 2.7, 0.025, 0.025]} radius={0.01} smoothness={2}>
            <meshStandardMaterial color="#d99a56" emissive="#5a260f" emissiveIntensity={0.12} metalness={0.68} roughness={0.22} />
          </RoundedBox>
          <RoundedBox args={[0.025, size * 2.7, 0.025]} radius={0.01} smoothness={2}>
            <meshStandardMaterial color="#d99a56" emissive="#5a260f" emissiveIntensity={0.12} metalness={0.68} roughness={0.22} />
          </RoundedBox>
          <mesh position={[0, 0, 0.035]}>
            <sphereGeometry args={[0.035, 16, 16]} />
            <meshStandardMaterial color="#ffe0a6" emissive="#b85f2f" emissiveIntensity={0.3} metalness={0.55} roughness={0.16} />
          </mesh>
        </group>
      ))}
      {DECORATIVE_STUDS.map(([x, y], index) => (
        <mesh key={`stud-${index}`} position={[x, y, 1.46]}>
          <sphereGeometry args={[0.035, 14, 14]} />
          <meshPhysicalMaterial color="#edb26c" metalness={0.78} roughness={0.15} clearcoat={1} />
        </mesh>
      ))}
    </group>
  );
}

export function RetroTelevision({ channel, powered, onChannelChange, onPowerToggle }: RetroTelevisionProps) {
  const model = useRef<Group>(null);
  const floating = useRef<Group>(null);
  const enamelTexture = useEnamelTexture();

  useLayoutEffect(() => {
    const current = model.current;
    if (!current) return;
    const context = gsap.context(() => {
      gsap.fromTo(
        current.scale,
        { x: 0.68, y: 0.68, z: 0.68 },
        { x: 1, y: 1, z: 1, duration: 1.5, ease: "elastic.out(1, .7)" },
      );
      gsap.fromTo(current.rotation, { y: -0.55, x: 0.12 }, { y: 0, x: 0, duration: 1.45, ease: "power3.out" });
    }, model);
    return () => context.revert();
  }, []);

  useFrame((state) => {
    if (!floating.current) return;
    floating.current.position.y = Math.sin(state.clock.elapsedTime * 0.72) * 0.035;
  });

  return (
    <group ref={model} dispose={null}>
      <group ref={floating}>
        <RoundedBox args={[8.48, 5.4, 1.9]} radius={0.62} smoothness={10} position={[0, -0.02, -0.04]} castShadow receiveShadow>
          <meshPhysicalMaterial
            color="#dfa956"
            metalness={0.2}
            roughness={0.34}
            roughnessMap={enamelTexture}
            bumpMap={enamelTexture}
            bumpScale={0.018}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </RoundedBox>

        <RoundedBox args={[8.12, 5.08, 1.82]} radius={0.52} smoothness={10} position={[0, 0, 0.08]}>
          <meshPhysicalMaterial
            color="#f0c97b"
            metalness={0.11}
            roughness={0.32}
            roughnessMap={enamelTexture}
            bumpMap={enamelTexture}
            bumpScale={0.012}
            clearcoat={0.92}
            clearcoatRoughness={0.13}
          />
        </RoundedBox>

        <RoundedBox args={[6.12, 4.62, 0.26]} radius={0.49} smoothness={10} position={[-1.02, 0.08, 1.06]} castShadow>
          <meshPhysicalMaterial color="#d38147" emissive="#4c1d0a" emissiveIntensity={0.11} metalness={0.7} roughness={0.2} clearcoat={1} />
        </RoundedBox>
        <RoundedBox args={[5.93, 4.43, 0.28]} radius={0.43} smoothness={10} position={[-1.02, 0.08, 1.18]}>
          <meshPhysicalMaterial color="#f6d99b" metalness={0.14} roughness={0.23} clearcoat={0.9} />
        </RoundedBox>
        <RoundedBox args={[5.66, 4.16, 0.17]} radius={0.38} smoothness={10} position={[-1.02, 0.08, 1.33]}>
          <meshPhysicalMaterial color="#c76f3a" emissive="#4c1b08" emissiveIntensity={0.1} metalness={0.64} roughness={0.22} clearcoat={1} />
        </RoundedBox>
        <RoundedBox args={[5.52, 4.02, 0.13]} radius={0.35} smoothness={10} position={[-1.02, 0.08, 1.4]}>
          <meshPhysicalMaterial color="#f8dda4" metalness={0.1} roughness={0.2} clearcoat={1} />
        </RoundedBox>
        <TelevisionScreen channel={channel} powered={powered} />

        <RoundedBox args={[1.68, 4.62, 0.24]} radius={0.28} smoothness={8} position={[3.04, 0.03, 1.17]}>
          <meshPhysicalMaterial
            color="#eac174"
            metalness={0.12}
            roughness={0.34}
            roughnessMap={enamelTexture}
            bumpMap={enamelTexture}
            bumpScale={0.012}
            clearcoat={0.84}
          />
        </RoundedBox>

        <CrystalKnob
          position={[3.04, 1.45, 1.43]}
          turn={channel * 2.1}
          label="Change channel"
          symbol="tooth"
          onActivate={onChannelChange}
        />
        <CrystalKnob
          position={[3.04, -1.75, 1.43]}
          turn={powered ? 0 : -0.72}
          active={powered}
          label="Power"
          symbol="tree"
          onActivate={onPowerToggle}
        />
        <SpeakerGrille />
        <DecorativeStars />

        <ExtrudedBrandLogo />

        <mesh position={[-3.15, -3.0, 0.1]} rotation={[0.03, 0, -0.18]} castShadow>
          <cylinderGeometry args={[0.14, 0.29, 1.08, 32]} />
          <meshPhysicalMaterial color="#ad743d" metalness={0.42} roughness={0.25} clearcoat={0.72} />
        </mesh>
        <mesh position={[3.15, -3.0, 0.1]} rotation={[0.03, 0, 0.18]} castShadow>
          <cylinderGeometry args={[0.14, 0.29, 1.08, 32]} />
          <meshPhysicalMaterial color="#ad743d" metalness={0.42} roughness={0.25} clearcoat={0.72} />
        </mesh>

        <mesh position={[0.2, 2.83, 0]} scale={[1.3, 0.48, 0.85]} castShadow>
          <sphereGeometry args={[0.58, 48, 32]} />
          <meshPhysicalMaterial color="#cf8148" emissive="#471b0a" emissiveIntensity={0.08} metalness={0.66} roughness={0.2} clearcoat={1} />
        </mesh>
        <Rod start={[0.2, 3.02, 0]} end={[-1.05, 3.78, 0]} radius={0.055} />
        <Rod start={[0.2, 3.02, 0]} end={[1.45, 3.82, 0]} radius={0.055} />
        <Rod start={[0.2, 3.02, 0]} end={[0.2, 4.18, 0]} radius={0.045} />
        <mesh position={[-1.05, 3.78, 0]}>
          <sphereGeometry args={[0.12, 28, 28]} />
          <meshPhysicalMaterial color="#f0ad67" emissive="#8d421d" emissiveIntensity={0.2} metalness={0.64} roughness={0.12} clearcoat={1} />
        </mesh>
        <mesh position={[1.45, 3.82, 0]}>
          <sphereGeometry args={[0.12, 28, 28]} />
          <meshPhysicalMaterial color="#f0ad67" emissive="#8d421d" emissiveIntensity={0.2} metalness={0.64} roughness={0.12} clearcoat={1} />
        </mesh>
        <Starburst active={powered} />

        <pointLight position={[-1, 0.3, 2.5]} color={powered ? "#7af0dc" : "#452d24"} intensity={powered ? 1.4 : 0.15} distance={7} />
      </group>
    </group>
  );
}
