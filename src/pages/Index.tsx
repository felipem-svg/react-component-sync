import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RouletteWheel } from "@/components/RouletteWheel";
import { FlipText } from "@/components/ui/flip-text";
import { Navbar } from "@/components/Navbar";
import { Prize } from "@/components/PrizeCustomizer";
import RouletteRewards from "@/components/RouletteRewards";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { useAuth } from "@/hooks/useAuth";
import { AuthDialog } from "@/components/AuthDialog";

const Index = () => {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    fetchPrizes();
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      setShowAuthDialog(true);
    } else {
      setShowAuthDialog(false);
    }
  }, [user, authLoading]);

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
        weight: prize.weight || 10,
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9B4B8A] mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background overflow-x-hidden">
      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-3 sm:px-4 overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-[#722E73]/20 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#9B4B8A]/10 via-transparent to-transparent" />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center z-10 max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6"
          >
            <FlipText 
              word="Roleta da Sorte" 
              duration={0.5}
              delayMultiple={0.1}
              className="text-3xl sm:text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#722E73] via-[#9B4B8A] to-[#C2A083]"
              spacing="space-x-0.5 sm:space-x-1 md:space-x-2"
            />
          </motion.div>
          
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


      {/* Roulette Section */}
      <section id="roulette" className="relative overflow-hidden">
        <ContainerScroll
          titleComponent={
            <>
              <div className="mb-4">
                <FlipText 
                  word="Experimente Agora" 
                  duration={0.5}
                  delayMultiple={0.08}
                  className="text-2xl sm:text-4xl md:text-6xl font-bold text-foreground"
                  spacing="space-x-0.5 sm:space-x-1 md:space-x-2"
                />
              </div>
              <p className="text-muted-foreground text-lg">
                Gire a roleta e veja a magia acontecer!
              </p>
            </>
          }
        >
          <RouletteWheel items={prizes} onSpinComplete={handleWinner} />
        </ContainerScroll>
      </section>

      {/* Rewards Section */}
      <section className="py-20 px-3 sm:px-4 bg-[#311035]/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="mb-4">
              <FlipText 
                word="Recompensas da Roleta" 
                duration={0.5}
                delayMultiple={0.08}
                className="text-2xl sm:text-4xl md:text-6xl font-bold text-foreground"
                spacing="space-x-0.5 sm:space-x-1 md:space-x-2"
              />
            </div>
            <p className="text-muted-foreground text-lg">
              Descubra os incríveis prêmios que você pode ganhar! Arraste para explorar.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <RouletteRewards />
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-3 sm:px-4 bg-[#311035]/50">
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
