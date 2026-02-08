import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, Sparkles, PerspectiveCamera, MeshDistortMaterial } from '@react-three/drei';

const FloatingShape = ({ position, color, speed = 1, distort = 0.5 }) => {
  const mesh = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    mesh.current.rotation.x = t * 0.2 * speed;
    mesh.current.rotation.y = t * 0.3 * speed;
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <mesh ref={mesh} position={position}>
        <icosahedronGeometry args={[1, 0]} />
        <MeshDistortMaterial 
          color={color} 
          speed={speed} 
          distort={distort} 
          radius={1} 
          metalness={0.8}
          roughness={0.2}
          wireframe={true}
        />
      </mesh>
    </Float>
  );
};

const AnimatedGlobe = () => {
  const mesh = useRef();
  useFrame((state) => {
    mesh.current.rotation.y += 0.005;
  });

  return (
    <mesh ref={mesh} position={[4, 0, -5]}>
      <sphereGeometry args={[2.5, 32, 32]} />
      <meshStandardMaterial 
        color="#1e293b" 
        wireframe 
        transparent 
        opacity={0.3} 
        emissive="#3b82f6"
        emissiveIntensity={0.5}
      />
    </mesh>
  );
};

const Landing3DScene = () => {
  return (
    <div className="fixed inset-0 z-0 bg-black">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#fbbf24" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#3b82f6" />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Sparkles count={100} scale={12} size={2} speed={0.4} opacity={0.5} color="#fbbf24" />
        
        <FloatingShape position={[-5, 2, -5]} color="#3b82f6" speed={2} />
        <FloatingShape position={[5, -2, -8]} color="#fbbf24" speed={1.5} distort={0.6} />
        <FloatingShape position={[0, 4, -10]} color="#ef4444" speed={1} distort={0.3} />
        
        <AnimatedGlobe />
      </Canvas>
    </div>
  );
};

export default Landing3DScene;
export { FloatingShape, AnimatedGlobe };
