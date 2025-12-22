'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function TicketAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const ticketsRef = useRef<THREE.Group[]>([]);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = null;
    sceneRef.current = scene;

    // Camera setup
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Create ticket cards
    const tickets: THREE.Group[] = [];
    const geometries: THREE.BufferGeometry[] = [];
    const allMaterials: THREE.Material[] = [];
    const ticketCount = 3;
    const spacing = 3;

    for (let i = 0; i < ticketCount; i++) {
      const group = new THREE.Group();

      // Ticket geometry
      const geometry = new THREE.BoxGeometry(2, 3, 0.1);
      geometries.push(geometry);
      
      // Create materials for each face
      const materials = [
        new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.3, roughness: 0.4 }), // right
        new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.3, roughness: 0.4 }), // left
        new THREE.MeshStandardMaterial({ color: 0x1e40af, metalness: 0.3, roughness: 0.4 }), // top
        new THREE.MeshStandardMaterial({ color: 0x1e40af, metalness: 0.3, roughness: 0.4 }), // bottom
        new THREE.MeshStandardMaterial({ color: 0x2563eb, metalness: 0.5, roughness: 0.3 }), // front
        new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.2, roughness: 0.5 }), // back
      ];
      allMaterials.push(...materials);

      const ticket = new THREE.Mesh(geometry, materials);
      ticket.castShadow = true;
      ticket.receiveShadow = true;
      ticket.position.x = (i - 1) * spacing;

      // Add glow effect
      const glowGeometry = new THREE.BoxGeometry(2.1, 3.1, 0.15);
      geometries.push(glowGeometry);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x60a5fa,
        transparent: true,
        opacity: 0.15,
      });
      allMaterials.push(glowMaterial);
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.position.z = -0.05;

      group.add(ticket);
      group.add(glow);
      group.userData = {
        baseY: 0,
        index: i,
        rotationSpeed: 0.005 + Math.random() * 0.003,
        floatSpeed: 0.02 + Math.random() * 0.01,
        floatAmount: 0.5 + Math.random() * 0.3,
      };

      scene.add(group);
      tickets.push(group);
    }

    ticketsRef.current = tickets;

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      tickets.forEach((ticket, index) => {
        const time = Date.now() * 0.001;
        const userData = ticket.userData;

        // Rotation
        ticket.rotation.x += userData.rotationSpeed;
        ticket.rotation.y += userData.rotationSpeed * 0.7;

        // Floating motion
        ticket.position.y = userData.baseY + Math.sin(time * userData.floatSpeed + index) * userData.floatAmount;

        // Slight side-to-side motion
        ticket.position.x = (index - 1) * spacing + Math.cos(time * 0.3 + index * 2) * 0.3;

        // Scale pulse
        const scale = 1 + Math.sin(time * 1.5 + index * 2) * 0.05;
        ticket.scale.set(scale, scale, scale);
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometries.forEach(g => g.dispose());
      allMaterials.forEach((m: THREE.Material) => m.dispose());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-2xl overflow-hidden"
      style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}
    />
  );
}
