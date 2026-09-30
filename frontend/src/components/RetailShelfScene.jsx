import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, Scan, Package, Play, RefreshCw, ShoppingCart, ShieldAlert, Store } from 'lucide-react';
import { playButtonClick, playNotification } from '../utils/soundEffects';

export default function RetailShelfScene({ onSelectSku }) {
  const mountRef = useRef(null);
  const [activeItem, setActiveItem] = useState(null);
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || 600;
    const height = 360;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x13231d);
    scene.fog = new THREE.FogExp2(0x13231d, 0.06);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 5.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xfff6e6, 1.4);
    scene.add(ambientLight);

    const shelfSpotLight = new THREE.SpotLight(0xffe29a, 3.5, 12, Math.PI / 4, 0.4);
    shelfSpotLight.position.set(0, 4, 3);
    shelfSpotLight.castShadow = true;
    scene.add(shelfSpotLight);

    const neonEmerald = new THREE.PointLight(0x34d399, 2.5, 6);
    neonEmerald.position.set(-2.5, 1, 1);
    scene.add(neonEmerald);

    const neonCoral = new THREE.PointLight(0xf87171, 2.5, 6);
    neonCoral.position.set(2.5, 1, 1);
    scene.add(neonCoral);

    // Shelf Group
    const retailGroup = new THREE.Group();
    scene.add(retailGroup);

    // 1. Kirana Store Wooden/Metal Racks
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x1d3129,
      roughness: 0.6,
      metalness: 0.2,
    });

    const metalFrameMat = new THREE.MeshStandardMaterial({
      color: 0x2a443a,
      roughness: 0.3,
      metalness: 0.8,
    });

    // Vertical pillars
    const pillarGeo = new THREE.BoxGeometry(0.08, 2.8, 0.08);
    [-1.9, 1.9].forEach((x) => {
      [-0.4, 0.4].forEach((z) => {
        const pillar = new THREE.Mesh(pillarGeo, metalFrameMat);
        pillar.position.set(x, 0.3, z);
        pillar.castShadow = true;
        retailGroup.add(pillar);
      });
    });

    // Horizontal Shelves (3 Tiers)
    const shelfGeo = new THREE.BoxGeometry(3.9, 0.06, 0.9);
    const shelfTiers = [-0.6, 0.3, 1.2];
    shelfTiers.forEach((y) => {
      const shelf = new THREE.Mesh(shelfGeo, woodMat);
      shelf.position.set(0, y, 0);
      shelf.receiveShadow = true;
      shelf.castShadow = true;
      retailGroup.add(shelf);

      // Neon LED strip under each shelf
      const ledGeo = new THREE.BoxGeometry(3.8, 0.015, 0.02);
      const ledMat = new THREE.MeshBasicMaterial({ color: 0xe6a94a });
      const led = new THREE.Mesh(ledGeo, ledMat);
      led.position.set(0, y - 0.035, 0.43);
      retailGroup.add(led);
    });

    // Floor platform
    const floorGeo = new THREE.CylinderGeometry(2.8, 3.2, 0.2, 32);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0f1d18,
      roughness: 0.8,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.75;
    floor.receiveShadow = true;
    retailGroup.add(floor);

    // 2. Animated Retail Items on Shelves
    const items = [];

    // Helper: Rice Sack
    const createRiceSack = (x, y, z, sku) => {
      const g = new THREE.Group();
      const sackGeo = new THREE.CylinderGeometry(0.22, 0.26, 0.45, 16);
      const sackMat = new THREE.MeshStandardMaterial({ color: 0xd6c29e, roughness: 0.9 });
      const sack = new THREE.Mesh(sackGeo, sackMat);
      sack.castShadow = true;
      g.add(sack);

      // Gold Brand Label Band
      const bandGeo = new THREE.CylinderGeometry(0.225, 0.24, 0.18, 16);
      const bandMat = new THREE.MeshStandardMaterial({ color: 0xe6a94a, metalness: 0.5, roughness: 0.3 });
      const band = new THREE.Mesh(bandGeo, bandMat);
      g.add(band);

      // 🚨 Critical Stockout Hologram Ring
      const ringGeo = new THREE.TorusGeometry(0.28, 0.015, 8, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xf87171 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.35;
      g.add(ring);

      g.position.set(x, y + 0.23, z);
      g.userData = { sku, name: 'Royal Basmati Rice 5kg', ring, type: 'rice' };
      retailGroup.add(g);
      items.push(g);
    };

    // Helper: Milk / Dairy Bottles
    const createMilkBottle = (x, y, z, sku) => {
      const g = new THREE.Group();
      const bottleGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.38, 16);
      const bottleMat = new THREE.MeshStandardMaterial({ color: 0xf0fdf4, roughness: 0.2, metalness: 0.1 });
      const bottle = new THREE.Mesh(bottleGeo, bottleMat);
      bottle.castShadow = true;
      g.add(bottle);

      // Green Cap
      const capGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.08, 16);
      const capMat = new THREE.MeshStandardMaterial({ color: 0x34d399 });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.y = 0.22;
      g.add(cap);

      g.position.set(x, y + 0.19, z);
      g.userData = { sku, name: 'Farm Fresh Milk 1L', type: 'milk' };
      retailGroup.add(g);
      items.push(g);
    };

    // Helper: Organic Paneer Pack (Clearance item)
    const createPaneerPack = (x, y, z, sku) => {
      const g = new THREE.Group();
      const boxGeo = new THREE.BoxGeometry(0.28, 0.16, 0.28);
      const boxMat = new THREE.MeshStandardMaterial({ color: 0xffedd5, roughness: 0.4 });
      const box = new THREE.Mesh(boxGeo, boxMat);
      box.castShadow = true;
      g.add(box);

      // Warning Spoilage Ring
      const ringGeo = new THREE.TorusGeometry(0.22, 0.012, 8, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xfb923c });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.22;
      g.add(ring);

      g.position.set(x, y + 0.08, z);
      g.userData = { sku, name: 'Artisanal Organic Paneer 200g', ring, type: 'paneer' };
      retailGroup.add(g);
      items.push(g);
    };

    // Helper: Masala Chai Canister (Promo Item)
    const createChaiCanister = (x, y, z, sku) => {
      const g = new THREE.Group();
      const canGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.4, 20);
      const canMat = new THREE.MeshStandardMaterial({ color: 0x78350f, metalness: 0.6, roughness: 0.3 });
      const can = new THREE.Mesh(canGeo, canMat);
      can.castShadow = true;
      g.add(can);

      // Golden Lid
      const lidGeo = new THREE.CylinderGeometry(0.145, 0.145, 0.06, 20);
      const lidMat = new THREE.MeshStandardMaterial({ color: 0xe6a94a, metalness: 0.8, roughness: 0.2 });
      const lid = new THREE.Mesh(lidGeo, lidMat);
      lid.position.y = 0.21;
      g.add(lid);

      // Promo Sparkle Ring
      const ringGeo = new THREE.TorusGeometry(0.22, 0.012, 8, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xe6a94a });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.32;
      g.add(ring);

      g.position.set(x, y + 0.2, z);
      g.userData = { sku, name: 'Grand Reserve Masala Chai 250g', ring, type: 'chai' };
      retailGroup.add(g);
      items.push(g);
    };

    // Helper: Biscuit Pack
    const createBiscuitBox = (x, y, z, sku) => {
      const g = new THREE.Group();
      const bGeo = new THREE.BoxGeometry(0.36, 0.18, 0.16);
      const bMat = new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.5 });
      const b = new THREE.Mesh(bGeo, bMat);
      b.castShadow = true;
      g.add(b);

      g.position.set(x, y + 0.09, z);
      g.userData = { sku, name: 'Golden Crunch Butter Biscuits', type: 'biscuit' };
      retailGroup.add(g);
      items.push(g);
    };

    // Populate Shelf Racks with Kirana Items
    // Tier 1 (Top): Chai & Biscuits (Snacks & Beverages)
    createChaiCanister(-0.9, 1.2, 0, 'SKU-SNACK-03');
    createChaiCanister(-0.4, 1.2, 0, 'SKU-SNACK-03');
    createBiscuitBox(0.4, 1.2, 0, 'SKU-SNACK-08');
    createBiscuitBox(1.0, 1.2, 0, 'SKU-SNACK-08');

    // Tier 2 (Middle): Milk & Paneer (Dairy & Perishables)
    createMilkBottle(-1.2, 0.3, 0, 'SKU-DAIRY-01');
    createMilkBottle(-0.7, 0.3, 0, 'SKU-DAIRY-01');
    createPaneerPack(0.3, 0.3, 0, 'SKU-DAIRY-06');
    createPaneerPack(0.9, 0.3, 0, 'SKU-DAIRY-06');

    // Tier 3 (Bottom): Rice Sacks (Staples)
    createRiceSack(-1.1, -0.6, 0, 'SKU-STAPLE-01');
    createRiceSack(-0.3, -0.6, 0, 'SKU-STAPLE-01');
    createRiceSack(0.6, -0.6, 0, 'SKU-STAPLE-02');
    createRiceSack(1.3, -0.6, 0, 'SKU-STAPLE-02');

    // 3. Barcode Scanner Laser Beam
    const laserGeo = new THREE.CylinderGeometry(0.015, 0.015, 4.2, 8);
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0xf87171,
      transparent: true,
      opacity: 0.8,
    });
    const laserBeam = new THREE.Mesh(laserGeo, laserMat);
    laserBeam.rotation.z = Math.PI / 2;
    laserBeam.position.set(0, 0.4, 0.5);
    retailGroup.add(laserBeam);

    // Floating Stardust Particles
    const particleCount = 70;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 5;
      pPos[i * 3 + 1] = Math.random() * 3 - 0.5;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xe6a94a, size: 0.04, transparent: true, opacity: 0.7 });
    const pMesh = new THREE.Points(pGeo, pMat);
    retailGroup.add(pMesh);

    // Raycaster for Item Clicks
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
    };

    const onPointerClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(items, true);
      if (intersects.length > 0) {
        let root = intersects[0].object;
        while (root.parent && root.parent !== retailGroup) {
          root = root.parent;
        }
        if (root.userData && root.userData.sku) {
          playNotification();
          setActiveItem(root.userData);
          if (onSelectSku) onSelectSku(root.userData.sku);
        }
      }
    };

    container.addEventListener('mousemove', onPointerMove);
    container.addEventListener('click', onPointerClick);

    // Animation Loop
    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Slow shelf rotation
      retailGroup.rotation.y = Math.sin(t * 0.4) * 0.25;

      // Laser scanner sweeping vertically
      if (scanning) {
        laserBeam.position.y = Math.sin(t * 2.2) * 0.9 + 0.3;
        laserBeam.material.opacity = 0.6 + Math.sin(t * 8) * 0.3;
      }

      // Bobbing rings above items
      items.forEach((item, idx) => {
        if (item.userData.ring) {
          item.userData.ring.rotation.z = t * 2 + idx;
          item.userData.ring.scale.setScalar(1 + Math.sin(t * 3 + idx) * 0.12);
        }
      });

      // Camera gentle parallax
      camera.position.x += (mouse.x * 0.6 - camera.position.x) * 0.05;
      camera.position.y += (1.2 + mouse.y * 0.4 - camera.position.y) * 0.05;
      camera.lookAt(0, 0.4, 0);

      renderer.render(scene, camera);
    };

    animate();

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 600;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };

    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousemove', onPointerMove);
      container.removeEventListener('click', onPointerClick);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, [scanning]);

  return (
    <div className="kirana-card rounded-3xl border border-amber/40 p-5 sm:p-6 shadow-glow-amber relative overflow-hidden my-8">
      {/* Top Header Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-panel-border/70">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber/20 border border-amber/40 flex items-center justify-center text-amber shadow-md">
            <Store className="w-4 h-4 animate-crate-bounce" />
          </div>
          <div>
            <h3 className="text-base font-headline font-bold text-[#f0f6f3] flex items-center gap-2">
              <span>Interactive 3D Kirana Shelf Simulation</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-accent border border-emerald-500/40">
                Live Inventory Radar
              </span>
            </h3>
            <p className="text-xs text-sage">
              Click any 3D item on the shelf to inspect multi-agent stockout math, margins, and promo reasoning.
            </p>
          </div>
        </div>

        {/* Scanner Laser Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playButtonClick();
              setScanning(!scanning);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              scanning
                ? 'bg-red-500/20 text-red-300 border-red-500/40 shadow-glow-coral'
                : 'bg-panel text-sage border-panel-border'
            }`}
          >
            <Scan className="w-3.5 h-3.5" />
            <span>{scanning ? 'Barcode Scanner ON' : 'Scanner Paused'}</span>
          </button>
        </div>
      </div>

      {/* 3D WebGL Shelf Canvas Mount */}
      <div className="relative w-full h-[360px] rounded-2xl overflow-hidden bg-[#101e19] border border-panel-border/80 flex items-center justify-center">
        <div ref={mountRef} className="w-full h-full cursor-pointer" />

        {/* Floating Scanner Barcode HUD Line */}
        <div className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-[#12211c]/80 border border-panel-border text-[11px] font-mono text-sage flex items-center gap-2 backdrop-blur-md pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-emerald-accent animate-ping" />
          <span>SHELF SCAN: 12 SKUs Tracked</span>
        </div>

        {/* Click hint pill */}
        <div className="absolute bottom-3 right-3 px-3 py-1 rounded-lg bg-amber/15 border border-amber/30 text-[11px] font-mono text-amber flex items-center gap-1.5 backdrop-blur-md pointer-events-none">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Click on Rice, Paneer or Chai to Inspect</span>
        </div>
      </div>

      {/* 3 Live Shelf Hotspot Quick Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
        <div
          onClick={() => {
            playButtonClick();
            if (onSelectSku) onSelectSku('SKU-STAPLE-01');
          }}
          className="p-3 rounded-xl bg-[#182b24] hover:bg-[#20382f] border border-red-500/30 hover:border-red-500/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-red-300 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Bottom Shelf (Staples)
            </span>
            <span className="text-[10px] font-mono text-red-400 font-bold">2.6d Left</span>
          </div>
          <div className="text-xs font-bold text-[#f0f6f3] group-hover:text-amber transition-colors truncate">
            Royal Basmati Rice 5kg
          </div>
          <div className="text-[11px] text-sage/80 mt-0.5">
            Stock: 12 bags • Lead time: 7 days → <span className="text-amber font-semibold">Reorder +55 units</span>
          </div>
        </div>

        <div
          onClick={() => {
            playButtonClick();
            if (onSelectSku) onSelectSku('SKU-DAIRY-06');
          }}
          className="p-3 rounded-xl bg-[#182b24] hover:bg-[#20382f] border border-orange-500/30 hover:border-orange-500/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-orange-300 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              Middle Shelf (Dairy)
            </span>
            <span className="text-[10px] font-mono text-orange-400 font-bold">7d Expiry</span>
          </div>
          <div className="text-xs font-bold text-[#f0f6f3] group-hover:text-amber transition-colors truncate">
            Artisanal Organic Paneer 200g
          </div>
          <div className="text-[11px] text-sage/80 mt-0.5">
            38 units in stock • Burn: 1.5/d → <span className="text-orange-300 font-semibold">20% Weekend Clearance</span>
          </div>
        </div>

        <div
          onClick={() => {
            playButtonClick();
            if (onSelectSku) onSelectSku('SKU-SNACK-03');
          }}
          className="p-3 rounded-xl bg-[#182b24] hover:bg-[#20382f] border border-amber/30 hover:border-amber/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-amber flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber animate-pulse" />
              Top Shelf (Beverages)
            </span>
            <span className="text-[10px] font-mono text-amber font-bold">62% Margin</span>
          </div>
          <div className="text-xs font-bold text-[#f0f6f3] group-hover:text-amber transition-colors truncate">
            Grand Reserve Masala Chai 250g
          </div>
          <div className="text-[11px] text-sage/80 mt-0.5">
            Pairs with Butter Biscuits → <span className="text-emerald-accent font-semibold">Morning Chai Combo</span>
          </div>
        </div>
      </div>
    </div>
  );
}
