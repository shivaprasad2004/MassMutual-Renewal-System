import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Float, Line, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const ParticleNetwork = () => {
  const points = useMemo(() => {
    const p = new Float32Array(300 * 3);
    for (let i = 0; i < 300; i++) {
      const theta = THREE.MathUtils.randFloatSpread(360);
      const phi = THREE.MathUtils.randFloatSpread(360);
      p[i * 3] = 10 * Math.sin(theta) * Math.cos(phi);
      p[i * 3 + 1] = 10 * Math.sin(theta) * Math.sin(phi);
      p[i * 3 + 2] = 10 * Math.cos(theta);
    }
    return p;
  }, []);

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points positions={points} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#3b82f6"
          size={0.05}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.6}
        />
      </Points>
    </group>
  );
};

const ConnectingLines = () => {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.1;
    }
  });

  const lines = useMemo(() => {
    const l = [];
    for (let i = 0; i < 20; i++) {
      const start = [
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      ];
      const end = [
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      ];
      l.push({ start, end });
    }
    return l;
  }, []);

  return (
    <group ref={ref}>
      {lines.map((line, i) => (
        <Line
          key={i}
          points={[line.start, line.end]}
          color={i % 2 === 0 ? "#fbbf24" : "#1e40af"} // Gold and Blue
          lineWidth={1}
          transparent
          opacity={0.3}
        />
      ))}
    </group>
  );
};

const GlowingCore = () => {
    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <Sphere args={[1.5, 32, 32]} position={[0,0,0]}>
                <MeshDistortMaterial
                    color="#0f172a"
                    emissive="#1e3a8a"
                    emissiveIntensity={0.5}
                    distort={0.4}
                    speed={2}
                    wireframe
                />
            </Sphere>
            <Sphere args={[1.4, 32, 32]} position={[0,0,0]}>
                <meshStandardMaterial color="#000000" />
            </Sphere>
        </Float>
    )
}

const StealthNetworkScene = () => {
  return (
    <div className="absolute inset-0 z-0 bg-black">
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <fog attach="fog" args={['black', 10, 25]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#3b82f6" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#fbbf24" />
        
        <ParticleNetwork />
        <ConnectingLines />
        <GlowingCore />
        
      </Canvas>
    </div>
  );
};

export default StealthNetworkScene;
