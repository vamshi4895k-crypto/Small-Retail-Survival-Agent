import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default function ThreeSceneCanvas({ onProgress }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x12211c);
    scene.fog = new THREE.FogExp2(0x12211c, 0.04);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 1.8, 6.5);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Ambient & Directional Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xe6a94a, 2.5);
    mainLight.position.set(5, 8, 5);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const rimLight = new THREE.PointLight(0x34d399, 3, 10);
    rimLight.position.set(-4, 3, -2);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0xe6a94a, 1.5, 8);
    fillLight.position.set(0, -1, 3);
    scene.add(fillLight);

    // Glowing Particle Field (Kirana Gold & Emerald Stardust)
    const particleCount = 180;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const goldColor = new THREE.Color(0xe6a94a);
    const emeraldColor = new THREE.Color(0x34d399);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12;

      const c = Math.random() > 0.4 ? goldColor : emeraldColor;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });

    const particles = new THREE.Points(geometry, particleMaterial);
    scene.add(particles);

    // 3D Model Group
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    // Load 3D GLTF Model
    const loader = new GLTFLoader();
    let loadedModel = null;

    loader.load(
      '/models/room/model.glb',
      (gltf) => {
        loadedModel = gltf.scene;
        loadedModel.scale.set(0.65, 0.65, 0.65);
        loadedModel.position.set(0, -1.2, 0);
        loadedModel.rotation.y = -Math.PI / 4;
        modelGroup.add(loadedModel);
        if (onProgress) onProgress(100);
      },
      (xhr) => {
        if (xhr.lengthComputable && onProgress) {
          const pct = (xhr.loaded / xhr.total) * 100;
          onProgress(pct);
        }
      },
      (err) => {
        console.warn('Room model fallback to procedural geometric stage:', err);
        // Procedural decorative 3D kiosk fallback
        const geo = new THREE.CylinderGeometry(1.5, 1.8, 0.4, 32);
        const mat = new THREE.MeshStandardMaterial({
          color: 0x1b2d26,
          metalness: 0.3,
          roughness: 0.4,
        });
        const platform = new THREE.Mesh(geo, mat);
        platform.position.y = -1.2;
        modelGroup.add(platform);
        if (onProgress) onProgress(100);
      }
    );

    // Mouse Parallax Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', onMouseMove);

    // Resize Handler
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', onResize);

    // Animation Loop
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera parallax
      targetX += (mouseX * 0.4 - targetX) * 0.05;
      targetY += (mouseY * 0.3 - targetY) * 0.05;

      camera.position.x = targetX;
      camera.position.y = 1.8 + targetY;
      camera.lookAt(0, 0, 0);

      // Rotate particles & model gently
      particles.rotation.y = elapsedTime * 0.03;
      particles.rotation.x = Math.sin(elapsedTime * 0.02) * 0.05;

      if (loadedModel) {
        loadedModel.rotation.y = -Math.PI / 4 + Math.sin(elapsedTime * 0.5) * 0.08;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="main-canvas"
      className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-40 transition-opacity duration-1000"
    />
  );
}
