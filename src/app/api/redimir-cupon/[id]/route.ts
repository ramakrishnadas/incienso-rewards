import pool from "@/app/lib/db";
import { ResultSetHeader, RowDataPacket} from "mysql2";
import { NextResponse } from "next/server";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }>}) {
    try {
        // Need to add validation
        const { id } = await params;

        if (isNaN(parseInt(id, 10))) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const redimido = true;

        const [result] = await pool.query<ResultSetHeader>(
            'UPDATE cupones SET redimido = ? WHERE id = ?',
            [redimido, id]
        );

        const [cupon] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM cupones WHERE id = ?',
            [id]
        );

        const clienteId = cupon[0].cliente_id;
        const clientePuntos = cupon[0].puntos;

        const [updatePoints] = await pool.query<ResultSetHeader>(
            'UPDATE clientes SET puntos = puntos - ? WHERE id = ?',
            [clientePuntos, clienteId]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: 'Cupón not found' }, { status: 404 });
        }

        return NextResponse.json({message: 'Cupón updated successfully'}, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error updating cupón' }, { status: 500 });
    }
}