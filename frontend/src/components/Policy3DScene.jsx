import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, MeshDistortMaterial, Stars, Sparkles } from '@react-three/drei';

const ShieldModel = () => {
  const mesh = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    mesh.current.rotation.y = t * 0.2;
    mesh.current.rotation.z = Math.sin(t * 0.5) * 0.05;
  });

  return (
    <group ref={mesh}>
      {/* Main Shield Body (using a distorted sphere/icosahedron to look organic/techy) */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[2, 0, 4, 6]} />
        <meshStandardMaterial 
            color="#1e293b" 
            emissive="#3b82f6"
            emissiveIntensity={0.2}
            roughness={0.2}
            metalness={0.8}
            wireframe={false}
        />
      </mesh>
      
      {/* Wireframe Overlay */}
      <mesh position={[0, 0, 0]} scale={1.05}>
        <cylinderGeometry args={[2, 0, 4, 6]} />
        <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.3} />
      </mesh>

      {/* Floating Elements representing Policy Data */}
      {[...Array(5)].map((_, i) => (
        <Float key={i} speed={2} rotationIntensity={1} floatIntensity={1} position={[0, i - 2, 0]}>
           <mesh position={[Math.sin(i)*3, Math.cos(i)*2, Math.cos(i)*2]}>
              <boxGeometry args={[0.5, 0.5, 0.5]} />
              <meshStandardMaterial color={i % 2 === 0 ? "#fbbf24" : "#3b82f6"} />
           </mesh>
        </Float>
      ))}
    </group>
  );
};

const Policy3DScene = () => {
  return (
    <div className="absolute inset-0 w-full h-full bg-slate-900">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#3b82f6" />
        <pointLight position={[-10, -5, -10]} intensity={0.5} color="#fbbf24" />
        
        <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
        <Sparkles count={50} scale={5} size={2} speed={0.4} opacity={0.5} color="#3b82f6" />
        
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
           <ShieldModel />
        </Float>
      </Canvas>
      
      {/* Overlay Gradient for seamless blending */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20 pointer-events-none"></div>
    </div>
  );
};

export default Policy3DScene;
