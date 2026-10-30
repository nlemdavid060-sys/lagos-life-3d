"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function LagosLife3D() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    if(!ref.current) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);

    const renderer = new THREE.WebGLRenderer({ canvas: ref.current, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;

    const camera = new THREE.PerspectiveCamera(65, window.innerWidth/window.innerHeight, 0.1, 100);
    camera.position.set(0, 1.7, 3);

    // BETTER LIGHTING - HOUSE SHOW WELL NOW
    const sun = new THREE.DirectionalLight(0xfff7e8, 0.8);
    sun.position.set(5,10,5); sun.castShadow=true; 
    sun.shadow.mapSize.set(2048,2048);
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    const roomLight = new THREE.PointLight(0xfff0c0, 1.5, 15);
    roomLight.position.set(0,3,0); scene.add(roomLight);

    // FLOOR - BROWN TILE VISIBLE
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(10,10),
      new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.8, metalness: 0.1 })
    );
    floor.rotation.x = -Math.PI/2; floor.receiveShadow=true; scene.add(floor);

    // WALLS - SHOW WELL WITH COLOR
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf5f5dc, roughness: 0.9 });
    const createWall = (w,h,x,y,z)=> {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,0.2), wallMat);
      m.position.set(x,y,z); m.receiveShadow=true; m.castShadow=true; scene.add(m); return m;
    }
    createWall(10,4,0,2,-5); // back
    createWall(10,4,0,2,5); // front with door gap handled by not full
    createWall(0.2,4,-5,2,0); // left
    createWall(0.2,4,5,2,0); // right

    // WINDOWS - BLUE GLASS VISIBLE
    const windowMat = new THREE.MeshStandardMaterial({ color: 0x6bb6ff, transparent: true, opacity: 0.5, roughness: 0.1, metalness: 0.3 });
    const win1 = new THREE.Mesh(new THREE.PlaneGeometry(1.5,1.2), windowMat);
    win1.position.set(-2,1.8,-4.89); scene.add(win1);
    const win2 = win1.clone(); win2.position.set(2,1.8,-4.89); scene.add(win2);

    // TABLE - WOOD BROWN CLEAR
    const table = new THREE.Mesh(
      new THREE.BoxGeometry(1.8,0.15,0.9),
      new THREE.MeshStandardMaterial({ color: 0xc19a6b, roughness: 0.6 })
    );
    table.position.set(0,0.75,-1.5); table.castShadow=true; table.receiveShadow=true; scene.add(table);
    const legGeo = new THREE.BoxGeometry(0.08,0.7,0.08);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b });
    [[-0.8,0.35,-0.35],[0.8,0.35,-0.35],[-0.8,0.35,0.35],[0.8,0.35,0.35]].forEach(p=>{
      const leg = new THREE.Mesh(legGeo, legMat); leg.position.set(p[0]+0,p[1]+0.75,-1.5+p[2]); leg.castShadow=true; scene.add(leg);
    });

    // SOFA / BED - BEIGE CLEAR
    const bed = new THREE.Mesh(
      new THREE.BoxGeometry(2.2,0.5,1.3),
      new THREE.MeshStandardMaterial({ color: 0xd2b48c, roughness: 0.8 })
    );
    bed.position.set(0,0.25,1.5); bed.castShadow=true; bed.receiveShadow=true; scene.add(bed);

    // TV - BLACK SCREEN VISIBLE
    const tv = new THREE.Mesh(
      new THREE.BoxGeometry(1.4,0.8,0.08),
      new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3, metalness: 0.2 })
    );
    tv.position.set(0,1.5,-1.2); tv.castShadow=true; scene.add(tv);

    // PLAYER - BLOCKY BUT CLEAR SHADOW
    const player = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.5,0.7,0.3), new THREE.MeshStandardMaterial({color:0x5bc0ff})); body.position.y=1; body.castShadow=true; player.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.25,16,16), new THREE.MeshStandardMaterial({color:0xffdbac})); head.position.y=1.65; head.castShadow=true; player.add(head);
    scene.add(player);

    let keys:any = {}; window.addEventListener('keydown', e=>keys[e.key.toLowerCase()]=true);
    window.addEventListener('keyup', e=>keys[e.key.toLowerCase()]=false);
    let rotY=0;

    const animate = ()=>{
      requestAnimationFrame(animate);
      if(keys['w'] || keys['arrowup']) player.position.z -= 0.04;
      if(keys['s'] || keys['arrowdown']) player.position.z += 0.04;
      if(keys['a'] || keys['arrowleft']) { player.position.x -= 0.04; rotY=0.1 }
      if(keys['d'] || keys['arrowright']) { player.position.x += 0.04; rotY=-0.1 }
      player.rotation.y = THREE.MathUtils.lerp(player.rotation.y, rotY, 0.1);
      camera.position.lerp(new THREE.Vector3(player.position.x, 1.7, player.position.z+3), 0.08);
      camera.lookAt(player.position.x, 1, player.position.z);
      renderer.render(scene,camera);
    }
    animate();

    window.addEventListener('resize', ()=>{
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect=