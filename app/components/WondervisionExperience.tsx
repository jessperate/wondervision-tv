"use client";

import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Group, PointLight } from "three";
import { TV_PROGRAMS } from "../lib/tv-programs";
import { RetroTelevision } from "./RetroTelevision";

function ResponsiveCamera() {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);

  useEffect(() => {
    const targetZ = size.width < 620 ? 20.8 : size.width < 980 ? 17.7 : 16.5;
    const tween = gsap.to(camera.position, {
      x: 0,
      y: size.width < 620 ? 0.55 : 0.35,
      z: targetZ,
      duration: 0.8,
      ease: "power3.out",
      onUpdate: () => camera.lookAt(0, 0.25, 0),
    });

    return () => {
      tween.kill();
    };
  }, [camera, size.width]);

  return null;
}

function PointerLight() {
  const light = useRef<PointLight>(null);

  useFrame(({ pointer }) => {
    if (!light.current) return;
    light.current.position.x += (pointer.x * 6 - light.current.position.x) * 0.07;
    light.current.position.y += (pointer.y * 4 + 2 - light.current.position.y) * 0.07;
  });

  return <pointLight ref={light} position={[-4, 4, 7]} color="#ffe6b9" intensity={18} distance={20} decay={2} />;
}

function HorizonSurface() {
  return (
    <mesh
      position={[0, -3.59, 2]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[42, 18]} />
      <meshStandardMaterial
        color="#49aaa4"
        metalness={0.02}
        roughness={0.9}
      />
    </mesh>
  );
}

function Scene({
  channel,
  powered,
  onChannelChange,
  onPowerToggle,
}: {
  channel: number;
  powered: boolean;
  onChannelChange: () => void;
  onPowerToggle: () => void;
}) {
  const scene = useRef<Group>(null);

  useLayoutEffect(() => {
    if (!scene.current) return;
    const intro = gsap.fromTo(
      scene.current.position,
      { y: -0.35 },
      { y: 0, duration: 1.45, ease: "elastic.out(1, 0.65)" },
    );
    return () => {
      intro.kill();
    };
  }, []);

  return (
    <>
      <ResponsiveCamera />
      <ambientLight intensity={1.32} color="#fff2d1" />
      <hemisphereLight args={["#b6fff2", "#6b3b22", 1.35]} />
      <spotLight
        position={[-6, 8, 7]}
        angle={0.46}
        penumbra={0.75}
        intensity={78}
        color="#fff0c9"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <spotLight position={[7, 4, 4]} angle={0.58} penumbra={0.85} intensity={48} color="#f3ad68" />
      <PointerLight />
      <Environment resolution={128}>
        <Lightformer
          form="rect"
          intensity={3.4}
          color="#fff3d4"
          position={[-4.5, 5, 5]}
          rotation={[0.3, -0.62, 0]}
          scale={[5.5, 2.2, 1]}
        />
        <Lightformer
          form="rect"
          intensity={2.5}
          color="#ef9a59"
          position={[5.5, 1.5, 3]}
          rotation={[0, 0.82, 0]}
          scale={[3.2, 5, 1]}
        />
        <Lightformer
          form="ring"
          intensity={1.8}
          color="#75d8ca"
          position={[0, -3, 4]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={4}
        />
      </Environment>

      <group ref={scene}>
        <RetroTelevision
          channel={channel}
          powered={powered}
          onChannelChange={onChannelChange}
          onPowerToggle={onPowerToggle}
        />
      </group>

      <HorizonSurface />

      <ContactShadows
        position={[0, -3.57, 0]}
        opacity={0.56}
        scale={17}
        blur={2.45}
        far={7}
        color="#0d4b49"
      />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.075}
        minDistance={10.5}
        maxDistance={21}
        minPolarAngle={Math.PI * 0.35}
        maxPolarAngle={Math.PI * 0.63}
        minAzimuthAngle={-Math.PI * 0.24}
        maxAzimuthAngle={Math.PI * 0.24}
        target={[0, 0.15, 0]}
      />
    </>
  );
}

export function WondervisionExperience() {
  const [channel, setChannel] = useState(0);
  const [powered, setPowered] = useState(true);
  const hud = useRef<HTMLDivElement>(null);
  const program = TV_PROGRAMS[channel];

  const changeChannel = useCallback(() => {
    setPowered(true);
    setChannel((current) => (current + 1) % TV_PROGRAMS.length);
  }, []);

  const togglePower = useCallback(() => {
    setPowered((current) => !current);
  }, []);

  useLayoutEffect(() => {
    if (!hud.current) return;
    const items = hud.current.querySelectorAll("[data-reveal]");
    const reveal = gsap.fromTo(
      items,
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.09, delay: 0.35, ease: "power3.out" },
    );
    return () => {
      reveal.kill();
    };
  }, []);

  return (
    <main className="experience">
      <div className="sceneCanvas" aria-hidden="true">
        <Canvas
          shadows
          dpr={[1, 1.75]}
          camera={{ position: [0, 0.35, 16.5], fov: 34, near: 0.1, far: 100 }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        >
          <Suspense fallback={null}>
            <Scene
              channel={channel}
              powered={powered}
              onChannelChange={changeChannel}
              onPowerToggle={togglePower}
            />
          </Suspense>
        </Canvas>
      </div>

      <div className="sceneNoise" aria-hidden="true" />
      <div className="sceneHalo" aria-hidden="true" />

      <header className="sceneHeader">
        <a className="wordmark" href="#controls" aria-label="Wondervision home">
          <span>W</span>
          Wondervision
        </a>
        <p>Color television · Model 1957</p>
      </header>

      <div className="sceneHud" ref={hud}>
        <div className="broadcastStatus" data-reveal aria-live="polite">
          <span className={powered ? "statusLight isOn" : "statusLight"} />
          <div>
            <p>{powered ? `Channel ${program.number}` : "Standby"}</p>
            <strong>{powered ? program.title : "Signal sleeping"}</strong>
          </div>
        </div>

        <div className="controlPanel" id="controls" data-reveal>
          <button type="button" className="controlButton" onClick={changeChannel}>
            <span className="controlIcon channelIcon" aria-hidden="true">↻</span>
            <span>
              <small>Crystal dial one</small>
              Change channel
            </span>
          </button>
          <button
            type="button"
            className={`controlButton ${powered ? "isActive" : ""}`}
            onClick={togglePower}
            aria-pressed={powered}
          >
            <span className="controlIcon" aria-hidden="true">◉</span>
            <span>
              <small>Crystal dial two</small>
              {powered ? "Power off" : "Power on"}
            </span>
          </button>
        </div>

        <p className="interactionHint" data-reveal>
          <span>Drag to rotate</span>
          <span>Scroll to zoom</span>
          <span>Click the crystal dials</span>
        </p>
      </div>
    </main>
  );
}
