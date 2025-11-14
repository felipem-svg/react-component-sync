import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Download, ArrowUpDown } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";

interface UserPrize {
  id: string;
  prize_label: string;
  prize_color: string;
  won_at: string;
  user_email: string;
  betboom_id: string;
}

interface PrizesTableProps {
  prizes: UserPrize[];
}

export const PrizesTable = ({ prizes }: PrizesTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [sortBy, setSortBy] = useState<"won_at" | "prize_label" | "user_email" | "betboom_id">("won_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Sort prizes
  const sortedPrizes = [...prizes].sort((a, b) => {
    let compareA: string | number = a[sortBy];
    let compareB: string | number = b[sortBy];

    if (sortBy === "won_at") {
      compareA = new Date(a.won_at).getTime();
      compareB = new Date(b.won_at).getTime();
    }

    if (sortOrder === "asc") {
      return compareA > compareB ? 1 : -1;
    } else {
      return compareA < compareB ? 1 : -1;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedPrizes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPrizes = sortedPrizes.slice(startIndex, endIndex);

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const exportToCSV = () => {
    const headers = ["Data/Hora", "Prêmio", "Email do Usuário", "ID Betboom"];
    const rows = prizes.map((prize) => [
      format(new Date(prize.won_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR }),
      prize.prize_label,
      prize.user_email,
      prize.betboom_id,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `premios_${format(new Date(), "dd-MM-yyyy")}.csv`;
    link.click();
  };

  return (
    <Card>
      <div className="p-4 flex justify-between items-center border-b">
        <h3 className="font-semibold">Histórico de Prêmios</h3>
        <Button variant="outline" size="sm" onClick={exportToCSV}>
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("won_at")}
                  className="flex items-center"
                >
                  Data/Hora
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("prize_label")}
                  className="flex items-center"
                >
                  Prêmio
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("user_email")}
                  className="flex items-center"
                >
                  Usuário
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("betboom_id")}
                  className="flex items-center"
                >
                  ID Betboom
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPrizes.map((prize, index) => (
              <motion.tr
                key={prize.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b"
              >
                <TableCell className="font-medium">
                  {format(new Date(prize.won_at), "dd/MM/yyyy", {
                    locale: ptBR,
                  })}
                  <br />
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(prize.won_at), "HH:mm:ss", {
                      locale: ptBR,
                    })}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    style={{
                      backgroundColor: prize.prize_color,
                      color: "#fff",
                    }}
                  >
                    {prize.prize_label}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {prize.user_email}
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm">{prize.betboom_id}</span>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Itens por página:
          </span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              setItemsPerPage(Number(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          Mostrando {startIndex + 1} a {Math.min(endIndex, prizes.length)} de{" "}
          {prizes.length} prêmios
        </div>
      </div>
    </Card>
  );
};
