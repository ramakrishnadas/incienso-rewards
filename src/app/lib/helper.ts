import { Cliente } from "./definitions";

export const fetchClients = async () => {
    const res = await fetch('/api/clientes');
    return res.json();
};

export async function fetchClienteById(id: string): Promise<Cliente | null> {
    const res = await fetch(`/api/cliente/${id}`);
  
    if (res.status === 404) return null; // Return null for nonexistent clients
    if (!res.ok) throw new Error("Error fetching cliente");
  
    return res.json();
}

export const fetchMovimientos = async () => {
    const res = await fetch('/api/movimientos');
    return res.json();
};

export const fetchCupones = async () => {
    const res = await fetch('/api/cupones');
    return res.json();
};

export const calculatePoints = (monto: number, tasa_puntos: number) => {
    const points = Math.round(monto * 0.07) * tasa_puntos;
    return points;
}

export const sendRewardMessages = async () => {
    const res = await fetch('/api/send-messages', { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
    });
    return res.json();
}

export async function redimirCupon(id: string) {
    const res = await fetch(`/api/redimir-cupon/${id}`, { method: "PUT" });
  
    if (res.status === 404) return null;
    if (!res.ok) throw new Error("Error redimiendo cupón");
  
    return res.json();
}

export function daysUntilExpiration(fecha: string): number {
    const today = new Date();
    const expiration = new Date(fecha);
    const diff = expiration.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24)); // Convert ms to days
}

export function formatDate(fecha: Date) {
    const day = String(fecha.getDate()).padStart(2, '0');
    const month = String(fecha.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = fecha.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    return formattedDate;
}