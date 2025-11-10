import { RouletteWheel } from "@/components/RouletteWheel";

const Index = () => {
  const handleWinner = (winner: { id: number; label: string; color: string }) => {
    console.log("Winner:", winner);
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center">
      <div className="text-center mb-8 px-4">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Spin the Wheel
        </h1>
        <p className="text-lg text-muted-foreground">
          Click spin and see where fortune takes you!
        </p>
      </div>
      <RouletteWheel onSpinComplete={handleWinner} />
    </div>
  );
};

export default Index;
