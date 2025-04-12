import pool from '@/app/lib/db';
import { ResultSetHeader } from 'mysql2/promise';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const [rows] = await pool.query('SELECT * FROM cupones');

        return NextResponse.json(rows);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching cupones'}, { status: 500});
    }
}

export async function POST(request: Request) {
    try {
        const { cliente_id, codigo, puntos, fecha_creacion, fecha_vencimiento, redimido } = await request.json();

        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO cupones (cliente_id, codigo, puntos, fecha_creacion, fecha_vencimiento, redimido) VALUES (?, ?, ?, ?, ?, ?)',
            [cliente_id, codigo, puntos, fecha_creacion, fecha_vencimiento, redimido]
        );

        
        return NextResponse.json({ message: 'Cupón created successfully', id: result.insertId }, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error adding cupón' }, { status: 500 });
    }
}
