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
import { useAuth } from "@/hooks/useAuth";
import { AuthDialog } from "@/components/AuthDialog";

const Index = () => {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [canSpin, setCanSpin] = useState(true);
  const [spinBlockReason, setSpinBlockReason] = useState<string | null>(null);
  const [nextAvailable, setNextAvailable] = useState<string | null>(null);
  const [checkingSpinPermission, setCheckingSpinPermission] = useState(false);
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

  useEffect(() => {
    if (user) {
      checkCanSpin();
    }
  }, [user]);

  const checkCanSpin = async () => {
    if (!user) return;

    try {
      setCheckingSpinPermission(true);
      const { data, error } = await supabase.rpc("can_user_spin", {
        _user_id: user.id,
      });

      if (error) throw error;

      const result = data as { can_spin: boolean; reason: string | null; next_available: string | null };
      setCanSpin(result.can_spin);
      setSpinBlockReason(result.reason);
      setNextAvailable(result.next_available);
    } catch (error) {
      console.error("Error checking spin permission:", error);
      setCanSpin(true);
      setSpinBlockReason(null);
    } finally {
      setCheckingSpinPermission(false);
    }
  };

  const fetchPrizes = async () => {
    try {
      const { data, error } = await supabase.from("roulette_prizes").select("*").order("position", { ascending: true });

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

  const handleWinner = async (winner: Prize) => {
    console.log("Winner:", winner);

    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para salvar seu prêmio.",
        variant: "destructive",
      });
      return;
    }

    if (!canSpin) {
      toast({
        title: "Giro não permitido",
        description: spinBlockReason || "Você atingiu o limite de giros.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("user_prizes").insert({
        user_id: user.id,
        prize_id: winner.id,
        prize_label: winner.label,
        prize_color: winner.color,
        user_email: user.email || "Sem email",
      });

      if (error) throw error;

      toast({
        title: "Prêmio salvo!",
        description: `${winner.label} foi adicionado ao seu histórico.`,
      });

      await checkCanSpin();
    } catch (error) {
      console.error("Error saving prize:", error);
      toast({
        title: "Erro ao salvar prêmio",
        description: "Não foi possível salvar o prêmio no histórico.",
        variant: "destructive",
      });
    }
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
    <div className="min-h-screen w-full bg-background overflow-x-hidden">
      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 md:py-28 flex items-center justify-center px-3 sm:px-4 overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent" />

        <div className="grid lg:grid-cols-2 gap-8 items-center z-10 max-w-6xl mx-auto w-full">
          {/* Coluna 1: Texto */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left order-2 lg:order-1"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6 flex justify-center lg:justify-start"
            >
              <FlipText
                word="Roleta da Sorte"
                duration={0.5}
                delayMultiple={0.1}
                className="text-3xl sm:text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent"
                spacing="space-x-0.5 sm:space-x-1 md:space-x-2"
              />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-xl md:text-2xl text-muted-foreground mb-8"
            >
              A maneira mais divertida e justa de fazer sorteios, tomar decisões ou simplesmente testar sua sorte!
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex justify-center lg:justify-start"
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

          {/* Coluna 2: Imagem */}
          <motion.div
            className="order-1 lg:order-2 flex justify-center"
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <img
                src="/owner-photo.jpg"
                alt="Criadora da Roleta da Sorte"
                className="w-64 h-64 md:w-80 md:h-80 rounded-full object-cover object-[center_-30px] border-4 border-accent ring-4 ring-primary/20 shadow-2xl shadow-primary/30"
              />

              {/* Glow effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 blur-xl -z-10" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Roulette Section */}
      <section
        id="roulette"
        className="relative py-16 md:py-24 px-3 sm:px-4 overflow-hidden bg-gradient-to-b from-background via-card/50 to-background"
      >
        <div className="max-w-7xl mx-auto">
          {/* Title */}
          <motion.div
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4">
              <FlipText
                word="Experimente Agora"
                duration={0.5}
                delayMultiple={0.08}
                className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground"
                spacing="space-x-0.5 sm:space-x-1 md:space-x-2"
              />
            </div>
            <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-2xl mx-auto">
              Gire a roleta e veja a magia acontecer!
            </p>
          </motion.div>

          {/* Roulette Wheel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: "spring" }}
          >
            <RouletteWheel
              items={prizes}
              onSpinComplete={handleWinner}
              disabled={!canSpin || checkingSpinPermission}
              disabledReason={spinBlockReason}
              nextAvailable={nextAvailable}
            />
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-3 sm:px-4 bg-gradient-to-br from-card/40 via-background to-primary/10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            {/* Imagem */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="flex justify-center lg:justify-start"
            >
              <div className="relative">
                <img
                  src="/owner-photo.jpg"
                  alt="Criadora"
                  className="w-80 h-96 md:w-96 md:h-[28rem] rounded-2xl object-cover border-4 border-accent shadow-2xl shadow-primary/20"
                />
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-primary to-secondary rounded-full blur-3xl opacity-30" />
              </div>
            </motion.div>

            {/* Texto */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                  Conheça Quem Criou{" "}
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Tudo Isso
                  </span>
                </h2>
                <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                  Olá! Sou a criadora da Roleta da Sorte. Minha missão é trazer diversão e justiça para sorteios e
                  decisões do dia a dia. Com paixão por tecnologia e design, criei esta plataforma para tornar cada giro
                  uma experiência mágica! ✨
                </p>
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/30">
                    <span className="text-2xl">🎯</span>
                    <span className="text-sm text-foreground">Sorteios Justos</span>
                  </div>
                  <div className="flex items-center gap-2 bg-secondary/10 px-4 py-2 rounded-full border border-secondary/30">
                    <span className="text-2xl">✨</span>
                    <span className="text-sm text-foreground">Design Mágico</span>
                  </div>
                  <div className="flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full border border-accent/30">
                    <span className="text-2xl">💜</span>
                    <span className="text-sm text-foreground">Feito com Amor</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Rewards Section */}
      <section className="py-20 px-3 sm:px-4 bg-card/30">
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
      <section className="py-20 px-3 sm:px-4 bg-gradient-to-b from-background to-card/40">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Pronto Para Testar Sua Sorte?</h2>
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
      <footer className="py-8 px-4 border-t border-border bg-card/60">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/owner-photo.jpg"
                alt="Criadora"
                className="w-10 h-10 rounded-full object-cover border-2 border-accent"
              />
              <p className="text-muted-foreground text-sm">© 2024 Roleta da Sorte • Criado com ❤️</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground">Desenvolvido com React e Framer Motion</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
