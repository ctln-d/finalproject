import { useTexture } from "@react-three/drei";
import { BackSide, Color } from "three";
import { useState, useEffect } from "react";

export function SphereEnv() {
  const [error, setError] = useState(false);
  const map = useTexture(
    "assets/textures/envmap.jpg",
    // Success callback
    () => {
      console.log("Environment texture loaded successfully");
    },
    // Error callback
    (error) => {
      console.error("Error loading environment texture:", error);
      setError(true);
    }
  );

  if (error) {
    return (
      <mesh>
        <sphereGeometry args={[60, 50, 50]} />
        <meshBasicMaterial 
          side={BackSide}
          color={new Color("#000000")}
        />
      </mesh>
    );
  }

  return (
    <mesh>
      <sphereGeometry args={[60, 50, 50]} />
      <meshBasicMaterial 
        side={BackSide}
        map={map}
      />
    </mesh>
  );
}