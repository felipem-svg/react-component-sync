import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings, Plus, Trash2, Edit2, Save, X, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

export interface Prize {
  id: number;
  label: string;
  color: string;
  weight: number;
}

interface PrizeCustomizerProps {
  prizes: Prize[];
  onPrizesChange: (prizes: Prize[]) => void;
}

const prizeSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, "Nome do prêmio é obrigatório")
    .max(50, "Nome deve ter no máximo 50 caracteres"),
  color: z.string().regex(/^bg-gradient-to-br from-\w+-\d+ to-\w+-\d+$/, "Formato de cor inválido"),
  weight: z.number().min(0, "Peso mínimo é 0").max(1, "Peso máximo é 1"),
});

const colorOptions = [
  { label: "Roxo", value: "bg-gradient-to-br from-purple-500 to-purple-700" },
  { label: "Azul", value: "bg-gradient-to-br from-blue-500 to-blue-700" },
  { label: "Verde", value: "bg-gradient-to-br from-green-500 to-green-700" },
  { label: "Amarelo", value: "bg-gradient-to-br from-yellow-500 to-yellow-700" },
  { label: "Vermelho", value: "bg-gradient-to-br from-red-500 to-red-700" },
  { label: "Rosa", value: "bg-gradient-to-br from-pink-500 to-pink-700" },
  { label: "Laranja", value: "bg-gradient-to-br from-orange-500 to-orange-700" },
  { label: "Turquesa", value: "bg-gradient-to-br from-teal-500 to-teal-700" },
  { label: "Índigo", value: "bg-gradient-to-br from-indigo-500 to-indigo-700" },
  { label: "Ciano", value: "bg-gradient-to-br from-cyan-500 to-cyan-700" },
];

