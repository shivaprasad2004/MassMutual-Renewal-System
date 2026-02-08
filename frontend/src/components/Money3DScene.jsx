import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, Text, useMatcapTexture, Environment } from '@react-three/drei';
import * as THREE from 'three';

const Coin = ({ position, rotation, scale = 1 }) => {
  const mesh = useRef();
  
  useFrame((state) => {
    mesh.current.rotation.y += 0.02;
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group position={position} rotation={rotation} scale={scale}>
        {/* Coin Edge */}
        <mesh ref={mesh} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1, 1, 0.2, 32]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Coin Face Detail */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
           <cylinderGeometry args={[0.8, 0.8, 0.21, 32]} />
           <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    </Float>
  );
};

const CurrencySymbol = ({ symbol, position, color, size = 1 }) => {
  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <Text
        position={position}
        fontSize={size}
        color={color}
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        {symbol}
      </Text>
    </Float>
  );
};

const BarGraph = () => {
  return (
    <group position={[2, -2, -2]} rotation={[0, -0.5, 0]}>
       <mesh position={[-1.5, 0.5, 0]}>
         <boxGeometry args={[0.8, 1, 0.8]} />
         <meshStandardMaterial color="#1e3a8a" transparent opacity={0.8} />
       </mesh>
       <mesh position={[0, 1.5, 0]}>
         <boxGeometry args={[0.8, 3, 0.8]} />
         <meshStandardMaterial color="#2563eb" transparent opacity={0.8} />
       </mesh>
       <mesh position={[1.5, 2.5, 0]}>
         <boxGeometry args={[0.8, 5, 0.8]} />
         <meshStandardMaterial color="#60a5fa" transparent opacity={0.8} />
       </mesh>
    </group>
  );
};

const Money3DScene = () => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#fbbf24" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
        
        {/* Floating Coins */}
        <Coin position={[-3, 2, 0]} rotation={[0, 0, 0.5]} scale={1.2} />
        <Coin position={[3, -1, 2]} rotation={[0.5, 0, 0]} scale={1} />
        <Coin position={[-2, -3, -2]} rotation={[0, 0.5, 0]} scale={0.8} />
        
        {/* Currency Symbols */}
        <CurrencySymbol symbol="$" position={[0, 0, 0]} color="#10b981" size={3} />
        <CurrencySymbol symbol="€" position={[4, 3, -2]} color="#60a5fa" size={1.5} />
        <CurrencySymbol symbol="£" position={[-4, -1, -3]} color="#a78bfa" size={1.5} />
        <CurrencySymbol symbol="¥" position={[2, -3, 1]} color="#f472b6" size={1.2} />
        
        {/* Rising Graph */}
        <BarGraph />
        
        <Environment preset="city" />
      </Canvas>
    </div>
  );
};

export default Money3DScene;
