import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { FlipText } from "@/components/ui/flip-text";

interface RouletteItem {
  id: number;
  label: string;
  color: string;
  weight?: number;
}

interface RouletteWheelProps {
  items?: RouletteItem[];
  onSpinComplete?: (winner: RouletteItem) => void;
  className?: string;
}

export function RouletteWheel({
  items = [
    { id: 1, label: "Prize 1", color: "bg-red-500" },
    { id: 2, label: "Prize 2", color: "bg-blue-500" },
    { id: 3, label: "Prize 3", color: "bg-green-500" },
    { id: 4, label: "Prize 4", color: "bg-yellow-500" },
    { id: 5, label: "Prize 5", color: "bg-purple-500" },
    { id: 6, label: "Prize 6", color: "bg-pink-500" },
    { id: 7, label: "Prize 7", color: "bg-orange-500" },
    { id: 8, label: "Prize 8", color: "bg-teal-500" },
  ],
  onSpinComplete,
  className,
}: RouletteWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<RouletteItem | null>(null);
  const [showWinner, setShowWinner] = useState(false);

  const segmentAngle = 360 / items.length;

  const spinWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setShowWinner(false);
    setWinner(null);

    // Calcular item vencedor usando pesos
    const totalWeight = items.reduce((sum, item) => sum + (item.weight || 10), 0);
    const randomValue = Math.random() * totalWeight;
    
    let cumulativeWeight = 0;
    let selectedIndex = 0;
    
    for (let i = 0; i < items.length; i++) {
      cumulativeWeight += items[i].weight || 10;
      if (randomValue <= cumulativeWeight) {
        selectedIndex = i;
        break;
      }
    }

    // 🔧 Calcular rotação relativa à posição atual da roleta
    const segmentCenterAngle = selectedIndex * segmentAngle + (segmentAngle / 2);
    const spins = 5 + Math.random() * 3; // 5-8 voltas completas
    
    // Normalizar rotação atual (0-360°)
    const currentNormalizedAngle = rotation % 360;
    
    // Calcular o ângulo de destino (invertido porque queremos trazer o segmento ao ponteiro)
    const targetAngle = 360 - segmentCenterAngle;
    
    // Calcular quanto precisamos girar a partir da posição atual
    let rotationNeeded = targetAngle - currentNormalizedAngle;
    
    // Garantir que sempre giramos para frente (no sentido horário)
    if (rotationNeeded < 0) rotationNeeded += 360;
    
    // Adicionar voltas completas e rotação necessária
    const totalRotation = rotation + (spins * 360) + rotationNeeded;

    setRotation(totalRotation);

    setTimeout(() => {
      const winningItem = items[selectedIndex];
      console.log("🎯 Winner:", winningItem, "Index:", selectedIndex, "Angle:", segmentCenterAngle);
      setWinner(winningItem);
      setShowWinner(true);
      setIsSpinning(false);
      if (onSpinComplete) onSpinComplete(winningItem);
    }, 4000);
  };

  const reset = () => {
    setRotation(0);
    setWinner(null);
    setShowWinner(false);
    setIsSpinning(false);
  };

  return (
    <div className={cn("flex flex-col items-center gap-8 p-8", className)}>
      <div className="relative">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20">
          <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-primary drop-shadow-lg" />
        </div>

        {/* Wheel Container */}
        <div className="relative w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] lg:w-[400px] lg:h-[400px] rounded-full shadow-2xl overflow-hidden border-4 sm:border-6 lg:border-8 border-primary">
          <motion.div
            className="w-full h-full relative"
            animate={{ rotate: rotation }}
            transition={{
              duration: 4,
              ease: [0.17, 0.67, 0.12, 0.99],
            }}
          >
            {items.map((item, index) => {
              const angle = segmentAngle * index;
              return (
                <div
                  key={item.id}
                  className={cn(
                    "absolute w-full h-full origin-center",
                    item.color
                  )}
                  style={{
                    transform: `rotate(${angle}deg)`,
                    clipPath: `polygon(50% 50%, 50% 0%, ${
                      50 + 50 * Math.sin((segmentAngle * Math.PI) / 180)
                    }% ${50 - 50 * Math.cos((segmentAngle * Math.PI) / 180)}%)`,
                  }}
                >
                  <div
                    className="absolute top-[20%] left-1/2 -translate-x-1/2 text-white font-bold text-xs sm:text-sm md:text-base whitespace-nowrap"
                    style={{
                      transform: `translateX(-50%) rotate(${segmentAngle / 2}deg)`,
                    }}
                  >
                    {item.label}
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* Center Circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full bg-white border-2 sm:border-3 lg:border-4 border-primary shadow-lg z-10" />
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 sm:gap-4 justify-center">
        <Button
          onClick={spinWheel}
          disabled={isSpinning}
          size="default"
          className="gap-2 sm:text-base lg:text-lg sm:px-6 sm:py-6"
        >
          <Play className="w-4 h-4 sm:w-5 sm:h-5" />
          {isSpinning ? "Girando..." : "Girar"}
        </Button>
        <Button
          onClick={reset}
          disabled={isSpinning}
          variant="outline"
          size="default"
          className="gap-2 sm:text-base lg:text-lg sm:px-6 sm:py-6"
        >
          <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
          Reset
        </Button>
      </div>

      {/* Winner Display */}
      <AnimatePresence>
        {showWinner && winner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
              <span className="text-2xl sm:text-3xl lg:text-4xl">🎉</span>
              <FlipText 
                word="Parabéns" 
                duration={0.3}
                delayMultiple={0.1}
                className="text-2xl sm:text-4xl lg:text-5xl font-bold text-foreground"
                spacing="space-x-1 sm:space-x-2"
              />
              <span className="text-2xl sm:text-3xl lg:text-4xl">🎉</span>
            </div>
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className={cn(
                "text-base sm:text-lg md:text-xl lg:text-2xl font-bold px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-5 rounded-xl text-white shadow-2xl border-2 border-white/20 max-w-[90vw] break-words text-center",
                winner.color
              )}
            >
              {winner.label}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
