import { NextResponse } from "next/server";
import pool from '@/app/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { Cliente } from "@/app/lib/definitions";
import axios from "axios";


const whatsappUrl = process.env.WHATSAPP_API_URL;
const PHONE_NUMBER_ID = process.env.WA_PHONE_ID!;
const ACCESS_TOKEN = process.env.WA_ACCESS_TOKEN!;

const fullUrl = `${whatsappUrl}${PHONE_NUMBER_ID}/messages`;


export async function POST(request: Request) {
  
  try {
    // Fetch clients who meet the condition
    const minPoints = 50;
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM clientes WHERE puntos >= ?', [minPoints]);
    const filteredClientes: Cliente[] = rows as Cliente[];
    
    if (!Array.isArray(filteredClientes) || rows.length === 0) {
      return NextResponse.json({ message: "No qualifying clients." }, { status: 200 });
    }

    // Send WhatsApp messages
    const results = await Promise.all(filteredClientes.map(async (cliente: Cliente) => {
      const numero = `52${cliente.telefono}`
      const messageData = {
        messaging_product: "whatsapp",
        to: numero, // Ensure phone numbers include country code
        type: "template",
        template: {
          name: "recompensas_puntos",
          language: { code: "es_MX" },
          components: [
            { type: "body", parameters: [{ type: "text", text: cliente.nombre }, { type: "text", text: cliente.puntos }] }
          ]
        }
      };
    
      const response = await axios.post(fullUrl, messageData, {
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, "Content-Type": "application/json" }
      });

      return { client: cliente.nombre, status: response.status, data: response.data };
    }));

    return NextResponse.json({ success: true, message: 'Messages sent!', results }, { status: 200 });

  } catch (error: any) {
    console.error("Error sending messages:", error.response?.data || error.message);
    return NextResponse.json({ success: false,error: 'Failed to send messages' }, { status: 500 });

  }
}
