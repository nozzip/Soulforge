/// <reference lib="dom" />
import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Physics, useBox, useSphere, usePlane } from '@react-three/cannon';
import { Environment, Text } from '@react-three/drei';
import * as THREE from 'three';

// Fix for React Three Fiber elements in TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      lineSegments: any;
      wireframeGeometry: any;
      lineBasicMaterial: any;
      primitive: any;
      ambientLight: any;
      spotLight: any;
      pointLight: any;
      planeGeometry: any;
      shadowMaterial: any;
    }
  }
}

// --- Types ---
type DieType = 4 | 6 | 8 | 10 | 12 | 20 | 100;

interface ActiveDie {
  id: string;
  sides: DieType;
  value: number | null;
}

interface RollHistoryItem {
  id: number;
  total: number;
  breakdown: string;
  timestamp: string;
}

const DICE_ICONS: Record<DieType, React.ReactNode> = {
  4: <path d="M24 2L2 38h44L24 2zm0 8.5l14 23.5H10L24 10.5z" />,
  6: <path d="M8 8h32v32H8V8zm4 4v24h24V12H12z" />,
  8: <path d="M24 2L4 24l20 22 20-22L24 2zm0 5l14 17-14 15.5L10 24 24 7z" />,
  10: <path d="M24 2L6 20l18 26 18-26L24 2zm0 5l13 13-13 19-13-19 13-13z" />,
  12: <path d="M24 2l11 8-4 13-14 0-4-13 11-8zm0 4l-7.5 5.5 2.8 8.5h9.4l2.8-8.5L24 6z" />, 
  20: <path d="M24 2l19 11-7 21-24 0-7-21L24 2zm0 4.5l-13 7.5 5 14h16l5-14-13-7.5z" />, 
  100: <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4" />,
};

// --- Materials ---
const resinMaterial = new THREE.MeshPhysicalMaterial({
  color: "#7f1d1d", // Deep blood red
  roughness: 0.05,
  metalness: 0.2,
  clearcoat: 1.0,
  clearcoatRoughness: 0.05,
  reflectivity: 0.8,
});

// --- Helpers ---
function getFaceData(geometry: THREE.BufferGeometry) {
  const faces: { position: THREE.Vector3; normal: THREE.Vector3 }[] = [];
  const posAttr = geometry.getAttribute('position');
  const index = geometry.getIndex();
  const uniqueCenters: string[] = [];

  const processTriangle = (i1: number, i2: number, i3: number) => {
    const v1 = new THREE.Vector3().fromBufferAttribute(posAttr, i1);
    const v2 = new THREE.Vector3().fromBufferAttribute(posAttr, i2);
    const v3 = new THREE.Vector3().fromBufferAttribute(posAttr, i3);

    const center = new THREE.Vector3().add(v1).add(v2).add(v3).divideScalar(3);
    const normal = new THREE.Vector3().crossVectors(
      new THREE.Vector3().subVectors(v2, v1),
      new THREE.Vector3().subVectors(v3, v1)
    ).normalize();

    const key = `${center.x.toFixed(2)},${center.y.toFixed(2)},${center.z.toFixed(2)}`;
    const isDuplicate = uniqueCenters.some(existingKey => {
        const [ex, ey, ez] = existingKey.split(',').map(Number);
        const dist = Math.sqrt((ex-center.x)**2 + (ey-center.y)**2 + (ez-center.z)**2);
        return dist < 0.45;
    });

    if (!isDuplicate) {
        uniqueCenters.push(key);
        faces.push({ position: center, normal });
    }
  };

  if (index) {
    for (let i = 0; i < index.count; i += 3) {
      processTriangle(index.getX(i), index.getX(i+1), index.getX(i+2));
    }
  } else {
    for (let i = 0; i < posAttr.count; i += 3) {
      processTriangle(i, i+1, i+2);
    }
  }
  return faces;
}

// --- 3D Components ---

