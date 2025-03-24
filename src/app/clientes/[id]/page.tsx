"use client"

import ClienteForm from "@/app/components/ClienteForm";
import { useParams } from "next/navigation";

export default function ClientePage() {
  const params = useParams(); 
  const clienteId = typeof params.id === "string" ? params.id : undefined;

  return (
    <div className="container mx-auto mt-6">
      <ClienteForm clienteId={clienteId === "nuevo" ? undefined : clienteId} />
    </div>
  );
}