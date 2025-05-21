import { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, SphereGeometry } from 'three';
import { planePosition } from './Airplane';

const BULLET_SPEED = 0.3;
const BULLET_LIFETIME = 2000; // 2 seconds
const BULLET_RADIUS = 0.05;

export function Bullets() {
  const [bullets, setBullets] = useState([]);
  const lastShotTime = useRef(0);
  const SHOT_COOLDOWN = 250; // 250ms between shots

  // Create bullet geometry
  const bulletGeometry = useMemo(() => {
    return new SphereGeometry(BULLET_RADIUS, 8, 8);
  }, []);

  // Handle shooting
  const shoot = (direction) => {
    const now = Date.now();
    if (now - lastShotTime.current < SHOT_COOLDOWN) return;
    
    lastShotTime.current = now;
    
    setBullets(prev => [...prev, {
      position: planePosition.clone(),
      direction: direction.clone(),
      createdAt: now
    }]);
  };

  // Make shoot function available globally
  useEffect(() => {
    window.bulletSystem = { shoot };
    return () => {
      window.bulletSystem = null;
    };
  }, []);

  // Update bullets position and remove expired ones
  useFrame(() => {
    const now = Date.now();
    
    setBullets(prev => {
      const newBullets = prev
        .filter(bullet => now - bullet.createdAt < BULLET_LIFETIME)
        .map(bullet => ({
          ...bullet,
          position: bullet.position.clone().add(
            bullet.direction.clone().multiplyScalar(-BULLET_SPEED)
          )
        }));
      
      return newBullets;
    });
  });

  return (
    <group>
      {bullets.map((bullet, index) => (
        <mesh key={index} position={bullet.position} geometry={bulletGeometry}>
          <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

// Export the shoot function to be used in controls
export const shootBullet = (direction) => {
  if (window.bulletSystem) {
    window.bulletSystem.shoot(direction);
  }
}; 