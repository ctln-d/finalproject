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
const PLANE_COLLISION_RAD = 0.2;
const POINTS_PER_TARGET = 10;
const RESPAWN_TIME = 60000;
const TARGET_COUNT = 15;

// Create a single torus geometry with minimal segments for better performance
const baseTorusGeometry = new TorusGeometry(TARGET_RAD, 0.02, 4, 12);

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
        originalCenter: center.clone(),
        originalDirection: direction.clone(),
        hit: false,
        hitTime: null
      });
    }
    return arr;
  });

  // Optimize target respawning with a more efficient interval
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
            center: target.originalCenter.clone(),
            direction: target.originalDirection.clone()
          };
        }
        return target;
      });

      if (needsUpdate) {
        setTargets(newTargets);
      }
    }, 2000); // Check every 2 seconds instead of every second

    return () => clearInterval(interval);
  }, [targets]);

  // Optimize geometry creation with reduced complexity
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

        const posAttr = baseTorusGeometry.getAttribute('position');
        const normalAttr = baseTorusGeometry.getAttribute('normal');
        const indexAttr = baseTorusGeometry.getIndex();

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

  // Optimize collision detection with simpler checks
  const checkCollision = useCallback((target) => {
    if (target.hit) return false;

    const v = planePosition.clone().sub(target.center);
    const dist = target.direction.dot(v);
    const projected = planePosition.clone().sub(target.direction.clone().multiplyScalar(dist));
    const hitDist = projected.distanceTo(target.center);

    return hitDist < TARGET_RAD + PLANE_COLLISION_RAD;
  }, []);

  // Optimize frame updates with batched processing
  useFrame(() => {
    let newScore = 0;
    let needsUpdate = false;
    let hitCount = 0;

    // Process targets in batches of 5 for better performance
    for (let i = 0; i < targets.length; i += 5) {
      const batchEnd = Math.min(i + 5, targets.length);
      for (let j = i; j < batchEnd; j++) {
        const target = targets[j];
        if (checkCollision(target)) {
          target.hit = true;
          target.hitTime = Date.now();
          newScore += POINTS_PER_TARGET;
          needsUpdate = true;
          hitCount++;
        }
      }
    }

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