const FaceNumbers = ({ faces, targetValue, sides }: { faces: any[], targetValue: number, sides: DieType }) => {
    return (
        <group>
            {faces.map((face, idx) => {
                const displayValue = idx + 1;
                // Only render the number that matches our target roll
                if (displayValue !== targetValue) return null;

                const label = sides === 100 ? ((targetValue - 1) * 10).toString() : targetValue.toString();
                const textPos = face.position.clone().add(face.normal.clone().multiplyScalar(0.1));
                
                return (
                    <Text
                        key={idx}
                        position={textPos}
                        rotation={new THREE.Euler().setFromQuaternion(
                            new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), face.normal)
                        )}
                        fontSize={sides === 20 ? 0.35 : 0.45}
                        color="#c5a059"
                        anchorX="center"
                        anchorY="middle"
                        font="https://fonts.gstatic.com/s/newsreader/v29/x3bmG966p4Z6R6p58p5p5p5p5p5p.woff" // Use serif font
                        depthOffset={-1}
                    >
                        {label}
                    </Text>
                );
            })}
        </group>
    );
};

const DieInstance = ({ type, position, velocity, targetValue, isSettling }: { 
    type: DieType, 
    position: [number, number, number], 
    velocity: [number, number, number],
    targetValue: number,
    isSettling: boolean
}) => {
    const isBox = type === 6;
    const radius = type === 20 ? 1.3 : 1.1;
    const mass = 2;
    
    // Explicitly define args type to satisfy strict typing
    const [ref, api] = (isBox ? useBox : useSphere)(() => ({ 
        mass, 
        position, 
        args: isBox ? [1.5, 1.5, 1.5] : [radius] as [number], 
        material: { friction: 0.1, restitution: 0.5 } 
    }));

    const geom = useMemo(() => {
        if (type === 6) return new THREE.BoxGeometry(1.5, 1.5, 1.5);
        if (type === 4) return new THREE.TetrahedronGeometry(1.3);
        if (type === 8) return new THREE.OctahedronGeometry(1.2);
        if (type === 10 || type === 100) return new THREE.OctahedronGeometry(1.2);
        if (type === 12) return new THREE.DodecahedronGeometry(1.2);
        return new THREE.IcosahedronGeometry(1.4);
    }, [type]);

    const faces = useMemo(() => getFaceData(geom), [geom]);
    
    // Smooth settle quaternion
    const targetQuat = useMemo(() => {
        const faceIdx = (targetValue - 1) % faces.length;
        const faceNormal = faces[faceIdx].normal.clone();
        return new THREE.Quaternion().setFromUnitVectors(faceNormal, new THREE.Vector3(0, 1, 0));
    }, [faces, targetValue]);

    useEffect(() => {
        if (api) {
            api.velocity.set(...velocity);
            api.angularVelocity.set(
                (Math.random() - 0.5) * 20, 
                (Math.random() - 0.5) * 20, 
                (Math.random() - 0.5) * 20
            );
        }
    }, [api, velocity]);

    // Use standard React.useRef to track quaternion and lerp state
    const currentQuat = useRef(new THREE.Quaternion());
    const lerpFactor = useRef(0);

    useFrame((state, delta) => {
        if (isSettling && api) {
            // Gradually transition from physics to target orientation
            lerpFactor.current = Math.min(lerpFactor.current + delta * 2, 1);
            
            // Kill velocities
            api.velocity.set(0, 0, 0);
            api.angularVelocity.set(0, 0, 0);

            // Directly set rotation via Euler if needed, but we'll use Quaternion for precision
            const targetEuler = new THREE.Euler().setFromQuaternion(targetQuat);
            api.rotation.set(targetEuler.x, targetEuler.y, targetEuler.z);
        }
    });

    const scale = (type === 10 || type === 100) ? [1, 1.4, 1] as [number, number, number] : [1, 1, 1] as [number, number, number];

    return (
        <group scale={scale}>
            <mesh ref={ref as any} castShadow>
                <primitive object={geom} attach="geometry" />
                <primitive object={resinMaterial} attach="material" />
                <FaceNumbers faces={faces} targetValue={targetValue} sides={type} />
                <lineSegments>
                    <wireframeGeometry args={[geom]} />
                    <lineBasicMaterial color="#c5a059" linewidth={1} transparent opacity={0.3} />
                </lineSegments>
            </mesh>
        </group>
    );
};

