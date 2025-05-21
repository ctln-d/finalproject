import React, { useEffect, Suspense } from "react";
import { PerspectiveCamera, Environment } from "@react-three/drei";
import { EffectComposer, HueSaturation } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Landscape } from "./Landscape";
import { SphereEnv } from "./SphereEnv";
import { Airplane } from "./Airplane";
import { Targets } from "./Targets";
import { MotionBlur } from "./MotionBlur";
import { Bullets } from "./Bullets";

function App({ onScoreUpdate, onLoad }) {
  useEffect(() => {
    // Notify parent that assets are loaded
    onLoad();
  }, [onLoad]);

  return (
    <>
      <Suspense fallback={null}>
        <SphereEnv />
        <Environment background={false} files={"assets/textures/envmap.hdr"} />
      </Suspense>

      <PerspectiveCamera makeDefault position={[0, 10, 10]} />

      <Suspense fallback={null}>
        <Landscape />
      </Suspense>

      <Suspense fallback={null}>
        <Airplane />
      </Suspense>

      <Suspense fallback={null}>
        <Targets onScoreUpdate={onScoreUpdate} />
      </Suspense>

      <Bullets />

      <directionalLight
        castShadow
        color={"#f3d29a"}
        intensity={1.5}
        position={[10, 5, 4]}
        shadow-bias={-0.0005}
        shadow-mapSize-width={128}
        shadow-mapSize-height={128}
        shadow-camera-near={0.01}
        shadow-camera-far={20}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-camera-left={-6.2}
        shadow-camera-right={6.4}
      />

      <EffectComposer enabled={true} multisampling={0}>
        <MotionBlur />
        <HueSaturation
          blendFunction={BlendFunction.NORMAL}
          hue={-0.1}
          saturation={0.05}
        />
      </EffectComposer>
    </>
  );
}

export default App;
