/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.3 scene.glb
*/

import React, { useEffect, useMemo, useRef } from "react";
import { MeshReflectorMaterial, useGLTF } from "@react-three/drei";
import { Color, MeshStandardMaterial } from "three";

// Create refs that can be accessed globally
export const landscapeRef = React.createRef();
export const treesRef = React.createRef();

export function Landscape(props) {
  const { nodes, materials } = useGLTF("assets/models/scene.glb");

  const [lightsMaterial, waterMaterial] = useMemo(() => {
    return [
      new MeshStandardMaterial({
        envMapIntensity: 0,
        color: new Color("#ea6619"),
        roughness: 0,
        metalness: 0,
        emissive: new Color("#f6390f").multiplyScalar(1),
      }),
      <MeshReflectorMaterial
        transparent={true}
        opacity={0.4}
        color={"#23281b"}
        roughness={0.2}
        blur={[2, 2]}
        mixBlur={0.2}
        mixStrength={5}
        mixContrast={1}
        resolution={128}
        mirror={0}
        depthScale={0}
        minDepthThreshold={0}
        maxDepthThreshold={0.1}
        depthToBlurRatioBias={0.0025}
        debug={0}
        reflectorOffset={0.0}
      />,
    ];
  }, []);

  useEffect(() => {
    const landscapeMat = materials["Material.009"];
    landscapeMat.envMapIntensity = 0.3;
    landscapeMat.roughness = 0.9;
    landscapeMat.metalness = 0.1;

    const treesMat = materials["Material.008"];
    treesMat.color = new Color("#2f2f13");
    treesMat.envMapIntensity = 0.1;
    treesMat.roughness = 1;
    treesMat.metalness = 0;
  }, [materials]);

  return (
    <group {...props} dispose={null}>
      <mesh
        ref={landscapeRef}
        geometry={nodes.landscape_gltf.geometry}
        material={materials["Material.009"]}
        castShadow={false} // Disabled shadow casting for better performance
        receiveShadow
      />
      <mesh
        geometry={nodes.landscape_borders.geometry}
        material={materials["Material.010"]}
      />
      <mesh
        ref={treesRef}
        geometry={nodes.trees_light.geometry}
        material={materials["Material.008"]}
        castShadow={false} // Disabled shadow casting for better performance
        receiveShadow
      />
      <mesh
        position={[-2.536, 1.272, 0.79]}
        rotation={[-Math.PI * 0.5, 0, 0]}
        scale={[1.285, 1.285, 1]}
      >
        <planeGeometry args={[1, 1]} />
        {waterMaterial}
      </mesh>
      <mesh
        position={[1.729, 0.943, 2.709]}
        rotation={[-Math.PI * 0.5, 0, 0]}
        scale={[3, 3, 1]}
      >
        <planeGeometry args={[1, 1]} />
        {waterMaterial}
      </mesh>
      <mesh
        position={[0.415, 1.588, -2.275]}
        rotation={[-Math.PI * 0.5, 0, 0]}
        scale={[3.105, 2.405, 1]}
      >
        <planeGeometry args={[1, 1]} />
        {waterMaterial}
      </mesh>
      <mesh
        geometry={nodes.lights.geometry}
        material={lightsMaterial}
        castShadow={false} // Disabled shadow casting for better performance
      />
    </group>
  );
}

useGLTF.preload("assets/models/scene.glb");
