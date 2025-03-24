"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchClients, calculatePoints } from "../lib/helper";
import { Cliente } from "../lib/definitions";

export default function MovimientoForm({ movimientoId }: { movimientoId?: string }) {
  const [formData, setFormData] = useState({
    cliente_id: "",
    tipo: "Compra",
    monto: "",
    ticket: "",
    puntos: "",
    tasa_puntos: 1,
    fecha: new Date().toISOString().split("T")[0],
  });

  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data: clientes } = useQuery({ queryKey: ["clientes"], queryFn: fetchClients });

  useEffect(() => {
    if (movimientoId) {
      fetch(`/api/movimientos/${movimientoId}`)
        .then((res) => res.json())
        .then((data) => {
          const formattedDate = new Date(data.fecha).toISOString().split('T')[0];
          setFormData({
            ...data,
            fecha: formattedDate,
          });
        })
        .catch((err) => console.error(err));
    }
  }, [movimientoId]);

  useEffect(() => {
    const montoNum = parseFloat(formData.monto);
    const tasa_puntosNum = formData.tasa_puntos;

    const pointsString = calculatePoints(montoNum, tasa_puntosNum).toString()

    if (!isNaN(montoNum) && !isNaN(tasa_puntosNum)) {
      setFormData((prev) => ({
        ...prev,
        puntos: pointsString,
      }));
    }
  }, [formData.monto, formData.tasa_puntos]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      const method = movimientoId ? "PUT" : "POST";
      const response = await fetch(
        movimientoId ? `/api/movimientos/${movimientoId}` : "/api/movimientos",
        {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Error guardando el movimiento");

      setSuccess(movimientoId ? "Movimiento modificado exitosamente" : "Movimiento creado exitosamente");

      setTimeout(() => {
        router.push("/movimientos");
      }, 1500); // Slight delay to show success message

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
      <h2 className="text-xl font-semibold mb-4 text-black">{movimientoId ? "Editar Movimiento" : "Registrar Compra"}</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {success && <p className="text-green-500 mb-2">{success}</p>}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Cliente</label>
          <select
            name="cliente_id"
            value={formData.cliente_id || ""}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded text-black"
          >
            <option value="">Seleccione un cliente</option>
            {clientes?.map((c: Cliente) => (
              <option key={c.id} value={c.id}>
                {c.id} - {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Ticket</label>
          <input
            type="text"
            name="ticket"
            value={formData.ticket}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded text-black"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Monto</label>
          <input
            type="number"
            step="0.01"
            name="monto"
            value={formData.monto}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded text-black"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Tasa de Puntos</label>
          <input
            type="number"
            name="tasa_puntos"
            step="0.1"
            value={formData.tasa_puntos}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded text-black"
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
            className="w-full border px-3 py-2 rounded text-gray-500 cursor-not-allowed"
            disabled
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
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "Guardando..." : movimientoId ? "Guardar Cambios" : "Registrar"}
        </button>
      </form>
    </div>
  );
}
