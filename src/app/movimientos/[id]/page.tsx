"use client"

import CanjeForm from "@/app/components/CanjeForm";
import MovimientoForm from "@/app/components/MovimientoForm";
import { useParams, useSearchParams, usePathname } from "next/navigation";

export default function MovimientoPage() {
  const params = useParams(); 
  const movimientoId = typeof params.id === "string" ? params.id : undefined;

  const searchParams = useSearchParams();
  const clienteId = searchParams.get("cliente_id");
  const puntosDescontadosURL = searchParams.get("puntos_descontados");
  const puntosDescontados = puntosDescontadosURL ? parseInt(puntosDescontadosURL) : undefined;

  const pathname = usePathname();

  return (
    <div className="container mx-auto mt-6">
      {/* If cliente_id exists in the URL */}
      {pathname.includes('canje') ? (
          <CanjeForm clienteId={clienteId ?? ""} />
        ) : (
          <MovimientoForm movimientoId={movimientoId === "nuevo" ? undefined : movimientoId} clienteId={clienteId ?? ""} puntosDescontados={puntosDescontados} />
        )
      }
    </div>
  );
}