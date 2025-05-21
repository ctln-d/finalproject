import { landscapeRef, treesRef } from './Landscape';
import { Raycaster, Vector3 } from 'three';
import { shootBullet } from './Bullets';

function easeOutQuad(x) {
  return 1 - (1 - x) * (1 - x);
}

export let controls = {};

window.addEventListener("keydown", (e) => {
  controls[e.key.toLowerCase()] = true;
});
window.addEventListener("keyup", (e) => {
  controls[e.key.toLowerCase()] = false;
});

let maxVelocity = 0.04;
let jawVelocity = 0;
let pitchVelocity = 0;
let planeSpeed = 0.006;
export let turbo = 0;

// Define world boundaries
const WORLD_BOUNDS = {
  x: { min: -8, max: 8 },
  y: { min: 0.5, max: 8 },
  z: { min: -8, max: 8 }
};

// Create raycaster for collision detection
const raycaster = new Raycaster();
const collisionDistance = 0.5; // Distance to check for collisions
const COLLISION_PENALTY = 10;

// Optimize collision detection function
function checkCollision(newPosition, direction) {
  // Check world boundaries first (fast check)
  if (newPosition.x < WORLD_BOUNDS.x.min || newPosition.x > WORLD_BOUNDS.x.max ||
      newPosition.y < WORLD_BOUNDS.y.min || newPosition.y > WORLD_BOUNDS.y.max ||
      newPosition.z < WORLD_BOUNDS.z.min || newPosition.z > WORLD_BOUNDS.z.max) {
    return { collision: true };
  }

  // Only check landscape collisions if we're within the boundary area
  if (landscapeRef.current && treesRef.current) {
    // Optimize raycast parameters for close-range detection
    raycaster.firstHitOnly = true;
    raycaster.near = 0;
    raycaster.far = collisionDistance;

    // Use a single forward ray for most cases
    raycaster.set(newPosition, direction);
    
    // Check landscape first (usually more important)
    const landscapeIntersects = raycaster.intersectObject(landscapeRef.current, false);
    if (landscapeIntersects.length > 0) {
      return { collision: true };
    }

    // Only check trees if no landscape collision
    const treesIntersects = raycaster.intersectObject(treesRef.current, false);
    if (treesIntersects.length > 0) {
      return { collision: true };
    }

    // Only do additional raycasts if we're moving fast (turbo)
    if (turbo > 0.5) {
      const sideDirections = [
        direction.clone().applyAxisAngle(new Vector3(0, 1, 0), Math.PI / 3),
        direction.clone().applyAxisAngle(new Vector3(0, 1, 0), -Math.PI / 3),
      ];

      for (const dir of sideDirections) {
        raycaster.set(newPosition, dir);
        const landscapeIntersects = raycaster.intersectObject(landscapeRef.current, false);
        if (landscapeIntersects.length > 0) {
          return { collision: true };
        }
      }
    }
  }

  return { collision: false };
}

// Function to reset plane position and orientation
function resetPlane(x, y, z, planePosition) {
  jawVelocity = 0;
  pitchVelocity = 0;
  turbo = 0;
  x.set(1, 0, 0);
  y.set(0, 1, 0);
  z.set(0, 0, 1);
  planePosition.set(0, 3, 7);
}

// Optimize plane movement
export function updatePlaneAxis(x, y, z, planePosition, camera) {
  jawVelocity *= 0.95;
  pitchVelocity *= 0.95;

  if (Math.abs(jawVelocity) > maxVelocity) 
    jawVelocity = Math.sign(jawVelocity) * maxVelocity;

  if (Math.abs(pitchVelocity) > maxVelocity) 
    pitchVelocity = Math.sign(pitchVelocity) * maxVelocity;

  if (controls["a"]) {
    jawVelocity += 0.0025;
  }

  if (controls["d"]) {
    jawVelocity -= 0.0025;
  }

  if (controls["w"]) {
    pitchVelocity -= 0.0025;
  }

  if (controls["s"]) {
    pitchVelocity += 0.0025;
  }

  if (controls["r"]) {
    resetPlane(x, y, z, planePosition);
  }

  // Handle shooting
  if (controls[" "]) { // Space bar
    shootBullet(z);
  }

  x.applyAxisAngle(z, jawVelocity);
  y.applyAxisAngle(z, jawVelocity);

  y.applyAxisAngle(x, pitchVelocity);
  z.applyAxisAngle(x, pitchVelocity);

  x.normalize();
  y.normalize();
  z.normalize();

  // Optimize turbo calculation
  if (controls.shift) {
    turbo = Math.min(turbo + 0.025, 1);
  } else {
    turbo *= 0.95;
  }

  let turboSpeed = easeOutQuad(turbo) * 0.02;

  // Optimize camera FOV update
  if (turbo > 0.1) {
    camera.fov = 45 + turboSpeed * 900;
    camera.updateProjectionMatrix();
  }

  // Calculate new position
  const newPosition = planePosition.clone().add(z.clone().multiplyScalar(-planeSpeed - turboSpeed));
  
  // Check for collision before updating position
  const { collision } = checkCollision(newPosition, z);
  
  if (!collision) {
    planePosition.copy(newPosition);
  } else {
    // Reset plane position and orientation for any collision
    resetPlane(x, y, z, planePosition);
    // Apply score penalty
    if (window.onScoreUpdate) {
      window.onScoreUpdate(-COLLISION_PENALTY);
    }
  }
}