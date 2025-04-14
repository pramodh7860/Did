import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';

interface AIAnimationProps {
  type?: 'neurons' | 'particles' | 'dna' | 'blocks';
  color?: string;
  className?: string;
  scale?: number;
}

const AIAnimation = ({ 
  type = 'neurons', 
  color = '#00ffff', 
  className = '',
  scale = 1
}: AIAnimationProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Initialize Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.z = 5;
    
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);
    
    // Add responsive behavior
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Create the animation based on the type
    let particles: THREE.Points | undefined;
    let neuronLines: THREE.Line[] = [];
    let dnaHelix: THREE.Group | undefined;
    let blocks: THREE.Group | undefined;
    
    const colorValue = new THREE.Color(color);
    
    if (type === 'particles') {
      // Create particles effect
      const particlesGeometry = new THREE.BufferGeometry();
      const particleCount = 500;
      const posArray = new Float32Array(particleCount * 3);
      
      for (let i = 0; i < particleCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 10 * scale;
      }
      
      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      
      const particleMaterial = new THREE.PointsMaterial({
        size: 0.05,
        color: colorValue,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
      });
      
      particles = new THREE.Points(particlesGeometry, particleMaterial);
      scene.add(particles);
    }
    
    if (type === 'neurons') {
      // Create neuron network effect
      const nodeCount = 30;
      const nodes: THREE.Vector3[] = [];
      const nodeMaterial = new THREE.PointsMaterial({
        size: 0.1,
        color: colorValue,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
      });
      
      // Create nodes
      for (let i = 0; i < nodeCount; i++) {
        const x = (Math.random() - 0.5) * 10 * scale;
        const y = (Math.random() - 0.5) * 10 * scale;
        const z = (Math.random() - 0.5) * 5 * scale;
        nodes.push(new THREE.Vector3(x, y, z));
      }
      
      // Create node points
      const nodeGeometry = new THREE.BufferGeometry().setFromPoints(nodes);
      const nodePoints = new THREE.Points(nodeGeometry, nodeMaterial);
      scene.add(nodePoints);
      
      // Create connections between close nodes
      for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
          if (nodes[i].distanceTo(nodes[j]) < 3 * scale) {
            const lineGeometry = new THREE.BufferGeometry().setFromPoints([nodes[i], nodes[j]]);
            const lineMaterial = new THREE.LineBasicMaterial({ 
              color: colorValue,
              transparent: true,
              opacity: 0.3,
              blending: THREE.AdditiveBlending
            });
            const line = new THREE.Line(lineGeometry, lineMaterial);
            neuronLines.push(line);
            scene.add(line);
          }
        }
      }
    }
    
    if (type === 'dna') {
      // Create DNA helix
      dnaHelix = new THREE.Group();
      const radius = 1.5 * scale;
      const height = 5 * scale;
      const segments = 40;
      const baseDistance = height / segments;
      
      // Create the two strands
      for (let i = 0; i < 2; i++) {
        const points: THREE.Vector3[] = [];
        const strandOffset = Math.PI * i; // 180 degrees offset between strands
        
        for (let j = 0; j <= segments; j++) {
          const angle = (j / segments) * Math.PI * 8 + strandOffset;
          const x = Math.cos(angle) * radius;
          const y = (j / segments) * height - (height / 2);
          const z = Math.sin(angle) * radius;
          points.push(new THREE.Vector3(x, y, z));
        }
        
        const strandGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const strandMaterial = new THREE.LineBasicMaterial({ 
          color: colorValue,
          transparent: true,
          opacity: 0.8
        });
        const strand = new THREE.Line(strandGeometry, strandMaterial);
        dnaHelix.add(strand);
      }
      
      // Add the connections between strands (base pairs)
      for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 8;
        const y = (i / segments) * height - (height / 2);
        
        const x1 = Math.cos(angle) * radius;
        const z1 = Math.sin(angle) * radius;
        
        const x2 = Math.cos(angle + Math.PI) * radius;
        const z2 = Math.sin(angle + Math.PI) * radius;
        
        const baseGeometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(x1, y, z1),
          new THREE.Vector3(x2, y, z2)
        ]);
        
        const baseMaterial = new THREE.LineBasicMaterial({ 
          color: colorValue,
          transparent: true,
          opacity: 0.4
        });
        
        const basePair = new THREE.Line(baseGeometry, baseMaterial);
        dnaHelix.add(basePair);
      }
      
      scene.add(dnaHelix);
    }
    
    if (type === 'blocks') {
      // Create digital blocks effect
      blocks = new THREE.Group();
      const blockCount = 30;
      
      for (let i = 0; i < blockCount; i++) {
        const size = Math.random() * 0.5 + 0.1;
        const x = (Math.random() - 0.5) * 10 * scale;
        const y = (Math.random() - 0.5) * 10 * scale;
        const z = (Math.random() - 0.5) * 5 * scale;
        
        const geometry = new THREE.BoxGeometry(size, size, size);
        const material = new THREE.MeshBasicMaterial({ 
          color: colorValue,
          transparent: true,
          opacity: Math.random() * 0.5 + 0.3,
          wireframe: Math.random() > 0.5
        });
        
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(x, y, z);
        cube.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        );
        
        // Store animation parameters in userData
        cube.userData = {
          rotationSpeed: {
            x: (Math.random() - 0.5) * 0.01,
            y: (Math.random() - 0.5) * 0.01,
            z: (Math.random() - 0.5) * 0.01
          },
          movementSpeed: {
            x: (Math.random() - 0.5) * 0.005,
            y: (Math.random() - 0.5) * 0.005,
            z: (Math.random() - 0.5) * 0.005
          }
        };
        
        blocks.add(cube);
      }
      
      scene.add(blocks);
    }
    
    // Animation loop
    const animate = () => {
      if (type === 'particles' && particles) {
        particles.rotation.x += 0.001;
        particles.rotation.y += 0.002;
      }
      
      if (type === 'neurons') {
        // Pulse effect for neuron lines
        neuronLines.forEach((line, index) => {
          const material = line.material as THREE.LineBasicMaterial;
          material.opacity = 0.1 + Math.sin(Date.now() * 0.001 + index * 0.2) * 0.2;
        });
      }
      
      if (type === 'dna' && dnaHelix) {
        dnaHelix.rotation.y += 0.01;
      }
      
      if (type === 'blocks' && blocks) {
        blocks.children.forEach(child => {
          const cube = child as THREE.Mesh;
          // Apply rotation
          cube.rotation.x += cube.userData.rotationSpeed.x;
          cube.rotation.y += cube.userData.rotationSpeed.y;
          cube.rotation.z += cube.userData.rotationSpeed.z;
          
          // Apply movement
          cube.position.x += cube.userData.movementSpeed.x;
          cube.position.y += cube.userData.movementSpeed.y;
          cube.position.z += cube.userData.movementSpeed.z;
          
          // Reset position if too far away
          const distance = cube.position.length();
          if (distance > 8 * scale) {
            cube.position.multiplyScalar(0.8);
          }
        });
      }
      
      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      // Clean up Three.js objects
      scene.clear();
      if (particles) {
        (particles.geometry as THREE.BufferGeometry).dispose();
        (particles.material as THREE.Material).dispose();
      }
      
      neuronLines.forEach(line => {
        (line.geometry as THREE.BufferGeometry).dispose();
        (line.material as THREE.Material).dispose();
      });
      
      if (dnaHelix) {
        dnaHelix.traverse(child => {
          if (child instanceof THREE.Mesh || child instanceof THREE.Line) {
            (child.geometry as THREE.BufferGeometry).dispose();
            (child.material as THREE.Material).dispose();
          }
        });
      }
      
      if (blocks) {
        blocks.traverse(child => {
          if (child instanceof THREE.Mesh) {
            (child.geometry as THREE.BufferGeometry).dispose();
            (child.material as THREE.Material).dispose();
          }
        });
      }
    };
  }, [type, color, scale]);
  
  return (
    <motion.div 
      ref={containerRef} 
      className={`absolute inset-0 pointer-events-none z-0 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    />
  );
};

export default AIAnimation;