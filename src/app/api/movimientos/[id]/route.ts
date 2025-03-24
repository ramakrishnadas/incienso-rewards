import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import mysql, { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }>}) {
    try {
        const { id } = await params;

        if (isNaN(parseInt(id, 10))) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }
        
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM movimientos WHERE id = ?', [id]);

        if (rows.length === 0) {
            return NextResponse.json({ error: 'Movimiento not found' }, { status: 404 });
        }

        return NextResponse.json(rows[0]);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching movimiento' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }>}) {
    try {
        // Need to add validation
        const { id } = await params;

        if (isNaN(parseInt(id, 10))) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const { cliente_id, tipo, monto, ticket, puntos, tasa_puntos, fecha } = await request.json();

        const [result] = await pool.query<ResultSetHeader>(
            'UPDATE movimientos SET cliente_id = ?, tipo = ?, monto = ?, ticket = ?, puntos = ?, tasa_puntos = ?, fecha = ? WHERE id = ?',
            [cliente_id, tipo, monto || null, ticket, puntos, tasa_puntos, fecha, id]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: 'Movimiento not found' }, { status: 404 });
        }

        return NextResponse.json({message: 'Movimiento updated successfully'}, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Error updating movimiento' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }>}) {
    try {
        const { id } = await params;

        if (isNaN(parseInt(id, 10))) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const [result] = await pool.query<ResultSetHeader>('DELETE FROM movimientos WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: 'Movimiento not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Movimiento deleted successfully' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Error deleting movimiento' }, { status: 500 });
    }
}
