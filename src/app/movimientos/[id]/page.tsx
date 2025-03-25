"use client"

import CanjeForm from "@/app/components/CanjeForm";
import MovimientoForm from "@/app/components/MovimientoForm";
import { useParams, useSearchParams } from "next/navigation";

export default function MovimientoPage() {
  const params = useParams(); 
  const movimientoId = typeof params.id === "string" ? params.id : undefined;

  const searchParams = useSearchParams();
  const clienteId = searchParams.get("cliente_id");

  return (
    <div className="container mx-auto mt-6">
      {/* If cliente_id exists in the URL */}
      {clienteId ? (
        // If the URL is 'movimientos/canje', show CanjeForm
        window.location.pathname.includes('canje') ? (
          <CanjeForm clienteId={clienteId} />
        ) : (
          // If the URL is 'movimientos/nuevo', show MovimientoForm with clienteId
          <MovimientoForm movimientoId={movimientoId === "nuevo" ? undefined : movimientoId} clienteId={clienteId} />
        )
      ) : (
        // Default to MovimientoForm without clienteId
        <MovimientoForm movimientoId={movimientoId === "nuevo" ? undefined : movimientoId} />
      )}
    </div>
  );
}