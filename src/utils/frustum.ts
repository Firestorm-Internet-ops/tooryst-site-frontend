/**
 * Frustum culling utility for label visibility
 */

import * as THREE from 'three';

export function updateLabelVisibility(
  camera: THREE.Camera,
  labels: Array<{ position: THREE.Vector3; visible?: boolean }>
): void {
  const frustum = new THREE.Frustum();
  const projScreenMatrix = new THREE.Matrix4();
  
  projScreenMatrix.multiplyMatrices(
    (camera as THREE.PerspectiveCamera).projectionMatrix,
    camera.matrixWorldInverse
  );
  frustum.setFromProjectionMatrix(projScreenMatrix);

  labels.forEach((label) => {
    if (label.position) {
      const visible = frustum.containsPoint(label.position);
      if (label.visible !== undefined) {
        label.visible = visible;
      }
    }
  });
}