export const PrizeCustomizer = ({ prizes, onPrizesChange }: PrizeCustomizerProps) => {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newPrize, setNewPrize] = useState({ label: "", color: colorOptions[0].value, weight: 0.1 });
  const [newPrizeNotWinnable, setNewPrizeNotWinnable] = useState(false);
  const [newPrizePreviousWeight, setNewPrizePreviousWeight] = useState(0.1);
  const [errors, setErrors] = useState<{ label?: string; color?: string; weight?: string }>({});
  const { toast } = useToast();

  const calculatePercentage = (weight: number, showDecimals: boolean = false) => {
    const totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0);
    if (totalWeight === 0) return "0";
    
    const percentage = (weight / totalWeight) * 100;
    
    if (percentage === 0) return "0";
    
    // Se for pequeno, mostrar 2 decimais
    if (percentage < 10) {
      return percentage.toFixed(2);
    }
    
    // Caso contrário, arredondar
    return Math.round(percentage).toString();
  };

  const validatePrize = (label: string, color: string, weight: number) => {
    try {
      prizeSchema.parse({ label, color, weight });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { label?: string; color?: string; weight?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as "label" | "color" | "weight"] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const addPrize = () => {
    if (!validatePrize(newPrize.label, newPrize.color, newPrize.weight)) {
      return;
    }

    if (prizes.length >= 12) {
      toast({
        title: "Limite atingido",
        description: "Você pode adicionar no máximo 12 prêmios",
        variant: "destructive",
      });
      return;
    }

    const newId = Math.max(0, ...prizes.map((p) => p.id)) + 1;
    onPrizesChange([...prizes, { ...newPrize, id: newId }]);
    setNewPrize({ label: "", color: colorOptions[0].value, weight: 10 });
    setErrors({});
    
    toast({
      title: "Prêmio adicionado!",
      description: `${newPrize.label} foi adicionado à roleta`,
    });
  };

  const updatePrize = (id: number, label: string, color: string, weight: number) => {
    if (!validatePrize(label, color, weight)) {
      return;
    }

    onPrizesChange(prizes.map((p) => (p.id === id ? { ...p, label, color, weight } : p)));
    setEditingId(null);
    setErrors({});
    
    toast({
      title: "Prêmio atualizado!",
      description: "As alterações foram salvas",
    });
  };

  const removePrize = (id: number) => {
    if (prizes.length <= 2) {
      toast({
        title: "Não é possível remover",
        description: "A roleta precisa ter pelo menos 2 prêmios",
        variant: "destructive",
      });
      return;
    }

    const prize = prizes.find((p) => p.id === id);
    onPrizesChange(prizes.filter((p) => p.id !== id));
    
    toast({
      title: "Prêmio removido",
      description: `${prize?.label} foi removido da roleta`,
    });
  };

  const resetToDefaults = () => {
    const defaultPrizes: Prize[] = [
      { id: 1, label: "iPhone 15 Pro", color: "bg-gradient-to-br from-purple-500 to-purple-700", weight: 5 },
      { id: 2, label: "MacBook Air", color: "bg-gradient-to-br from-blue-500 to-blue-700", weight: 3 },
      { id: 3, label: "AirPods Pro", color: "bg-gradient-to-br from-green-500 to-green-700", weight: 15 },
      { id: 4, label: "iPad Mini", color: "bg-gradient-to-br from-yellow-500 to-yellow-700", weight: 10 },
      { id: 5, label: "Apple Watch", color: "bg-gradient-to-br from-red-500 to-red-700", weight: 12 },
      { id: 6, label: "Gift Card $100", color: "bg-gradient-to-br from-pink-500 to-pink-700", weight: 25 },
      { id: 7, label: "Premium Sub", color: "bg-gradient-to-br from-orange-500 to-orange-700", weight: 20 },
      { id: 8, label: "Mystery Box", color: "bg-gradient-to-br from-teal-500 to-teal-700", weight: 10 },
    ];
    onPrizesChange(defaultPrizes);
    
    toast({
      title: "Prêmios restaurados",
      description: "A roleta foi restaurada para os prêmios padrão",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="gap-2">
          <Settings className="w-5 h-5" />
          Customizar Prêmios
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-background">
        <DialogHeader>
          <DialogTitle className="text-2xl">Customizar Prêmios da Roleta</DialogTitle>
          <DialogDescription>
            Adicione, edite ou remova prêmios da roleta. Mínimo 2 prêmios, máximo 12.
          </DialogDescription>
        </DialogHeader>

        {/* Painel de Ajuda */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Como funciona o sistema de pesos?
          </h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• <strong>Probabilidade maior = maior chance</strong> de ser sorteado</p>
            <p>• A porcentagem é calculada automaticamente baseada no peso total</p>
            <p className="pt-2 font-medium">Exemplos práticos:</p>
            <ul className="pl-4 space-y-1">
              <li>✓ Peso <strong>0.05</strong> = 5% de probabilidade</li>
              <li>✓ Peso <strong>0.50</strong> = 50% de probabilidade</li>
              <li>✓ Peso <strong>0</strong> = 0% (NÃO PODE SER GANHO)</li>
              <li>✓ Todos com peso <strong>0.10</strong> = chances iguais</li>
            </ul>
          </div>
        </div>

        <div className="space-y-6 py-4">
          {/* Add New Prize */}
          <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/30">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Adicionar Novo Prêmio
            </h3>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="new-prize-label">Nome do Prêmio</Label>
                <Input
                  id="new-prize-label"
                  value={newPrize.label}
                  onChange={(e) => {
                    setNewPrize({ ...newPrize, label: e.target.value });
                    setErrors({});
                  }}
                  placeholder="Ex: iPhone 15 Pro"
                  maxLength={50}
                />
                {errors.label && (
                  <p className="text-sm text-destructive">{errors.label}</p>
                )}
              </div>

              <div className="flex items-center gap-2 p-3 border border-border rounded-lg bg-muted/20">
                <Switch
                  id="new-not-winnable"
                  checked={newPrizeNotWinnable}
                  onCheckedChange={(checked) => {
                    setNewPrizeNotWinnable(checked);
                    if (checked) {
                      setNewPrizePreviousWeight(newPrize.weight);
                      setNewPrize({ ...newPrize, weight: 0 });
                    } else {
                      setNewPrize({ ...newPrize, weight: newPrizePreviousWeight || 0.1 });
                    }
                  }}
                />
                <Label 
                  htmlFor="new-not-winnable"
                  className="cursor-pointer flex items-center gap-2"
                >
                  <span className="text-lg">🚫</span>
                  <span>Prêmio não ganhável (nunca cai na roleta)</span>
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-prize-weight">
                  Peso / Probabilidade 
                  <span className="text-xs text-muted-foreground ml-2">
                    (0-1)
                  </span>
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="new-prize-weight"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={newPrize.weight}
                    onChange={(e) => {
                      setNewPrize({ ...newPrize, weight: parseFloat(e.target.value) || 0 });
                      setErrors({});
                    }}
                    disabled={newPrizeNotWinnable}
                    className={newPrizeNotWinnable ? "opacity-50" : ""}
                  />
                  <div className="flex-1">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all"
                        style={{ width: `${calculatePercentage(newPrize.weight)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {parseFloat(calculatePercentage(newPrize.weight)) === 0 ? (
                        <>0% (não cai)</>
                      ) : (
                        <>{calculatePercentage(newPrize.weight)}% de chance</>
                      )}
                    </p>
                  </div>
                </div>
                {errors.weight && (
                  <p className="text-sm text-destructive">{errors.weight}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-prize-color">Cor do Segmento</Label>
                <div className="grid grid-cols-5 gap-2">
                  {colorOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setNewPrize({ ...newPrize, color: option.value })}
                      className={`h-12 rounded-md transition-all ${option.value} ${
                        newPrize.color === option.value
                          ? "ring-4 ring-primary scale-105"
                          : "hover:scale-105"
                      }`}
                      title={option.label}
                    />
                  ))}
                </div>
              </div>

              <Button onClick={addPrize} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Prêmio
              </Button>
            </div>
          </div>

          {/* Prizes List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">
                Prêmios Atuais ({prizes.length})
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={resetToDefaults}
              >
                Restaurar Padrão
              </Button>
            </div>

            <AnimatePresence mode="popLayout">
              {prizes.map((prize) => (
                <motion.div
                  key={prize.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-3 border border-border rounded-lg bg-card hover:border-primary/50 transition-colors"
                >
                  {editingId === prize.id ? (
                    <EditPrizeForm
                      prize={prize}
                      colorOptions={colorOptions}
                      onSave={(label, color, weight) => updatePrize(prize.id, label, color, weight)}
                      onCancel={() => {
                        setEditingId(null);
                        setErrors({});
                      }}
                      errors={errors}
                      onErrorsClear={() => setErrors({})}
                      calculatePercentage={calculatePercentage}
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-md ${prize.color} shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{prize.label}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Peso: {prize.weight}</span>
                          <span>•</span>
                          {prize.weight === 0 ? (
                            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                              🚫 Não ganhável
                            </Badge>
                          ) : (
                            <span>~{calculatePercentage(prize.weight)}% chance</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0 items-center">
                        <div className="flex flex-col items-center gap-1">
                          <Switch
                            checked={prize.weight === 0}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                updatePrize(prize.id, prize.label, prize.color, 0);
                              } else {
                                updatePrize(prize.id, prize.label, prize.color, 0.1);
                              }
                            }}
                            title={prize.weight === 0 ? "Ativar prêmio" : "Desativar prêmio"}
                          />
                          <span className="text-[9px] text-muted-foreground">
                            {prize.weight === 0 ? "Ativar" : "Desativar"}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingId(prize.id)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removePrize(prize.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface EditPrizeFormProps {
  prize: Prize;
  colorOptions: { label: string; value: string }[];
  onSave: (label: string, color: string, weight: number) => void;
  onCancel: () => void;
  errors: { label?: string; color?: string; weight?: string };
  onErrorsClear: () => void;
  calculatePercentage: (weight: number, showDecimals?: boolean) => string;
}

const EditPrizeForm = ({
  prize,
  colorOptions,
  onSave,
  onCancel,
  errors,
  onErrorsClear,
  calculatePercentage,
}: EditPrizeFormProps) => {
  const [label, setLabel] = useState(prize.label);
  const [color, setColor] = useState(prize.color);
  const [weight, setWeight] = useState(prize.weight);
  const [isNotWinnable, setIsNotWinnable] = useState(prize.weight === 0);
  const [previousWeight, setPreviousWeight] = useState(prize.weight === 0 ? 0.1 : prize.weight);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor={`edit-prize-${prize.id}`}>Nome do Prêmio</Label>
        <Input
          id={`edit-prize-${prize.id}`}
          value={label}
          onChange={(e) => {
            setLabel(e.target.value);
            onErrorsClear();
          }}
          maxLength={50}
        />
        {errors.label && (
          <p className="text-sm text-destructive">{errors.label}</p>
        )}
      </div>

      <div className="flex items-center gap-2 p-3 border border-border rounded-lg bg-muted/20">
        <Switch
          id={`edit-not-winnable-${prize.id}`}
          checked={isNotWinnable}
          onCheckedChange={(checked) => {
            setIsNotWinnable(checked);
            if (checked) {
              setPreviousWeight(weight);
              setWeight(0);
            } else {
              setWeight(previousWeight || 0.1);
            }
          }}
        />
        <Label 
          htmlFor={`edit-not-winnable-${prize.id}`}
          className="cursor-pointer flex items-center gap-2"
        >
          <span className="text-lg">🚫</span>
          <span>Prêmio não ganhável (nunca cai na roleta)</span>
        </Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`edit-weight-${prize.id}`}>
          Peso / Probabilidade
          <span className="text-xs text-muted-foreground ml-2">
            (0-1)
          </span>
        </Label>
        <div className="flex items-center gap-3">
          <Input
            id={`edit-weight-${prize.id}`}
            type="number"
            step="0.01"
            min="0"
            max="1"
            value={weight}
            onChange={(e) => {
              setWeight(parseFloat(e.target.value) || 0);
              onErrorsClear();
            }}
            disabled={isNotWinnable}
            className={isNotWinnable ? "opacity-50" : ""}
          />
          <div className="flex-1">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all"
                style={{ width: `${calculatePercentage(weight)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {parseFloat(calculatePercentage(weight)) === 0 ? (
                <>0% (não cai)</>
              ) : (
                <>{calculatePercentage(weight)}% de chance</>
              )}
            </p>
          </div>
        </div>
        {errors.weight && (
          <p className="text-sm text-destructive">{errors.weight}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Cor do Segmento</Label>
        <div className="grid grid-cols-5 gap-2">
          {colorOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setColor(option.value)}
              className={`h-10 rounded-md transition-all ${option.value} ${
                color === option.value
                  ? "ring-4 ring-primary scale-105"
                  : "hover:scale-105"
              }`}
              title={option.label}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={() => onSave(label, color, weight)} className="flex-1">
          <Save className="w-4 h-4 mr-2" />
          Salvar
        </Button>
        <Button variant="outline" onClick={onCancel} className="flex-1">
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
      </div>
    </div>
  );
};
