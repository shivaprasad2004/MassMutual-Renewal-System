import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, Sparkles, PerspectiveCamera, MeshDistortMaterial, Line, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

const NetworkNode = ({ position, color, label }) => {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <mesh position={position}>
        <icosahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} wireframe />
      </mesh>
      {label && (
        <Html position={[0.4, 0.4, 0]} distanceFactor={10}>
          <div className="text-[10px] text-white/70 font-mono tracking-widest uppercase bg-black/50 backdrop-blur-sm px-2 py-1 rounded border border-white/10">
            {label}
          </div>
        </Html>
      )}
    </Float>
  );
};

const FinanceGlobe = () => {
  const mesh = useRef();
  const coreRef = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    mesh.current.rotation.y = t * 0.05;
    coreRef.current.rotation.y = t * 0.1;
    coreRef.current.rotation.z = Math.sin(t * 0.2) * 0.1;
  });

  const points = useMemo(() => {
    return new Array(20).fill(0).map(() => {
      const phi = Math.acos(-1 + (2 * Math.random()));
      const theta = Math.sqrt(20 * Math.PI) * phi;
      return new THREE.Vector3().setFromSphericalCoords(4.5, phi, theta);
    });
  }, []);

  return (
    <group ref={mesh}>
      {/* Main Wireframe Globe */}
      <mesh>
        <sphereGeometry args={[4, 32, 32]} />
        <meshStandardMaterial 
          color="#1e293b" 
          wireframe 
          transparent 
          opacity={0.1} 
        />
      </mesh>
      
      {/* Inner Core with Distortion */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[3, 64, 64]} />
        <MeshDistortMaterial 
          color="#3b82f6" 
          speed={2} 
          distort={0.4} 
          radius={1}
          wireframe
          transparent
          opacity={0.05}
        />
      </mesh>

      {/* Orbiting Nodes */}
      <NetworkNode position={[4.5, 1, 0]} color="#fbbf24" label="Finance" />
      <NetworkNode position={[-4, 2, 2]} color="#3b82f6" label="Policy" />
      <NetworkNode position={[0, -4.5, 1]} color="#10b981" label="Growth" />
      <NetworkNode position={[2, 3, -3]} color="#ef4444" label="Risk" />
      <NetworkNode position={[-3, -2, -3]} color="#8b5cf6" label="Identity" />

      {/* Connecting Lines */}
      {points.map((point, i) => (
         <Line 
           key={i} 
           points={[[0,0,0], point]} 
           color="#3b82f6" 
           transparent 
           opacity={0.05} 
           lineWidth={1} 
         />
      ))}
    </group>
  );
};

const GlobalNetworkScene = () => {
  return (
    <div className="absolute inset-0 z-0 bg-black w-full h-full">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 14]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#fbbf24" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#3b82f6" />
        <fog attach="fog" args={['black', 10, 30]} />
        
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        <Sparkles count={50} scale={10} size={2} speed={0.4} opacity={0.3} color="#fbbf24" />
        
        <group position={[-3.5, 0, 0]}>
          <FinanceGlobe />
        </group>
      </Canvas>
    </div>
  );
};

export default GlobalNetworkScene;
