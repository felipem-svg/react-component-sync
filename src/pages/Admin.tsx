import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { PrizeCustomizer } from "@/components/PrizeCustomizer";
import { RouletteWheel } from "@/components/RouletteWheel";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FlipText } from "@/components/ui/flip-text";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Prize {
  id: number;
  label: string;
  color: string;
}

export default function Admin() {
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

  const handleWinner = (winner: Prize) => {
    console.log("Winner:", winner);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
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
                className="text-4xl font-bold text-foreground"
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
        </motion.div>
      </main>
    </div>
  );
}
