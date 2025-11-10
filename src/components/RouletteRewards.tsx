import SphereImageGrid, { ImageData } from "@/components/ui/img-sphere";
import { useEffect, useState } from "react";

const RouletteRewards = () => {
  const [containerSize, setContainerSize] = useState(600);
  const [imageScale, setImageScale] = useState(0.18);

  // Adjust container size and image scale based on screen width
  useEffect(() => {
    const updateSize = () => {
      if (window.innerWidth < 640) {
        setContainerSize(350);
        setImageScale(0.22);
      } else if (window.innerWidth < 1024) {
        setContainerSize(500);
        setImageScale(0.20);
      } else {
        setContainerSize(600);
        setImageScale(0.18);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const REWARDS: ImageData[] = [
    {
      id: "reward-1",
      src: "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?q=80&w=2070&auto=format&fit=crop",
      alt: "20 Giros no Sweet Bonanza",
      title: "20 Giros Grátis",
      description: "Sweet Bonanza - Multiplique suas chances com giros extras!"
    },
    {
      id: "reward-2",
      src: "https://images.unsplash.com/photo-1632516643720-e7f5d7d6ecc9?q=80&w=2071&auto=format&fit=crop",
      alt: "10 giros no Gates of Olympus",
      title: "10 Giros Grátis",
      description: "Gates of Olympus - Descubra os tesouros do Olimpo!"
    },
    {
      id: "reward-3",
      src: "https://images.unsplash.com/photo-1580048915913-4f8f5cb481c4?q=80&w=2134&auto=format&fit=crop",
      alt: "R$20 de Saldo",
      title: "R$20 de Saldo",
      description: "Crédito instantâneo para você aproveitar!"
    },
    {
      id: "reward-4",
      src: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2070&auto=format&fit=crop",
      alt: "60 giros no Big Bass Bonanza",
      title: "60 Giros Grátis",
      description: "Big Bass Bonanza - A maior pescaria de prêmios!"
    },
    {
      id: "reward-5",
      src: "https://images.unsplash.com/photo-1607863680198-23d4b2565df0?q=80&w=2070&auto=format&fit=crop",
      alt: "R$500 de Saldo",
      title: "R$500 de Saldo",
      description: "Grande prêmio em dinheiro! Use como quiser!"
    },
    {
      id: "reward-6",
      src: "https://images.unsplash.com/photo-1621981386829-9b458a2cddde?q=80&w=2053&auto=format&fit=crop",
      alt: "R$2 de Saldo",
      title: "R$2 de Saldo",
      description: "Todo prêmio conta! Comece sua sorte aqui."
    },
    {
      id: "reward-7",
      src: "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?q=80&w=2070&auto=format&fit=crop",
      alt: "iPhone 17 Pro",
      title: "iPhone 17 Pro",
      description: "O prêmio máximo! Smartphone premium para você!"
    },
    {
      id: "reward-8",
      src: "https://images.unsplash.com/photo-1615875474908-c9c61eb3afb7?q=80&w=2070&auto=format&fit=crop",
      alt: "10 giros no Tigre Sortudo",
      title: "10 Giros Grátis",
      description: "Tigre Sortudo - Deixe o tigre trazer a sorte até você!"
    }
  ];

  return (
    <div className="flex justify-center items-center">
      <SphereImageGrid
        images={REWARDS}
        containerSize={containerSize}
        sphereRadius={containerSize * 0.38}
        dragSensitivity={0.8}
        momentumDecay={0.96}
        maxRotationSpeed={6}
        baseImageScale={imageScale}
        hoverScale={1.4}
        perspective={1000}
        autoRotate={true}
        autoRotateSpeed={0.25}
      />
    </div>
  );
};

export default RouletteRewards;
