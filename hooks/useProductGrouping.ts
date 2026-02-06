import { useState, useCallback } from "react";
import { supabase } from "../src/supabase";
import { Product } from "../types";

interface UseProductGroupingReturn {
  isGroupingMode: boolean;
  toggleGroupingMode: () => void;
  isUngroupingMode: boolean;
  toggleUngroupingMode: () => void;
  handleDragEnd: (
    activeId: string,
    overId: string,
    products: Product[],
  ) => Promise<void>;
  handleUngroup: (productId: string, products: Product[]) => Promise<void>;
  isProcessing: boolean;
  error: string | null;
  successMessage: string | null;
  clearMessages: () => void;
}

export const useProductGrouping = (
  onUpdateProduct: (product: Product) => void,
  onRefreshProducts?: () => Promise<void>,
): UseProductGroupingReturn => {
  const [isGroupingMode, setIsGroupingMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isUngroupingMode, setIsUngroupingMode] = useState(false);

  const toggleGroupingMode = useCallback(() => {
    setIsGroupingMode((prev) => {
      const newVal = !prev;
      if (newVal) setIsUngroupingMode(false); // Disable ungrouping if grouping is active
      return newVal;
    });
    setError(null);
    setSuccessMessage(null);
  }, []);

  const toggleUngroupingMode = useCallback(() => {
    setIsUngroupingMode((prev) => {
      const newVal = !prev;
      if (newVal) setIsGroupingMode(false); // Disable grouping if ungrouping is active
      return newVal;
    });
    setError(null);
    setSuccessMessage(null);
  }, []);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  const handleDragEnd = useCallback(
    async (activeId: string, overId: string, products: Product[]) => {
      // Extract actual ID from drop zone ID
      const targetId = overId.replace("drop-", "");

      if (activeId === targetId) return;

      setIsProcessing(true);
      setError(null);

      const draggedProduct = products.find((p) => p.id === activeId);
      const targetProduct = products.find((p) => p.id === targetId);

      if (!draggedProduct || !targetProduct) {
        setError("No se encontraron los productos");
        setIsProcessing(false);
        return;
      }

      // Determine the set_name to use
      // Priority: target's existing set_name, or target's name as new set_name
      let newSetName: string;

      if (targetProduct.set_name && targetProduct.set_name !== "Sin set") {
        // Target already has a set, add to it
        newSetName = targetProduct.set_name;
      } else {
        // Create new set using target product's name
        newSetName = targetProduct.name.replace(/\s*Header\s*/gi, "").trim();
      }

      try {
        console.log("[Grouping] Starting update:", {
          draggedId: activeId,
          draggedName: draggedProduct.name,
          targetId: targetId,
          targetName: targetProduct.name,
          newSetName,
        });

        // Update both products in Supabase and SELECT to verify the update happened
        const updates = await Promise.all([
          supabase
            .from("products")
            .update({ set_name: newSetName })
            .eq("id", activeId)
            .select(),
          supabase
            .from("products")
            .update({ set_name: newSetName })
            .eq("id", targetId)
            .select(),
        ]);

        console.log(
          "[Grouping] Supabase results:",
          updates.map((u) => ({
            error: u.error,
            count: u.count,
            status: u.status,
            dataLength: u.data?.length,
          })),
        );

        // Check for errors or empty updates (RLS silent failure)
        const errors = updates.filter((r) => r.error);
        if (errors.length > 0) {
          throw new Error(
            errors[0].error?.message || "Error al actualizar productos",
          );
        }

        // Verify that data was actually modified
        const emptyUpdates = updates.filter(
          (r) => !r.data || r.data.length === 0,
        );
        if (emptyUpdates.length > 0) {
          throw new Error(
            "No se pudieron guardar los cambios. Verifica tus permisos de administrador.",
          );
        }

        // Refresh products from database to ensure consistency
        if (onRefreshProducts) {
          console.log("[Grouping] Calling onRefreshProducts...");
          await onRefreshProducts();
          console.log("[Grouping] Products refreshed");
        } else {
          console.log("[Grouping] No refresh function, updating local state");
          // Fallback: Update local state
          onUpdateProduct({ ...draggedProduct, set_name: newSetName });
          onUpdateProduct({ ...targetProduct, set_name: newSetName });
        }

        setSuccessMessage(
          `"${draggedProduct.name}" agregado al set "${newSetName}"`,
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error desconocido al agrupar",
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [onUpdateProduct, onRefreshProducts],
  );

  const handleUngroup = useCallback(
    async (productId: string, products: Product[]) => {
      setIsProcessing(true);
      setError(null);

      const product = products.find((p) => p.id === productId);
      if (!product) {
        setError("Producto no encontrado");
        setIsProcessing(false);
        return;
      }

      try {
        const { error: updateError } = await supabase
          .from("products")
          .update({ set_name: "Sin set" })
          .eq("id", productId);

        if (updateError) throw updateError;

        // Refresh products from database to ensure consistency
        if (onRefreshProducts) {
          await onRefreshProducts();
        } else {
          onUpdateProduct({ ...product, set_name: "Sin set" });
        }
        setSuccessMessage(`"${product.name}" removido del set`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al desagrupar");
      } finally {
        setIsProcessing(false);
      }
    },
    [onUpdateProduct, onRefreshProducts],
  );

  return {
    isGroupingMode,
    toggleGroupingMode,
    isUngroupingMode,
    toggleUngroupingMode,
    handleDragEnd,
    handleUngroup,
    isProcessing,
    error,
    successMessage,
    clearMessages,
  };
};
