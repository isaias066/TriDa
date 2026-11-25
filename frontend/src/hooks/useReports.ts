import { useState, useEffect, useCallback, useRef } from "react";
import { reportsApi } from "@/api/Reports";
import { useToast } from "@/components/ui/Toast";
import type {
  FinancialReportData,
  ReportFilters,
  TipoPeriodoReporte,
} from "@/types";
import { useAccount } from "@/hooks/useAccount";
import { dateOnlyInBogota, monthStartDateInBogota } from "@/utils/Date";

export function getReportDateRange(filters: ReportFilters, today = new Date()) {
  if (filters.tipo_periodo === "PERSONALIZADO") {
    if (
      !filters.fecha_inicio ||
      !filters.fecha_fin ||
      filters.fecha_inicio > filters.fecha_fin
    ) {
      return null;
    }
    return {
      fecha_inicio: filters.fecha_inicio,
      fecha_fin: filters.fecha_fin,
    };
  }

  const fecha_fin = dateOnlyInBogota(today);
  let monthOffset = 0;
  switch (filters.tipo_periodo) {
    case "ULTIMOS_3_MESES":
      monthOffset = -2;
      break;
    case "ULTIMOS_6_MESES":
      monthOffset = -5;
      break;
    case "ANIO_ACTUAL":
      monthOffset = 1 - Number(fecha_fin.slice(5, 7));
      break;
  }
  return {
    fecha_inicio: monthStartDateInBogota(today, monthOffset),
    fecha_fin,
  };
}

export function useReports(initialFilters?: ReportFilters) {
  const { showToast } = useToast();
  const { selectedAccount } = useAccount();
  const [reportData, setReportData] = useState<FinancialReportData | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [exporting, setExporting] = useState<boolean>(false);
  const requestId = useRef(0);

  const [filters, setFilters] = useState<ReportFilters>({
    tipo_periodo: initialFilters?.tipo_periodo ?? "MES_ACTUAL",
    ...initialFilters,
  });

  const fetchReport = useCallback(async () => {
    const currentRequestId = ++requestId.current;
    setReportData(null);
    const dateRange = getReportDateRange(filters);
    if (!dateRange) {
      setReportData(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await reportsApi.getFinancialReport({
        ...dateRange,
        id_cuenta: selectedAccount?.id_cuenta,
      });
      if (currentRequestId !== requestId.current) return;
      setReportData(data);
    } catch (err) {
      if (currentRequestId !== requestId.current) return;
      const msg =
        err instanceof Error
          ? err.message
          : "Error al cargar reporte financiero";
      showToast({
        type: "error",
        title: "Error de Reportes",
        message: msg,
      });
    } finally {
      if (currentRequestId === requestId.current) setLoading(false);
    }
  }, [filters, selectedAccount?.id_cuenta, showToast]);

  useEffect(() => {
    fetchReport();
    return () => {
      requestId.current += 1;
    };
  }, [fetchReport]);

  const setPeriodType = (tipo: TipoPeriodoReporte) => {
    setFilters((prev) => {
      if (tipo === "PERSONALIZADO") {
        const today = new Date();
        return {
          ...prev,
          tipo_periodo: tipo,
          fecha_inicio: prev.fecha_inicio ?? monthStartDateInBogota(today),
          fecha_fin: prev.fecha_fin ?? dateOnlyInBogota(today),
        };
      }

      return {
        ...prev,
        tipo_periodo: tipo,
        fecha_inicio: undefined,
        fecha_fin: undefined,
      };
    });
  };

  const setCustomDateRange = (fecha_inicio: string, fecha_fin: string) => {
    setFilters((prev) => ({
      ...prev,
      tipo_periodo: "PERSONALIZADO",
      fecha_inicio,
      fecha_fin,
    }));
  };

  const exportReport = async () => {
    try {
      setExporting(true);
      if (!reportData) {
        throw new Error("Primero carga un reporte para exportarlo.");
      }
      const columns = [
        "fecha_transaccion",
        "tipo_movimiento",
        "monto",
        "comercio",
        "descripcion",
        "estado",
        "nombre_cuenta",
        "nombre_categoria",
      ] as const;
      const escapeCsv = (value: string | number | null) => {
        let text = String(value ?? "");
        if (typeof value === "string" && /^[=+\-@\t\r]/.test(text)) {
          text = `'${text}`;
        }
        return `"${text.replace(/"/g, '""')}"`;
      };
      const csv = [
        columns.join(","),
        ...reportData.transacciones.map((transaction) =>
          columns.map((column) => escapeCsv(transaction[column])).join(","),
        ),
      ].join("\r\n");
      const blob = new Blob(["\uFEFF", csv], {
        type: "text/csv;charset=utf-8",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte_financiero_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.setTimeout(() => window.URL.revokeObjectURL(url), 0);

      showToast({
        type: "success",
        title: "Reporte Exportado",
        message: "El archivo CSV se descargó exitosamente.",
      });
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "No se pudo generar la exportación";
      showToast({
        type: "error",
        title: "Error de Exportación",
        message: msg,
      });
    } finally {
      setExporting(false);
    }
  };

  return {
    reportData,
    loading,
    exporting,
    filters,
    setPeriodType,
    setCustomDateRange,
    refreshReport: fetchReport,
    exportReport,
  };
}
