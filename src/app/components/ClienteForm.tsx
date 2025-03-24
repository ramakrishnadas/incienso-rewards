"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchClients } from "../lib/helper";
import { Cliente } from "../lib/definitions";

export default function ClienteForm({ clienteId }: { clienteId?: string }) {
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    email: "",
    puntos: 0,
    puede_referir: false,
    referido_por: null,
  });

  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data: clientes } = useQuery({ queryKey: ["clientes"], queryFn: fetchClients });

  useEffect(() => {
    if (clienteId) {
      fetch(`/api/clientes/${clienteId}`)
        .then((res) => res.json())
        .then((data) => setFormData(data))
        .catch((err) => console.error(err));
    }
  }, [clienteId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" && e.target instanceof HTMLInputElement ? e.target.checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const method = clienteId ? "PUT" : "POST";
      const response = await fetch(
        clienteId ? `/api/clientes/${clienteId}` : "/api/clientes",
        {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Error guardando al cliente");

      setSuccess(clienteId ? "Cliente modificado exitosamente" : "Cliente creado exitosamente");

      setTimeout(() => {
        router.push("/clientes");
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
      <h2 className="text-xl font-semibold mb-4 text-black">{clienteId ? "Editar Cliente" : "Registrar Cliente"}</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {success && <p className="text-green-500 mb-2">{success}</p>}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Nombre</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded text-black"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Teléfono</label>
          <input
            type="text"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded text-black"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
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
            className="w-full border px-3 py-2 rounded text-black"
          />
        </div>

        <div className="mb-4">
          <label className="inline-flex items-center text-black">
            <input
              type="checkbox"
              name="puede_referir"
              checked={formData.puede_referir}
              onChange={handleChange}
              className="mr-2"
            />
            Puede referir
          </label>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Referido por</label>
          <select
            name="referido_por"
            value={formData.referido_por || ""}
            onChange={handleChange}
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

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "Guardando..." : clienteId ? "Guardar Cambios" : "Registrar"}
        </button>
      </form>
    </div>
  );
}
