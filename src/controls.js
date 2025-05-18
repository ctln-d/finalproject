import { landscapeRef, treesRef } from './Landscape';
import { Raycaster, Vector3 } from 'three';

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
const COLLISION_PENALTY = 10; // Renamed from GROUND_COLLISION_PENALTY

// Collision detection function
function checkCollision(newPosition, direction) {
  // Check world boundaries
  if (newPosition.x < WORLD_BOUNDS.x.min || newPosition.x > WORLD_BOUNDS.x.max ||
      newPosition.y < WORLD_BOUNDS.y.min || newPosition.y > WORLD_BOUNDS.y.max ||
      newPosition.z < WORLD_BOUNDS.z.min || newPosition.z > WORLD_BOUNDS.z.max) {
    return { collision: true };
  }

  // Check collisions with landscape and trees
  if (landscapeRef.current && treesRef.current) {
    // Cast rays in multiple directions to detect nearby objects
    const directions = [
      direction.clone(), // Forward
      direction.clone().applyAxisAngle(new Vector3(0, 1, 0), Math.PI / 4), // Forward-right
      direction.clone().applyAxisAngle(new Vector3(0, 1, 0), -Math.PI / 4), // Forward-left
      direction.clone().applyAxisAngle(new Vector3(1, 0, 0), Math.PI / 4), // Forward-up
      direction.clone().applyAxisAngle(new Vector3(1, 0, 0), -Math.PI / 4), // Forward-down
    ];

    for (const dir of directions) {
      raycaster.set(newPosition, dir);
      const landscapeIntersects = raycaster.intersectObject(landscapeRef.current, true);
      const treesIntersects = raycaster.intersectObject(treesRef.current, true);

      if ((landscapeIntersects.length > 0 && landscapeIntersects[0].distance < collisionDistance) ||
          (treesIntersects.length > 0 && treesIntersects[0].distance < collisionDistance)) {
        return { collision: true };
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

  x.applyAxisAngle(z, jawVelocity);
  y.applyAxisAngle(z, jawVelocity);

  y.applyAxisAngle(x, pitchVelocity);
  z.applyAxisAngle(x, pitchVelocity);

  x.normalize();
  y.normalize();
  z.normalize();

  // plane position & velocity
  if (controls.shift) {
    turbo += 0.025;
  } else {
    turbo *= 0.95;
  }
  turbo = Math.min(Math.max(turbo, 0), 1);

  let turboSpeed = easeOutQuad(turbo) * 0.02;

  camera.fov = 45 + turboSpeed * 900;
  camera.updateProjectionMatrix();

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