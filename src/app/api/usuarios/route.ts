import pool from '@/app/lib/db';
import { ResultSetHeader } from 'mysql2/promise';
import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';

export async function GET() {
    try {
        const [rows] = await pool.query('SELECT * FROM usuarios');

        return NextResponse.json(rows);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching usuarios'}, { status: 500});
    }
}

export async function POST(request: Request) {
    try {
        const { nombre, email, password } = await request.json();
        
        const hashedPassword = await hash(password, 10);
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
            [nombre, email, hashedPassword]
        );

        
        return NextResponse.json({ message: 'Usuario created successfully', id: result.insertId }, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error adding usuario' }, { status: 500 });
    }
}
