import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { PrizeCustomizer } from "@/components/PrizeCustomizer";
import { RouletteWheel } from "@/components/RouletteWheel";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FlipText } from "@/components/ui/flip-text";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Prize {
  id: number;
  label: string;
  color: string;
  weight: number;
}

interface UserPrize {
  id: string;
  prize_label: string;
  prize_color: string;
  won_at: string;
  user_email: string;
}

export default function Admin() {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [userPrizes, setUserPrizes] = useState<UserPrize[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPrizes, setLoadingPrizes] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPrizes();
    fetchUserPrizes();
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
        weight: prize.weight || 10,
      }));

      setPrizes(formattedPrizes);
    } catch (error) {
      console.error("Error fetching prizes:", error);
      toast({
        title: "Erro ao carregar prêmios",
        description: "Não foi possível carregar os prêmios do banco de dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrizesChange = async (newPrizes: Prize[]) => {
    try {
      // Delete all existing prizes
      const { error: deleteError } = await supabase
        .from("roulette_prizes")
        .delete()
        .neq("id", 0); // Delete all

      if (deleteError) throw deleteError;

      // Insert new prizes
      const prizesToInsert = newPrizes.map((prize, index) => ({
        label: prize.label,
        color: prize.color,
        position: index + 1,
        weight: prize.weight || 10,
      }));

      const { error: insertError } = await supabase
        .from("roulette_prizes")
        .insert(prizesToInsert);

      if (insertError) throw insertError;

      toast({
        title: "Prêmios salvos!",
        description: "As alterações foram salvas com sucesso.",
      });

      // Refresh prizes
      await fetchPrizes();
    } catch (error) {
      console.error("Error saving prizes:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    }
  };

  const fetchUserPrizes = async () => {
    try {
      setLoadingPrizes(true);
      const { data, error } = await supabase
        .from("user_prizes")
        .select("id, prize_label, prize_color, won_at, user_email")
        .order("won_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      const formattedPrizes: UserPrize[] = data.map((prize) => ({
        id: prize.id,
        prize_label: prize.prize_label,
        prize_color: prize.prize_color,
        won_at: prize.won_at,
        user_email: prize.user_email || "Usuário desconhecido",
      }));

      setUserPrizes(formattedPrizes);
    } catch (error) {
      console.error("Error fetching user prizes:", error);
      toast({
        title: "Erro ao carregar prêmios",
        description: "Não foi possível carregar o histórico de prêmios.",
        variant: "destructive",
      });
    } finally {
      setLoadingPrizes(false);
    }
  };

  const handleWinner = (winner: Prize) => {
    console.log("Winner:", winner);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9B4B8A] mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando painel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="text-center">
            <div className="mb-2">
          <FlipText 
            word="Painel Administrativo" 
            duration={0.5}
            delayMultiple={0.06}
            className="text-2xl sm:text-4xl font-bold text-foreground"
            spacing="space-x-0.5 sm:space-x-1"
          />
            </div>
            <p className="text-muted-foreground">
              Gerencie os prêmios da roleta
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Prêmios</CardTitle>
                <CardDescription>
                  Adicione, edite ou remova prêmios da roleta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PrizeCustomizer prizes={prizes} onPrizesChange={handlePrizesChange} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preview da Roleta</CardTitle>
                <CardDescription>
                  Visualize como a roleta ficará com os prêmios atuais
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <RouletteWheel items={prizes} onSpinComplete={handleWinner} />
              </CardContent>
            </Card>
          </div>

          {/* Won Prizes History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Prêmios Ganhos</CardTitle>
                <CardDescription>
                  Últimos 50 prêmios ganhos pelos usuários
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingPrizes ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-sm text-muted-foreground">Carregando prêmios...</p>
                  </div>
                ) : userPrizes.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Nenhum prêmio foi ganho ainda.</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      {userPrizes.map((prize, index) => (
                        <motion.div
                          key={prize.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                        >
                          <div
                            className="w-12 h-12 rounded-full flex-shrink-0"
                            style={{ backgroundColor: prize.prize_color }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground truncate">
                              {prize.prize_label}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">
                              {prize.user_email}
                            </p>
                          </div>
                          <div className="text-right text-sm text-muted-foreground flex-shrink-0">
                            <p>{format(new Date(prize.won_at), "dd/MM/yyyy", { locale: ptBR })}</p>
                            <p>{format(new Date(prize.won_at), "HH:mm", { locale: ptBR })}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