const Floor = () => {
    const [ref] = usePlane(() => ({ 
        rotation: [-Math.PI / 2, 0, 0], 
        position: [0, -5, 0],
        material: { friction: 0.1, restitution: 0.3 } 
    }));
    return (
        <mesh ref={ref as any} receiveShadow>
            <planeGeometry args={[100, 100]} />
            <shadowMaterial opacity={0.4} />
        </mesh>
    );
};

const Walls = () => {
    usePlane(() => ({ position: [0, 0, -15], rotation: [0, 0, 0] }));
    usePlane(() => ({ position: [0, 0, 15], rotation: [0, -Math.PI, 0] }));
    usePlane(() => ({ position: [-15, 0, 0], rotation: [0, Math.PI / 2, 0] }));
    usePlane(() => ({ position: [15, 0, 0], rotation: [0, -Math.PI / 2, 0] }));
    return null;
};

// --- Main Roller UI ---

const DiceRoller: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activePool, setActivePool] = useState<ActiveDie[]>([]);
    const [modifier, setModifier] = useState(0);
    const [isRolling, setIsRolling] = useState(false);
    const [isSettling, setIsSettling] = useState(false);
    const [rollHistory, setRollHistory] = useState<RollHistoryItem[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [totalResult, setTotalResult] = useState<number | null>(null);
    const [diceObjects, setDiceObjects] = useState<{ 
        id: string, 
        type: DieType, 
        position: [number,number,number], 
        velocity: [number,number,number],
        targetValue: number 
    }[]>([]);

    const addDie = (sides: DieType) => {
        if (activePool.length >= 12) return;
        if (totalResult !== null) {
            setTotalResult(null);
            setDiceObjects([]);
            setActivePool(prev => prev.map(d => ({ ...d, value: null })));
        }
        setActivePool(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), sides, value: null }]);
    };

    const removeDie = (id: string) => {
        setActivePool(prev => prev.filter(d => d.id !== id));
        if (activePool.length <= 1) setTotalResult(null);
    };

    const rollDice = () => {
        if (activePool.length === 0 || isRolling) return;
        setIsRolling(true);
        setIsSettling(false);
        setTotalResult(null);
        setDiceObjects([]);

        const results = activePool.map(die => ({
            ...die,
            value: Math.ceil(Math.random() * die.sides)
        }));

        const newDiceObjects = results.map((die, i) => ({
            id: die.id,
            type: die.sides,
            targetValue: die.value!,
            position: [(Math.random() - 0.5) * 8, 12 + i * 1.5, 8] as [number, number, number],
            velocity: [(Math.random() - 0.5) * 10, 5 + Math.random() * 10, -35 - Math.random() * 15] as [number, number, number]
        }));

        setTimeout(() => setDiceObjects(newDiceObjects), 50);

        // Timeline
        setTimeout(() => setIsSettling(true), 1900);

        setTimeout(() => {
            setActivePool(results);
            const grandTotal = results.reduce((acc, d) => acc + (d.value || 0), 0) + modifier;
            setTotalResult(grandTotal);

            const breakdown = results.reduce((acc: Record<string, number[]>, curr) => {
                const key = `d${curr.sides}`;
                if (!acc[key]) acc[key] = [];
                acc[key].push(curr.value || 0);
                return acc;
            }, {} as Record<string, number[]>);

            let breakdownString = (Object.entries(breakdown) as [string, number[]][])
                .map(([k, v]) => `${v.length}${k} (${v.join(', ')})`).join(' + ');
            if (modifier !== 0) breakdownString += ` ${modifier > 0 ? '+' : '-'} ${Math.abs(modifier)}`;

            setRollHistory(prev => [{ 
                id: Date.now(), 
                total: grandTotal, 
                breakdown: breakdownString, 
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
            }, ...prev].slice(0, 15));
            
            setIsRolling(false);
        }, 2700);
    };

    return (
        <>
            <div className={`fixed inset-0 z-[100] pointer-events-none transition-opacity duration-700 ${isRolling || totalResult !== null ? 'opacity-100' : 'opacity-0'}`}>
                {(isRolling || totalResult !== null) && (
                    <Canvas shadows camera={{ position: [0, 15, 15], fov: 45 }}>
                        <Suspense fallback={null}>
                            <ambientLight intensity={0.5} />
                            <spotLight position={[15, 25, 10]} angle={0.5} penumbra={1} intensity={1.8} castShadow shadow-mapSize={[1024, 1024]} />
                            <pointLight position={[-15, 20, -5]} intensity={1.2} color="#c5a059" />
                            
                            <Physics gravity={[0, -60, 0]} iterations={20}>
                                <Floor />
                                <Walls />
                                {diceObjects.map(die => (
                                    <DieInstance key={die.id} {...die} isSettling={isSettling} />
                                ))}
                            </Physics>
                            <Environment preset="night" />
                        </Suspense>
                    </Canvas>
                )}
            </div>

            <button onClick={() => setIsOpen(!isOpen)} className={`fixed bottom-6 left-6 z-[110] group flex items-center justify-center size-14 rounded-full border-2 border-accent-gold shadow-[0_0_20px_rgba(0,0,0,0.6)] transition-all duration-300 hover:scale-110 ${isOpen ? 'bg-accent-gold text-background-dark rotate-180' : 'bg-background-dark text-accent-gold'}`}>
                {isOpen ? <span className="material-symbols-outlined text-3xl">close</span> : <svg viewBox="0 0 48 48" className="size-8 fill-current">{DICE_ICONS[20]}</svg>}
            </button>

            <div className={`fixed bottom-24 left-6 z-[105] w-[350px] md:w-[400px] transition-all duration-300 transform origin-bottom-left ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
                <div className="bg-[#221010] border-2 border-accent-gold rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]">
                    <div className="bg-[#2d1b1b] p-4 border-b border-accent-gold/30 flex justify-between items-center">
                        <h3 className="font-bold text-accent-gold uppercase tracking-[0.2em] text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-xl">casino</span> Fate Weaver
                        </h3>
                        <div className="flex gap-2">
                            <button onClick={() => setShowHistory(!showHistory)} className={`p-1.5 rounded transition-colors ${showHistory ? 'text-accent-gold bg-white/5' : 'text-gray-500 hover:text-gray-300'}`} title="Roll History">
                                <span className="material-symbols-outlined text-xl">history</span>
                            </button>
                            {(activePool.length > 0 || modifier !== 0) && <button onClick={() => { setActivePool([]); setTotalResult(null); setModifier(0); }} className="text-[10px] text-red-500 hover:text-red-400 uppercase font-bold tracking-widest px-2">Reset</button>}
                        </div>
                    </div>

                    <div className="relative flex-1 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] bg-opacity-30 min-h-[320px] flex flex-col overflow-hidden">
                        {showHistory && (
                            <div className="absolute inset-0 z-20 bg-[#1a0f0f]/95 backdrop-blur-md p-6 overflow-y-auto animate-in fade-in duration-300">
                                <h4 className="text-accent-gold text-xs uppercase tracking-[0.3em] mb-6 border-b border-accent-gold/20 pb-2">Ancient Records</h4>
                                {rollHistory.length === 0 && <p className="text-gray-600 text-sm italic text-center py-10">No records found in this era.</p>}
                                <div className="space-y-4">
                                    {rollHistory.map(roll => (
                                        <div key={roll.id} className="flex justify-between items-start border-b border-white/5 pb-3">
                                            <div>
                                                <span className="text-white font-black text-2xl block">{roll.total}</span>
                                                <span className="text-gray-500 text-[10px] uppercase tracking-wider">{roll.breakdown}</span>
                                            </div>
                                            <span className="text-gray-700 text-[10px] font-mono">{roll.timestamp}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex-1 p-8 flex flex-wrap content-center justify-center gap-5 relative overflow-y-auto custom-scrollbar">
                            {activePool.length === 0 && !showHistory && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20 pointer-events-none">
                                    <span className="material-symbols-outlined text-7xl text-accent-gold mb-4">token</span>
                                    <p className="text-accent-gold text-xs uppercase tracking-[0.4em]">Select Thy Dice</p>
                                </div>
                            )}
                            {activePool.map((die) => (
                                <div key={die.id} onClick={() => !isRolling && removeDie(die.id)} className="relative size-14 flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all group">
                                    <svg viewBox="0 0 48 48" className="absolute inset-0 w-full h-full fill-current text-accent-gold/20 group-hover:text-primary transition-colors">{DICE_ICONS[die.sides]}</svg>
                                    <span className="relative z-10 font-black text-sm text-accent-gold">d{die.sides}</span>
                                    <div className="absolute -top-1 -right-1 size-4 bg-red-900 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="material-symbols-outlined text-[10px] text-white">close</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="h-24 flex items-center justify-center border-t border-accent-gold/10 bg-black/40 relative">
                            {isRolling ? (
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-accent-gold italic text-xs animate-pulse tracking-[0.2em]">Casting the Runes...</span>
                                    <div className="w-32 h-0.5 bg-accent-gold/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-accent-gold animate-[progress_2s_ease-in-out]"></div>
                                    </div>
                                </div>
                            ) : totalResult !== null ? (
                                <div className="text-center animate-in zoom-in slide-in-from-bottom-4 duration-500">
                                    <span className="text-gray-500 text-[10px] uppercase tracking-[0.5em] block mb-1">Result</span>
                                    <div className="flex items-baseline justify-center gap-3">
                                        <span className="text-5xl font-black text-white bg-clip-text text-transparent bg-gradient-to-b from-white to-accent-gold">{totalResult}</span>
                                        {modifier !== 0 && <span className="text-sm text-gray-500 font-serif italic">{modifier > 0 ? `(+${modifier})` : `(${modifier})`}</span>}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <div className="bg-[#2d1b1b] p-5 border-t border-accent-gold/30 space-y-5">
                        <div className="flex items-center justify-between bg-black/40 rounded-lg px-4 py-3 border border-accent-gold/10">
                            <span className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em]">Modifier</span>
                            <div className="flex items-center gap-4">
                                <button onClick={() => setModifier(m => m - 1)} className="text-accent-gold hover:text-white flex items-center justify-center size-8 rounded-full hover:bg-white/5 transition-colors border border-accent-gold/20"><span className="material-symbols-outlined text-lg">remove</span></button>
                                <input type="number" value={modifier} onChange={(e) => setModifier(parseInt((e.target as HTMLInputElement).value) || 0)} className="w-14 bg-transparent text-center text-white font-black text-lg outline-none"/>
                                <button onClick={() => setModifier(m => m + 1)} className="text-accent-gold hover:text-white flex items-center justify-center size-8 rounded-full hover:bg-white/5 transition-colors border border-accent-gold/20"><span className="material-symbols-outlined text-lg">add</span></button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-2 px-1">
                            {[4, 6, 8, 10, 12, 20, 100].map((sides) => (
                                <button key={sides} onClick={() => addDie(sides as DieType)} className="flex flex-col items-center gap-1 group transition-all" disabled={isRolling}>
                                    <div className="size-10 flex items-center justify-center text-accent-gold/40 group-hover:text-accent-gold group-active:scale-90 transition-all"><svg viewBox="0 0 48 48" className="w-full h-full fill-current">{DICE_ICONS[sides as DieType]}</svg></div>
                                    <span className="text-[9px] text-gray-600 font-black group-hover:text-white uppercase">d{sides}</span>
                                </button>
                            ))}
                        </div>

                        <button onClick={rollDice} disabled={activePool.length === 0 || isRolling} className="w-full bg-primary hover:bg-red-700 disabled:bg-gray-900 disabled:text-gray-700 disabled:cursor-not-allowed text-white font-black py-4 uppercase tracking-[0.3em] rounded shadow-xl transition-all transform hover:scale-[1.02] active:scale-95 border border-accent-gold/20">Forge Destiny</button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes progress {
                    from { width: 0%; }
                    to { width: 100%; }
                }
            `}</style>
        </>
    );
};

export default DiceRoller;