"use client";

import { Html, RoundedBox, useCursor } from "@react-three/drei";
import { type ThreeEvent, useFrame } from "@react-three/fiber";
import gsap from "gsap";
import { Group, Quaternion, Vector3 } from "three";
import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
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
  onActivate: () => void;
};

function BrandPlate() {
  return (
    <Html transform center position={[3.03, 0.42, 1.43]} scale={0.11} className="brandMount">
      <div className="threeBrand">Wondervision</div>
    </Html>
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
    <Html transform center position={[-1.02, 0.08, 1.43]} scale={0.34} className="screenMount">
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

function Rod({ start, end, radius = 0.045, color = "#b96f39" }: RodProps) {
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
      <meshStandardMaterial color={color} metalness={0.92} roughness={0.17} />
    </mesh>
  );
}

function Starburst() {
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

  return (
    <group position={[0.2, 0, 0]}>
      {rays.map((ray, index) => (
        <Rod key={index} start={ray.start} end={ray.end} radius={index % 2 === 0 ? 0.028 : 0.02} color="#e7a15c" />
      ))}
      <mesh position={[0, 4.2, 0]}>
        <sphereGeometry args={[0.1, 24, 24]} />
        <meshStandardMaterial color="#ffe0a5" emissive="#d98846" emissiveIntensity={0.9} metalness={0.7} roughness={0.12} />
      </mesh>
    </group>
  );
}

function CrystalKnob({ position, turn, active = true, label, onActivate }: KnobProps) {
  const group = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

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
        <cylinderGeometry args={[0.5, 0.56, 0.24, 64]} />
        <meshPhysicalMaterial color="#b96d38" metalness={0.88} roughness={0.14} clearcoat={1} clearcoatRoughness={0.08} />
      </mesh>
      <mesh position={[0, 0, 0.14]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.36, 0.4, 0.19, 12]} />
        <meshPhysicalMaterial
          color={active ? "#fff0c8" : "#6e5439"}
          emissive={active ? "#d78445" : "#000000"}
          emissiveIntensity={active ? 0.28 : 0}
          metalness={0.25}
          roughness={0.08}
          transmission={0.32}
          thickness={0.8}
          clearcoat={1}
        />
      </mesh>
      <mesh position={[0, 0.31, 0.29]}>
        <sphereGeometry args={[0.055, 20, 20]} />
        <meshStandardMaterial color="#fff0be" emissive="#ec9b55" emissiveIntensity={active ? 0.9 : 0.12} />
      </mesh>
      <mesh position={[0, 0, 0.255]}>
        <torusGeometry args={[0.4, 0.045, 18, 64]} />
        <meshPhysicalMaterial color="#f4bd73" metalness={0.85} roughness={0.1} clearcoat={1} />
      </mesh>
      {hovered && (
        <pointLight position={[0, 0, 0.8]} color="#ffd39a" intensity={2.2} distance={2.5} />
      )}
      <Html transform center position={[0, 0, 0.34]} scale={0.34} className="meshKnobMount">
        <button
          type="button"
          className="meshKnobHit"
          aria-label={label}
          onPointerDown={(event) => event.stopPropagation()}
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
    <group position={[3.03, -0.32, 1.19]}>
      {Array.from({ length: 8 }, (_, index) => (
        <RoundedBox key={index} args={[1.28, 0.085, 0.075]} radius={0.04} smoothness={3} position={[0, -index * 0.17, 0]}>
          <meshStandardMaterial color="#8c4a25" metalness={0.55} roughness={0.35} />
        </RoundedBox>
      ))}
    </group>
  );
}

function DecorativeStars() {
  const positions: Array<[number, number, number, number]> = [
    [2.45, 1.85, 1.2, 0.18],
    [3.62, 1.86, 1.2, 0.14],
    [2.43, 0.83, 1.2, 0.12],
    [3.65, 0.8, 1.2, 0.16],
    [2.47, -2.1, 1.2, 0.14],
    [3.62, -2.08, 1.2, 0.18],
  ];

  return (
    <group>
      {positions.map(([x, y, z, size], index) => (
        <group key={index} position={[x, y, z]} rotation={[0, 0, index * 0.42]}>
          <RoundedBox args={[size * 2.7, 0.025, 0.025]} radius={0.01} smoothness={2}>
            <meshStandardMaterial color="#b9783f" metalness={0.75} roughness={0.25} />
          </RoundedBox>
          <RoundedBox args={[0.025, size * 2.7, 0.025]} radius={0.01} smoothness={2}>
            <meshStandardMaterial color="#b9783f" metalness={0.75} roughness={0.25} />
          </RoundedBox>
        </group>
      ))}
    </group>
  );
}

