export type Cliente = {
    id: number;
    nombre: string;
    telefono: string;
    email: string;
    puntos: number;
    puede_referir: number;
    referido_por: number;
    direccion: string;
    codigo_postal: string;
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

export type Cupon = {
    id: number;
    cliente_id: number;
    codigo: string;
    puntos: number;
    fecha_creacion: Date;
    fecha_vencimiento: Date;
    redimido: boolean;
}

export type Direccion = {
    codigo_postal: string;
    colonia: string;
}