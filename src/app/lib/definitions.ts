export type Cliente = {
    id: number;
    nombre: string;
    telefono: string;
    email: string;
    puntos: number;
    puede_referir: number;
    referido_por: number;
}

export type Movimiento = {
    id: number;
    cliente_id: number;
    tipo: string;
    monto: string;
    ticket: string;
    puntos: number;
    tasa_puntos: number;
    fecha: Date;
}