import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import mysql, { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = await params;

        if (isNaN(parseInt(id, 10))) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }
        
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM clientes WHERE id = ?', [id]);

        if (rows.length === 0) {
            return NextResponse.json({ error: 'Cliente not found' }, { status: 404 });
        }

        return NextResponse.json(rows[0]);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching cliente' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        // Need to add validation
        const { id } = await params;

        if (isNaN(parseInt(id, 10))) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const { nombre, telefono, email, puntos, puede_referir, referido_por } = await request.json();

        const [result] = await pool.query<ResultSetHeader>(
            'UPDATE clientes SET nombre = ?, telefono = ?, email = ?, puntos = ?, puede_referir = ?, referido_por = ? WHERE id = ?',
            [nombre, telefono, email, puntos, puede_referir, referido_por || null, id]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: 'Cliente not found' }, { status: 404 });
        }

        return NextResponse.json({message: 'Cliente updated successfully'}, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Error updating cliente' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = await params;

        if (isNaN(parseInt(id, 10))) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const [result] = await pool.query<ResultSetHeader>('DELETE FROM clientes WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: 'Cliente not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Cliente deleted successfully' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Error deleting cliente' }, { status: 500 });
    }
}
