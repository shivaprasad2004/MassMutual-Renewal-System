import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Sparkles, Float } from '@react-three/drei';
import * as THREE from 'three';

const ParticleNetwork = ({ count = 100 }) => {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 30; // x
      p[i * 3 + 1] = (Math.random() - 0.5) * 20; // y
      p[i * 3 + 2] = (Math.random() - 0.5) * 15; // z
    }
    return p;
  }, [count]);

  const linesGeometry = useMemo(() => {
    return new THREE.BufferGeometry();
  }, []);

  const pointsRef = useRef();
  const linesRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Rotate points slowly
    if (pointsRef.current) {
      pointsRef.current.rotation.y = t * 0.05;
      pointsRef.current.rotation.x = Math.sin(t * 0.1) * 0.05;
    }
    
    // Update lines (simplified plexus effect)
    // For a real plexus we need to calculate distances every frame which is expensive
    // Instead we will just rotate a static line set or skip lines for performance
    // Let's do a static rotation for now to keep it efficient
    if (linesRef.current) {
        linesRef.current.rotation.y = t * 0.05;
        linesRef.current.rotation.x = Math.sin(t * 0.1) * 0.05;
    }
  });

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={points}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.15}
          color="#fbbf24"
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>
      
      {/* Abstract Financial Lines - Representing data flow */}
      <group ref={linesRef}>
         {/* Vertical Data Streams */}
         {[...Array(20)].map((_, i) => (
            <mesh key={i} position={[(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10]}>
               <boxGeometry args={[0.02, Math.random() * 5 + 2, 0.02]} />
               <meshBasicMaterial color="#334155" transparent opacity={0.3} />
            </mesh>
         ))}
      </group>
    </group>
  );
};

const FloatingDocument = ({ position, rotation, delay }) => {
  const mesh = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    mesh.current.position.y = position[1] + Math.sin(t + delay) * 0.3;
    mesh.current.rotation.x = rotation[0] + Math.sin(t * 0.5) * 0.1;
    mesh.current.rotation.y = rotation[1] + t * 0.1;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={mesh} position={position} rotation={rotation}>
        <boxGeometry args={[1.2, 1.6, 0.05]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} borderAlpha={0.5} />
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(1.2, 1.6, 0.05)]} />
          <lineBasicMaterial color="#3b82f6" transparent opacity={0.3} />
        </lineSegments>
      </mesh>
    </Float>
  );
};

const ThreeBackground = () => {
  return (
    <div className="fixed inset-0 z-[-1] bg-[#020617] pointer-events-none">
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <fog attach="fog" args={['#020617', 5, 25]} />
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#fbbf24" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
        
        <ParticleNetwork count={150} />
        
        {/* Floating "Policies" in the background */}
        <FloatingDocument position={[-6, 2, -6]} rotation={[0.2, 0.5, 0]} delay={0} />
        <FloatingDocument position={[6, -1, -5]} rotation={[-0.2, -0.5, 0]} delay={2} />
        <FloatingDocument position={[5, 3, -8]} rotation={[0.1, 0.2, 0]} delay={4} />
        <FloatingDocument position={[-5, -3, -7]} rotation={[-0.1, -0.3, 0]} delay={1} />
        
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        <Sparkles count={80} scale={15} size={2} speed={0.4} opacity={0.5} color="#fbbf24" />
      </Canvas>
      
      {/* Vignette Overlay for Depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]"></div>
    </div>
  );
};

export default ThreeBackground;
