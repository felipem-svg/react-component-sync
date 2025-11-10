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

  // Base rewards - 8 unique prizes
  const BASE_REWARDS: ImageData[] = [
    {
      id: "base-reward-1",
      src: "https://i.postimg.cc/htP2g56P/image.png",
      alt: "20 Giros no Sweet Bonanza",
      title: "20 Giros Grátis",
      description: "Sweet Bonanza - Multiplique suas chances com giros extras!"
    },
    {
      id: "base-reward-2",
      src: "https://i.postimg.cc/WpgW7rgQ/image.png",
      alt: "10 giros no Gates of Olympus",
      title: "10 Giros Grátis",
      description: "Gates of Olympus - Descubra os tesouros do Olimpo!"
    },
    {
      id: "base-reward-3",
      src: "https://i.postimg.cc/JnWJ7y0B/image.png",
      alt: "R$20 de Saldo",
      title: "R$20 de Saldo",
      description: "Crédito instantâneo para você aproveitar!"
    },
    {
      id: "base-reward-4",
      src: "https://i.postimg.cc/L4QXNYSY/image.png",
      alt: "60 giros no Big Bass Bonanza",
      title: "60 Giros Grátis",
      description: "Big Bass Bonanza - A maior pescaria de prêmios!"
    },
    {
      id: "base-reward-5",
      src: "https://i.postimg.cc/GhscKXqm/image.png",
      alt: "R$500 de Saldo",
      title: "R$500 de Saldo",
      description: "Grande prêmio em dinheiro! Use como quiser!"
    },
    {
      id: "base-reward-6",
      src: "https://i.postimg.cc/pLRLdDJV/image.png",
      alt: "R$2 de Saldo",
      title: "R$2 de Saldo",
      description: "Todo prêmio conta! Comece sua sorte aqui."
    },
    {
      id: "base-reward-7",
      src: "https://i.postimg.cc/9QQHS1BV/image.png",
      alt: "iPhone 17 Pro",
      title: "iPhone 17 Pro",
      description: "O prêmio máximo! Smartphone premium para você!"
    },
    {
      id: "base-reward-8",
      src: "https://i.postimg.cc/Wz8fwLCx/image.png",
      alt: "10 giros no Tigre Sortudo",
      title: "10 Giros Grátis",
      description: "Tigre Sortudo - Deixe o tigre trazer a sorte até você!"
    }
  ];

  // Generate expanded array with repetitions - 40 total images
  const REPETITIONS = 5;
  const REWARDS: ImageData[] = [];
  
  for (let i = 0; i < REPETITIONS; i++) {
    BASE_REWARDS.forEach((reward, index) => {
      REWARDS.push({
        ...reward,
        id: `reward-${i}-${index}`,
        alt: `${reward.alt} (${i + 1})`
      });
    });
  }

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
