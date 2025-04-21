import pool from '@/app/lib/db';
import { ResultSetHeader } from 'mysql2/promise';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const [rows] = await pool.query('SELECT * FROM clientes');

        return NextResponse.json(rows);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching clientes'}, { status: 500});
    }
}

export async function POST(request: Request) {
    try {
        const { nombre, telefono, email, puntos, puede_referir, referido_por, direccion, codigo_postal } = await request.json();

        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO clientes (nombre, telefono, email, puntos, puede_referir, referido_por, direccion, codigo_postal) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [nombre, telefono, email, puntos, puede_referir, referido_por || null, direccion, codigo_postal]
        );

        
        return NextResponse.json({ message: 'Cliente created successfully', id: result.insertId }, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error adding cliente' }, { status: 500 });
    }
}
