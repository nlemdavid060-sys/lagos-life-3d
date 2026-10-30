"use client";
import { useEffect, useRef, useState } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";
import * as THREE from "three";

const firebaseConfig = {
  apiKey: "AIzaSyDx9jKUOWmTVilh-lfpFXj3Qe9u4dGZrLA",
  authDomain: "lagos-life-3d-5dd27.firebaseapp.com",
  projectId: "lagos-life-3d-5dd27",
  storageBucket: "lagos-life-3d-5dd27.firebasestorage.app",
  messagingSenderId: "830492531228",
  appId: "1:830492531228:web:f116e3b2028d60e0371dd9",
  measurementId: "G-19SKJ08SL7"
};

export default function LagosLife3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [dist, setDist] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [finalDist, setFinalDist] = useState(0);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [playerName, setPlayerName] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const gameState = useRef({ score:0, dist:0, over:false, joyX:0, playerX:0, playerZ:0, velY:0, grounded:true, speed:0.32 });

  const loadLeaderboard = async (db:any) => {
    try {
      const q = query(collection(db, "lagos-leaderboard"), orderBy("score","desc"), limit(10));
      const snap = await getDocs(q);
      const data:any[] = []; snap.forEach(d=>data.push(d.data()));
      setLeaderboard(data);
    } catch {}
  };

  useEffect(()=>{
    if (!canvasRef.current) return;
    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);
    signInAnonymously(auth).catch(()=>{});
    loadLeaderboard(db);
    const interval = setInterval(()=>loadLeaderboard(db), 8000);

    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 30, 95);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias:true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled=true;
    const camera = new THREE.PerspectiveCamera(65, window.innerWidth/window.innerHeight, 0.1, 200);
    const light = new THREE.DirectionalLight(0xffffff, 1.2);
    light.position.set(10,20,10); light.castShadow=true; scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff,0.7));

    const road = new THREE.Mesh(new THREE.PlaneGeometry(20, 1000), new THREE.MeshStandardMaterial({color:0x1e293b}));
    road.rotation.x=-Math.PI/2; road.position.z=250; road.receiveShadow=true; scene.add(road);
    for(let i=0;i<250;i++){
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.6,0.05,3), new THREE.MeshStandardMaterial({color:0xfacc15}));
      m.position.set(0,0.02,i*4); scene.add(m);
    }

    const playerGroup = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.4,0.8,4,8), new THREE.MeshStandardMaterial({color:0x16a34a}));
    body.position.y=0.9; body.castShadow=true; playerGroup.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.35), new THREE.MeshStandardMaterial({color:0xfde68a}));
    head.position.y=1.7; playerGroup.add(head);
    scene.add(playerGroup);

    let coins: THREE.Mesh[] = [];
    let obstacles: THREE.Mesh[] = [];
    const spawnCoin = (z:number)=>{ const c=new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.4,0.15,12), new THREE.MeshStandardMaterial({color:0xfacc15})); c.rotation.x=Math.PI/2; c.position.set((Math.random()-0.5)*6,0.8,z); c.castShadow=true; scene.add(c); coins.push(c); };
    const spawnObs = (z:number)=>{ const isDanfo=Math.random()>0.5; const b=new THREE.Mesh(new THREE.BoxGeometry(isDanfo?2.2:1, isDanfo?1.6:1, isDanfo?3.2:1), new THREE.MeshStandardMaterial({color:isDanfo?0xfacc15:0xef4444})); b.position.set((Math.random()-0.5)*6, isDanfo?0.9:0.6, z); b.castShadow=true; scene.add(b); obstacles.push(b); };
    for(let i=0;i<80;i++){ if(Math.random()<0.6) spawnCoin(10+i*4); if(Math.random()<0.35) spawnObs(12+i*6); }

    const animate = () => {
      if(gameState.current.over) return;
      requestAnimationFrame(animate);
      gameState.current.dist+=gameState.current.speed;
      gameState.current.playerZ+=gameState.current.speed;
      gameState.current.playerX+=gameState.current.joyX*0.13;
      gameState.current.playerX=Math.max(-4.5,Math.min(4.5,gameState.current.playerX));
      gameState.current.velY-=0.028; playerGroup.position.y+=gameState.current.velY;
      if(playerGroup.position.y<=0){ playerGroup.position.y=0; gameState.current.velY=0; gameState.current.grounded=true; }
      for(let i=coins.length-1;i>=0;i--){ const c=coins[i]; if(Math.abs(c.position.z-gameState.current.playerZ)<1 && Math.abs(c.position.x-gameState.current.playerX)<1.2){ gameState.current.score+=10; scene.remove(c); coins.splice(i,1); spawnCoin(gameState.current.playerZ+70+Math.random()*20); } }
      for(let o of obstacles){ if(Math.abs(o.position.z-gameState.current.playerZ)<1.3 && Math.abs(o.position.x-gameState.current.playerX)<1.4){ gameState.current.over=true; setFinalScore(gameState.current.score); setFinalDist(Math.floor(gameState.current.dist)); setGameOver(true); return; } }
      if(coins[0] && coins[0].position.z < gameState.current.playerZ-15){ scene.remove(coins[0]); coins.shift(); spawnCoin(gameState.current.playerZ+80); }
      if(obstacles[0] && obstacles[0].position.z < gameState.current.playerZ-15){ scene.remove(obstacles[0]); obstacles.shift(); spawnObs(gameState.current.playerZ+85); }
      playerGroup.position.x=THREE.MathUtils.lerp(playerGroup.position.x, gameState.current.playerX, 0.15);
      playerGroup.position.z=gameState.current.playerZ;
      camera.position.set(playerGroup.position.x*0.3, 4+playerGroup.position.y, gameState.current.playerZ-8);
      camera.lookAt(playerGroup.position.x,1,gameState.current.playerZ+6);
      setScore(gameState.current.score); setDist(Math.floor(gameState.current.dist));
      renderer.render(scene,camera);
    };
    animate();

    const handleResize = ()=>{ renderer.setSize(window.innerWidth, window.innerHeight); camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); };
    window.addEventListener('resize', handleResize);

    const joy = document.getElementById('joy'); const stick=document.getElementById('stick');
    let active=false;
    const onMove = (e:any)=>{ if(!active) return; const r=(joy as any).getBoundingClientRect(); const t=e.touches?e.touches[0]:e; let x=t.clientX-(r.left+r.width/2); x=Math.max(-40,Math.min(40,x)); gameState.current.joyX=x/40; if(stick) (stick as any).style.left=(35+x)+'px'; };
    joy?.addEventListener('touchstart', ()=>active=true); joy?.addEventListener('touchmove', onMove); joy?.addEventListener('touchend', ()=>{active=false; gameState.current.joyX=0; if(stick) (stick as any).style.left='35px';});

    return ()=>{ clearInterval(interval); window.removeEventListener('resize', handleResize); };
  },[]);

  const saveScore = async () => {
    try {
      const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
      const db = getFirestore(app);
      setSaveStatus("Saving...");
      await addDoc(collection(db,"lagos-leaderboard"),{ name: playerName || "Lagos Hustler", score: finalScore, distance: finalDist, createdAt: serverTimestamp() });
      setSaveStatus("✅ Saved! You dey leaderboard now!");
      const q = query(collection(db, "lagos-leaderboard"), orderBy("score","desc"), limit(10));
      const snap = await getDocs(q); const data:any[]=[]; snap.forEach(d=>data.push(d.data())); setLeaderboard(data);
    } catch(e:any){ setSaveStatus("Error: "+e.message); }
  };

  return (
    <div style={{position:'relative', width:'100vw', height:'100vh', overflow:'hidden', background:'#0f172a'}}>
      <canvas ref={canvasRef} style={{display:'block', width:'100%', height:'100%'}} />
      <div style={{position:'absolute', inset:0, pointerEvents:'none'}}>
        <div style={{position:'absolute', top:12, left:12, right:12, display:'flex', justifyContent:'space-between', gap:12}}>
          <div style={{background:'rgba(0,0,0,0.7)', borderRadius:16, padding:'12px 16px', flex:1, color:'white', fontWeight:800}}>💰 {score} COINS<br/><small>🏃 {dist}m • LIVE DB</small></div>
          <div style={{background:'rgba(0,0,0,0.7)', borderRadius:16, padding:'12px 16px', color:'white', textAlign:'right'}}>🏙️ LAGOS-LIFE-3D<br/><small style={{color:'#4ade80'}}>● Firebase Live</small></div>
        </div>
        <div style={{position:'absolute', right:12, top:80, width:190, maxHeight:'40vh', overflow:'auto', background:'rgba(0,0,0,0.7)', borderRadius:16, padding:12, color:'white', fontSize:11}}>
          <div style={{fontWeight:900, marginBottom:6}}>🏆 TOP HUSTLERS</div>
          {leaderboard.length===0 ? <small>No scores yet. Be first!</small> : leaderboard.map((l,i)=><div key={i}>{i+1}. {l.name} - {l.score}</div>)}
        </div>
        <div id="joy" style={{position:'absolute', bottom:20, left:20, width:120, height:120, background:'rgba(255,255,255,0.15)', borderRadius:'50%', pointerEvents:'auto'}}><div id="stick" style={{width:50, height:50, background:'white', borderRadius:'50%', position:'absolute', left:35, top:35}}></div></div>
        <button onPointerDown={()=>{ if(gameState.current.grounded){ gameState.current.velY=0.4; gameState.current.grounded=false; }}} style={{position:'absolute', bottom:20, right:20, pointerEvents:'auto', padding:'18px 24px', borderRadius:20, border:'none', background:'rgba(0,0,0,0.7)', color:'white', fontSize:20, fontWeight:900}}>⬆️ JUMP</button>
      </div>
      {gameOver && (
        <div style={{position:'absolute', inset:0, display:'grid', placeItems:'center', background:'rgba(0,0,0,0.85)', zIndex:20}}>
          <div style={{width:'90%', maxWidth:360, background:'rgba(30,30,30,0.9)', borderRadius:24, padding:20, textAlign:'center'}}>
            <h1 style={{color:'white', fontSize:26, fontWeight:900}}>Omo! Danfo jam you! 😅</h1>
            <p style={{color:'#94a3b8', margin:'12px 0'}}>You run {finalDist}m, collect {finalScore} coins</p>
            <input value={playerName} onChange={e=>setPlayerName(e.target.value)} placeholder="Your Street Name (Mushin Boy)" style={{width:'100%', padding:12, borderRadius:12, border:'none', margin:'8px 0', color:'black'}} />
            <button onClick={saveScore} style={{width:'100%', background:'#16a34a', color:'white', border:'none', padding:'14px', borderRadius:999, fontWeight:900, cursor:'pointer'}}>💾 SAVE TO LIVE LEADERBOARD</button>
            <div style={{color:'#4ade80', fontSize:12, marginTop:8}}>{saveStatus}</div>
            <button onClick={()=>location.reload()} style={{width:'100%', marginTop:12, background:'white', color:'black', border:'none', padding:'14px', borderRadius:999, fontWeight:900, cursor:'pointer'}}>🔁 PLAY AGAIN</button>
            <div style={{marginTop:10, fontSize:10, color:'#64748b'}}>DB: nam5 • lagos-life-3d-5dd27 • GAME COINS ONLY</div>
          </div>
        </div>
      )}
    </div>
  );
}