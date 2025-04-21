"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { fetchClients, calculatePoints, formatDate } from "../lib/helper";
import { Cliente } from "../lib/definitions";
import Html5QrcodePlugin from "./Html5QrcodeScannerPlugin";

export default function MovimientoForm({ movimientoId, clienteId }: { movimientoId?: string, clienteId?: string }) {
  const [formData, setFormData] = useState({
    cliente_id: clienteId,
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
  const ticketInputRef = useRef<HTMLInputElement>(null);
  const html5QrcodeScannerRef = useRef<any>(null);
  const [showScanner, setShowScanner] = useState(false);

  const { data: clientes } = useQuery({ queryKey: ["clientes"], queryFn: fetchClients });
  
  let cliente;
  if (clienteId) {
    cliente = clientes?.find((c: Cliente) => c.id === parseInt(clienteId));
  }
  
  useEffect(() => {
    if (movimientoId) {
      fetch(`/api/movimientos/${movimientoId}`)
        .then((res) => res.json())
        .then((data) => {
          const fechaSinFormato = new Date(data.fecha);
          const formattedDate = formatDate(fechaSinFormato);
          setFormData({
            ...data,
            monto: data.monto ?? "",
            ticket: data.ticket ?? "",
            puntos: data.puntos ?? 0,
            tasa_puntos: data.tasa_puntos ?? 1,
            fecha: formattedDate ? formattedDate : new Date(),
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

  const handleScanSuccess = (decodedText: string) => {
    setFormData((prev) => ({ ...prev, ticket: decodedText }));
    html5QrcodeScannerRef.current?.stopScanning?.();
    setShowScanner(false);
  };

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
        {cliente ? (
          <div className="mb-4">
            <label className="block text-gray-700">Cliente</label>
            <input
              type="text"
              value={clienteId + " - " + cliente?.nombre} 
              readOnly
              className="w-full border px-3 py-2 rounded text-gray-500 cursor-not-allowed"
            />
          </div>
        ) : (
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
        )}
        
        <div className="mb-4 relative">
          <label className="block text-gray-700">Ticket</label>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              name="ticket"
              ref={ticketInputRef}
              value={formData.ticket}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded text-black"
            />
            <button
              type="button"
              onClick={() => setShowScanner(true)}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm cursor-pointer"
            >
              Escanear
            </button>
          </div>
        

          {showScanner && (
            <div className="absolute z-50 top-full left-0 mt-2 bg-white shadow-lg p-2 rounded">
              <Html5QrcodePlugin
                ref={html5QrcodeScannerRef}
                fps={10}
                qrbox={250}
                disableFlip={false}
                qrCodeSuccessCallback={handleScanSuccess}
              />
              <button
                onClick={() => setShowScanner(false)}
                className="mt-2 px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-xs cursor-pointer"
              >
                Cerrar escáner
              </button>
            </div>
          )}
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
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 cursor-pointer"
          disabled={loading}
        >
          {loading ? "Guardando..." : movimientoId ? "Guardar Cambios" : "Registrar"}
        </button>
      </form>
    </div>
  );
}
