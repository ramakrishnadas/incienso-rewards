import pool from '@/app/lib/db';
import { RowDataPacket } from 'mysql2';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM clientes ORDER BY id DESC LIMIT 1');

        return NextResponse.json(rows[0]);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching clientes'}, { status: 500});
    }
}