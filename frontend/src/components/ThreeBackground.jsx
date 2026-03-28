import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Sparkles, Float } from '@react-three/drei';
import * as THREE from 'three';

const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
};

const DataFlowParticles = ({ count = 30 }) => {
  const ref = useRef();
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 20;
      p[i * 3 + 1] = Math.random() * 20 - 10;
      p[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return p;
  }, [count]);

  useFrame(() => {
    if (!ref.current) return;
    const arr = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] -= 0.02; // Move down
      if (arr[i * 3 + 1] < -10) arr[i * 3 + 1] = 10; // Reset to top
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.08} color="#3b82f6" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
};

const ParticleNetwork = ({ count = 100 }) => {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 30;
      p[i * 3 + 1] = (Math.random() - 0.5) * 20;
      p[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    return p;
  }, [count]);

  const pointsRef = useRef();
  const linesRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (pointsRef.current) {
      pointsRef.current.rotation.y = t * 0.05;
      pointsRef.current.rotation.x = Math.sin(t * 0.1) * 0.05;
    }
    if (linesRef.current) {
      linesRef.current.rotation.y = t * 0.05;
      linesRef.current.rotation.x = Math.sin(t * 0.1) * 0.05;
    }
  });

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={count} array={points} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.15} color="#fbbf24" transparent opacity={0.8} sizeAttenuation />
      </points>

      <group ref={linesRef}>
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
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(1.2, 1.6, 0.05)]} />
          <lineBasicMaterial color="#3b82f6" transparent opacity={0.3} />
        </lineSegments>
      </mesh>
    </Float>
  );
};

const PulsingAmbient = () => {
  const lightRef = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (lightRef.current) {
      lightRef.current.intensity = 0.2 + Math.sin(t * 0.5) * 0.05;
    }
  });
  return <ambientLight ref={lightRef} intensity={0.2} />;
};

const ThreeBackground = () => {
  const isMobile = useResponsive();
  const particleCount = isMobile ? 60 : 150;
  const dataFlowCount = isMobile ? 15 : 30;
  const starCount = isMobile ? 1500 : 3000;
  const sparkleCount = isMobile ? 40 : 80;

  return (
    <div className="fixed inset-0 z-[-1] bg-[#020617] pointer-events-none">
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <fog attach="fog" args={['#020617', 5, 25]} />
        <PulsingAmbient />
        <pointLight position={[10, 10, 10]} intensity={1} color="#fbbf24" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />

        <ParticleNetwork count={particleCount} />
        <DataFlowParticles count={dataFlowCount} />

        <FloatingDocument position={[-6, 2, -6]} rotation={[0.2, 0.5, 0]} delay={0} />
        <FloatingDocument position={[6, -1, -5]} rotation={[-0.2, -0.5, 0]} delay={2} />
        {!isMobile && (
          <>
            <FloatingDocument position={[5, 3, -8]} rotation={[0.1, 0.2, 0]} delay={4} />
            <FloatingDocument position={[-5, -3, -7]} rotation={[-0.1, -0.3, 0]} delay={1} />
          </>
        )}

        <Stars radius={100} depth={50} count={starCount} factor={4} saturation={0} fade speed={1} />
        <Sparkles count={sparkleCount} scale={15} size={2} speed={0.4} opacity={0.5} color="#fbbf24" />
      </Canvas>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]"></div>
    </div>
  );
};

export default ThreeBackground;
