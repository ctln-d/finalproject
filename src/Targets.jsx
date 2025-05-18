import { useState, useMemo, useEffect, useCallback } from "react";
import { Quaternion, TorusGeometry, Vector3, BufferGeometry, BufferAttribute, Vector2 } from "three";
import { mergeBufferGeometries } from "three-stdlib";
import { useFrame } from "@react-three/fiber";
import { planePosition } from "./Airplane";

function randomPoint(scale) {
  return new Vector3(
    Math.random() * 2 - 1,
    Math.random() * 2 - 1,
    Math.random() * 2 - 1
  ).multiply(scale || new Vector3(1, 1, 1));
}

const TARGET_RAD = 0.125;
const PLANE_COLLISION_RAD = 0.2; // Added plane collision radius
const POINTS_PER_TARGET = 10;
const RESPAWN_TIME = 60000; // 60 seconds in milliseconds
const TARGET_COUNT = 25;

// Create a single torus geometry to be reused
const baseTorusGeometry = new TorusGeometry(TARGET_RAD, 0.02, 8, 25);

export function Targets({ onScoreUpdate }) {
  const [targets, setTargets] = useState(() => {
    const arr = [];
    for (let i = 0; i < TARGET_COUNT; i++) {
      const center = randomPoint(new Vector3(4, 1, 4)).add(
        new Vector3(0, 2 + Math.random() * 2, 0)
      );
      const direction = randomPoint().normalize();
      arr.push({
        center,
        direction,
        originalCenter: center.clone(), // Store original position
        originalDirection: direction.clone(), // Store original direction
        hit: false,
        hitTime: null
      });
    }
    return arr;
  });

  // Optimize target respawning
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      let needsUpdate = false;
      
      const newTargets = targets.map(target => {
        if (target.hit && target.hitTime && now - target.hitTime >= RESPAWN_TIME) {
          needsUpdate = true;
          return {
            ...target,
            hit: false,
            hitTime: null,
            center: target.originalCenter.clone(), // Use original position
            direction: target.originalDirection.clone() // Use original direction
          };
        }
        return target;
      });

      if (needsUpdate) {
        setTargets(newTargets);
      }
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [targets]);

  // Optimize geometry creation
  const geometry = useMemo(() => {
    const positions = [];
    const normals = [];
    const indices = [];
    let indexOffset = 0;

    targets.forEach((target) => {
      if (!target.hit) {
        const quaternion = new Quaternion().setFromUnitVectors(
          new Vector3(0, 0, 1),
          target.direction
        );

        // Get geometry attributes
        const posAttr = baseTorusGeometry.getAttribute('position');
        const normalAttr = baseTorusGeometry.getAttribute('normal');
        const indexAttr = baseTorusGeometry.getIndex();

        // Transform and add vertices
        for (let i = 0; i < posAttr.count; i++) {
          const vertex = new Vector3();
          vertex.fromBufferAttribute(posAttr, i);
          vertex.applyQuaternion(quaternion);
          vertex.add(target.center);
          positions.push(vertex.x, vertex.y, vertex.z);

          const normal = new Vector3();
          normal.fromBufferAttribute(normalAttr, i);
          normal.applyQuaternion(quaternion);
          normals.push(normal.x, normal.y, normal.z);
        }

        // Add indices
        for (let i = 0; i < indexAttr.count; i++) {
          indices.push(indexAttr.getX(i) + indexOffset);
        }
        indexOffset += posAttr.count;
      }
    });

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
    geometry.setAttribute('normal', new BufferAttribute(new Float32Array(normals), 3));
    geometry.setIndex(indices);

    return geometry;
  }, [targets]);

  // Optimize collision detection
  const checkCollision = useCallback((target) => {
    if (target.hit) return false;

    const v = planePosition.clone().sub(target.center);
    const dist = target.direction.dot(v);
    const projected = planePosition.clone().sub(target.direction.clone().multiplyScalar(dist));
    const hitDist = projected.distanceTo(target.center);

    return hitDist < TARGET_RAD + PLANE_COLLISION_RAD;
  }, []);

  useFrame(() => {
    let newScore = 0;
    let needsUpdate = false;

    targets.forEach((target, i) => {
      if (checkCollision(target)) {
        target.hit = true;
        target.hitTime = Date.now();
        newScore += POINTS_PER_TARGET;
        needsUpdate = true;
      }
    });

    if (newScore > 0) {
      onScoreUpdate(newScore);
    }

    if (needsUpdate) {
      setTargets([...targets]);
    }
  });

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial roughness={0.5} metalness={0.5} />
    </mesh>
  );
}
