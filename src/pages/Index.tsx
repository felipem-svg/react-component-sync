import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RouletteWheel } from "@/components/RouletteWheel";
import { FeatureCard } from "@/components/FeatureCard";
import { HowItWorksStep } from "@/components/HowItWorksStep";
import { StatsCounter } from "@/components/StatsCounter";
import { Navbar } from "@/components/Navbar";
import { Prize } from "@/components/PrizeCustomizer";
import { Button } from "@/components/ui/button";
import { Target, Zap, Palette, PartyPopper, ArrowDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPrizes();
  }, []);

  const fetchPrizes = async () => {
    try {
      const { data, error } = await supabase
        .from("roulette_prizes")
        .select("*")
        .order("position", { ascending: true });

      if (error) throw error;

      const formattedPrizes = data.map((prize) => ({
        id: prize.id,
        label: prize.label,
        color: prize.color,
      }));

      setPrizes(formattedPrizes);
    } catch (error) {
      console.error("Error fetching prizes:", error);
      toast({
        title: "Erro ao carregar prêmios",
        description: "Não foi possível carregar os prêmios.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const scrollToRoulette = () => {
    document.getElementById("roulette")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleWinner = (winner: Prize) => {
    console.log("Winner:", winner);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center z-10 max-w-4xl mx-auto"
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold text-foreground mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary"
          >
            Roleta da Sorte
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            A maneira mais divertida e justa de fazer sorteios, tomar decisões ou simplesmente testar sua sorte!
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Button
              size="lg"
              onClick={scrollToRoulette}
              className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              Girar Agora
              <ArrowDown className="ml-2 w-5 h-5 animate-bounce" />
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-muted-foreground"
          >
            <ArrowDown className="w-6 h-6" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Por Que Escolher Nossa Roleta?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Tecnologia de ponta combinada com design moderno para uma experiência única
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={Target}
              title="Totalmente Aleatório"
              description="Algoritmo justo e transparente que garante resultados 100% aleatórios"
              delay={0.1}
            />
            <FeatureCard
              icon={Zap}
              title="Rápido e Fácil"
              description="Interface intuitiva que permite girar a roleta com apenas um clique"
              delay={0.2}
            />
            <FeatureCard
              icon={Palette}
              title="Visual Moderno"
              description="Design elegante e responsivo que funciona perfeitamente em qualquer dispositivo"
              delay={0.3}
            />
            <FeatureCard
              icon={PartyPopper}
              title="Diversão Garantida"
              description="Perfeito para sorteios, tomada de decisões ou simplesmente se divertir"
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* Roulette Section */}
      <section id="roulette" className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Experimente Agora
            </h2>
            <p className="text-muted-foreground text-lg mb-6">
              Gire a roleta e veja a magia acontecer!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <RouletteWheel items={prizes} onSpinComplete={handleWinner} />
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Como Funciona
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Três passos simples para girar e ganhar
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <HowItWorksStep
              step={1}
              title="Configure os Prêmios"
              description="Personalize as opções da roleta com os prêmios ou escolhas que você deseja"
              delay={0.1}
            />
            <HowItWorksStep
              step={2}
              title="Gire a Roleta"
              description="Clique no botão 'Spin' e observe a roleta girar com animações suaves"
              delay={0.2}
            />
            <HowItWorksStep
              step={3}
              title="Descubra o Vencedor"
              description="Veja o resultado com uma animação especial revelando o prêmio sorteado"
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Números Que Impressionam
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <StatsCounter value="10.000+" label="Giros Realizados" delay={0.1} />
            <StatsCounter value="100%" label="Aleatório" delay={0.2} />
            <StatsCounter value="0ms" label="Delay" delay={0.3} />
            <StatsCounter value="∞" label="Possibilidades" delay={0.4} />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Pronto Para Testar Sua Sorte?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Não espere mais! Gire a roleta agora e descubra o que o destino preparou para você.
            </p>
            <Button
              size="lg"
              onClick={scrollToRoulette}
              className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              Girar a Roleta Novamente
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground">
          <p>© 2024 Roleta da Sorte. Desenvolvido com ❤️ usando React e Framer Motion.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
