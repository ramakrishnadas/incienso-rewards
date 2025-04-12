import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }>}) {
    try {
        const { id } = await params;

        if (isNaN(parseInt(id, 10))) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }
        
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM cupones WHERE id = ?', [id]);

        if (rows.length === 0) {
            return NextResponse.json({ error: 'Cupón not found' }, { status: 404 });
        }

        return NextResponse.json(rows[0]);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching cupón' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }>}) {
    try {
        // Need to add validation
        const { id } = await params;

        if (isNaN(parseInt(id, 10))) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const { cliente_id, codigo, puntos, fecha_creacion, fecha_vencimiento, redimido } = await request.json();

        const [result] = await pool.query<ResultSetHeader>(
            'UPDATE cupones SET cliente_id = ?, codigo = ?, puntos = ?, fecha_creacion = ?, fecha_vencimiento = ?, redimido = ? WHERE id = ?',
            [cliente_id, codigo, puntos, fecha_creacion, fecha_vencimiento, redimido]
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

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }>}) {
    try {
        const { id } = await params;

        if (isNaN(parseInt(id, 10))) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const [result] = await pool.query<ResultSetHeader>('DELETE FROM cupones WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: 'Cupón not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Cupón deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error deleting cupón' }, { status: 500 });
    }
}
