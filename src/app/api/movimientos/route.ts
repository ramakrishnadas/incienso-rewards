import pool from '@/app/lib/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const [rows] = await pool.query('SELECT * FROM movimientos');

        return NextResponse.json(rows);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching movimientos'}, { status: 500});
    }
}

export async function POST(request: Request) {
    try {
        const { cliente_id, tipo, monto, ticket, puntos, tasa_puntos, fecha } = await request.json();

        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO movimientos (cliente_id, tipo, monto, ticket, puntos, tasa_puntos, fecha) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [cliente_id, tipo, monto, ticket, puntos, tasa_puntos, fecha]
        );
        
        
        switch (tipo) {
            case "Compra":
                const [compraResult] = await pool.query<ResultSetHeader>(
                    'UPDATE clientes SET puntos = puntos + ? WHERE id = ?',
                    [puntos, cliente_id]
                );
                console.log(compraResult);

                // Check if it's the first purchase of this client
                const [primeraCompraResult] = await pool.query<RowDataPacket[]>(
                    'SELECT COUNT(*) AS first_compra FROM movimientos WHERE cliente_id = ? AND tipo = "Compra"',
                    [cliente_id]
                )
                const isFirstCompra = primeraCompraResult[0].first_compra === 1;
                
                console.log(primeraCompraResult);

                if (isFirstCompra) {
                    // Agregar puntos por primera compra
                    const puntosPorPrimeraCompra = 20;
                    const tipoPrimeraCompra = "Bono por primera compra";
                    const [primeraCompraResult] = await pool.query<ResultSetHeader>(
                        'INSERT INTO movimientos (cliente_id, tipo, puntos, fecha) VALUES (?, ?, ?, ?)',
                        [cliente_id, tipoPrimeraCompra, puntosPorPrimeraCompra, fecha]
                    );
                    console.log(primeraCompraResult);
                    const [puntosPrimeraCompraResult] = await pool.query<ResultSetHeader>(
                        'UPDATE clientes SET puntos = puntos + ? WHERE id = ?',
                        [puntosPorPrimeraCompra, cliente_id]
                    );
                    console.log(puntosPrimeraCompraResult);

                    // Buscar cliente que refirio y darle puntos
                    const [referrerResult] = await pool.query<RowDataPacket[]>(
                        'SELECT referido_por FROM clientes WHERE id = ?',
                        [cliente_id]
                    );

                    console.log(referrerResult);
                    
                    const referrerId = referrerResult[0]?.referido_por;

                    console.log(referrerId);
                    
                    if (referrerId) {
                        const puntosPorReferido = 40;
                        const tipoBonoReferido = "Bono por referido";
                        const [bonoReferidoResult] = await pool.query<ResultSetHeader>(
                            'INSERT INTO movimientos (cliente_id, tipo, puntos, fecha) VALUES (?, ?, ?, ?)',
                            [referrerId, tipoBonoReferido, puntosPorReferido, fecha]
                        );
                        console.log(bonoReferidoResult);
                        const [puntosReferidoResult] = await pool.query(
                            'UPDATE clientes SET puntos = puntos + ? WHERE id = ?',
                            [puntosPorReferido, referrerId]
                        );
                        console.log(puntosReferidoResult);
                        console.log(`Added ${puntos} points to referrer with ID ${referrerId}`);
                    }
                } 
                break
            case "Canje":
                const [canjeResult] = await pool.query<ResultSetHeader>(
                    'UPDATE clientes SET puntos = puntos - ? WHERE id = ?',
                    [puntos, cliente_id]
                );
                console.log(canjeResult);
                break;
        }
        
        return NextResponse.json({ message: 'Movimiento created successfully', id: result.insertId }, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error adding movimiento' }, { status: 500 });
    }
}
