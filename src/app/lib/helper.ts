export const fetchClients = async () => {
    const res = await fetch('/api/clientes');
    return res.json();
};

export const fetchMovimientos = async () => {
    const res = await fetch('/api/movimientos');
    return res.json();
};

export const calculatePoints = (monto: number, tasa_puntos: number) => {
    const points = Math.round(monto * 0.1) * tasa_puntos;
    return points;
}