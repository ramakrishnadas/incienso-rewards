"use client"

import CanjeForm from "@/app/components/CanjeForm";
import MovimientoForm from "@/app/components/MovimientoForm";
import { useParams, useRouter, useSearchParams } from "next/navigation";

export default function MovimientoPage() {
  const params = useParams(); 
  const movimientoId = typeof params.id === "string" ? params.id : undefined;

  const router = useRouter();
  const searchParams = useSearchParams();
  const clienteId = searchParams.get("cliente_id");

  return (
    <div className="container mx-auto mt-6">
      {clienteId ? (
        <CanjeForm clienteId={clienteId} />
      ) : (
        <MovimientoForm movimientoId={movimientoId === "nuevo" ? undefined : movimientoId} />
      )
      }
    </div>
  );
}