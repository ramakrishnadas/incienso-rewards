"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchClients } from "../lib/helper";
import { Cliente } from "../lib/definitions";

export default function CanjeForm({ clienteId }: { clienteId: string }) {
  const [formData, setFormData] = useState({
    cliente_id: clienteId,
    tipo: "Canje",
    puntos: "",
    fecha: new Date().toISOString().split("T")[0], // Default to today
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data: clientes } = useQuery({ queryKey: ["clientes"], queryFn: fetchClients });

  const cliente = clientes?.find((c: Cliente) => c.id === parseInt(clienteId));

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/movimientos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Error registrando el canje");

      setSuccess("Canje registrado exitosamente");

      setTimeout(() => {
        router.push("/movimientos");
      }, 1500); // Show success message briefly

    } catch (err: unknown) {
      // Check if the error is an instance of Error
      if (err instanceof Error) {
        setError(err.message || "Ocurrió un error");
      } else {
        setError("Ocurrió un error desconocido");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded px-8 py-6 max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-black">Registrar Canje</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {success && <p className="text-green-500 mb-2">{success}</p>}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Cliente</label>
          <input
            type="text"
            value={clienteId + " - " + cliente?.nombre} 
            readOnly
            className="w-full border px-3 py-2 rounded text-gray-500 cursor-not-allowed"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Puntos</label>
          <input
            type="number"
            name="puntos"
            value={formData.puntos}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded text-black"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Fecha</label>
          <input
            type="date"
            name="fecha"
            value={formData.fecha}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded text-black"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 cursor-pointer"
          disabled={loading}
        >
          {loading ? "Guardando..." : "Registrar Canje"}
        </button>
      </form>
    </div>
  );
}