export function RetroTelevision({ channel, powered, onChannelChange, onPowerToggle }: RetroTelevisionProps) {
  const model = useRef<Group>(null);
  const floating = useRef<Group>(null);

  useLayoutEffect(() => {
    if (!model.current) return;
    const context = gsap.context(() => {
      gsap.fromTo(
        model.current!.scale,
        { x: 0.68, y: 0.68, z: 0.68 },
        { x: 1, y: 1, z: 1, duration: 1.5, ease: "elastic.out(1, .7)" },
      );
      gsap.fromTo(model.current!.rotation, { y: -0.55, x: 0.12 }, { y: 0, x: 0, duration: 1.45, ease: "power3.out" });
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
        <RoundedBox args={[8.4, 5.35, 1.8]} radius={0.55} smoothness={8} castShadow receiveShadow>
          <meshPhysicalMaterial color="#d8a85a" metalness={0.36} roughness={0.23} clearcoat={1} clearcoatRoughness={0.12} />
        </RoundedBox>

        <RoundedBox args={[8.05, 5.02, 1.84]} radius={0.49} smoothness={8} position={[0, 0, 0.03]}>
          <meshStandardMaterial color="#e9bd70" metalness={0.28} roughness={0.29} />
        </RoundedBox>

        <RoundedBox args={[5.9, 4.45, 0.32]} radius={0.45} smoothness={8} position={[-1.02, 0.08, 1.0]} castShadow>
          <meshPhysicalMaterial color="#9e572c" metalness={0.92} roughness={0.13} clearcoat={1} />
        </RoundedBox>
        <RoundedBox args={[5.66, 4.2, 0.35]} radius={0.39} smoothness={8} position={[-1.02, 0.08, 1.11]}>
          <meshStandardMaterial color="#f0cf8d" metalness={0.34} roughness={0.22} />
        </RoundedBox>
        <TelevisionScreen channel={channel} powered={powered} />

        <RoundedBox args={[1.62, 4.58, 0.2]} radius={0.25} smoothness={6} position={[3.02, 0.03, 1.01]}>
          <meshStandardMaterial color="#e9b96d" metalness={0.27} roughness={0.28} />
        </RoundedBox>

        <CrystalKnob
          position={[3.03, 1.43, 1.25]}
          turn={channel * 2.1}
          label="Change channel"
          onActivate={onChannelChange}
        />
        <CrystalKnob
          position={[3.03, -1.72, 1.25]}
          turn={powered ? 0.45 : -0.7}
          active={powered}
          label="Power"
          onActivate={onPowerToggle}
        />
        <SpeakerGrille />
        <DecorativeStars />

        <BrandPlate />

        <mesh position={[-2.95, -3.02, 0.16]} rotation={[0.03, 0, -0.2]} castShadow>
          <cylinderGeometry args={[0.22, 0.38, 1.16, 28]} />
          <meshStandardMaterial color="#9b663a" metalness={0.45} roughness={0.28} />
        </mesh>
        <mesh position={[2.95, -3.02, 0.16]} rotation={[0.03, 0, 0.2]} castShadow>
          <cylinderGeometry args={[0.22, 0.38, 1.16, 28]} />
          <meshStandardMaterial color="#9b663a" metalness={0.45} roughness={0.28} />
        </mesh>

        <mesh position={[0.2, 2.83, 0]} scale={[1.3, 0.48, 0.85]} castShadow>
          <sphereGeometry args={[0.58, 48, 32]} />
          <meshPhysicalMaterial color="#b76f3b" metalness={0.9} roughness={0.16} clearcoat={1} />
        </mesh>
        <Rod start={[0.2, 3.02, 0]} end={[-1.05, 3.78, 0]} radius={0.055} />
        <Rod start={[0.2, 3.02, 0]} end={[1.45, 3.82, 0]} radius={0.055} />
        <Rod start={[0.2, 3.02, 0]} end={[0.2, 4.18, 0]} radius={0.045} />
        <mesh position={[-1.05, 3.78, 0]}>
          <sphereGeometry args={[0.12, 28, 28]} />
          <meshPhysicalMaterial color="#e8a25d" metalness={0.9} roughness={0.12} clearcoat={1} />
        </mesh>
        <mesh position={[1.45, 3.82, 0]}>
          <sphereGeometry args={[0.12, 28, 28]} />
          <meshPhysicalMaterial color="#e8a25d" metalness={0.9} roughness={0.12} clearcoat={1} />
        </mesh>
        <Starburst />

        <pointLight position={[-1, 0.3, 2.5]} color={powered ? "#7af0dc" : "#452d24"} intensity={powered ? 1.4 : 0.15} distance={7} />
      </group>
    </group>
  );
}
