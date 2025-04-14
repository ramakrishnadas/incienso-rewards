"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { daysUntilExpiration, fetchClients, fetchCupones, formatDate, redimirCupon } from "./lib/helper";
import { Cliente, Cupon } from "./lib/definitions";
import DataTable from "react-data-table-component";
import HiddenCoupon from "./components/HiddenCoupon";
import ConfirmationModal from "./components/ConfirmationModal";

export default function Home() {

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [cuponToRender, setCuponToRender] = useState<{
    codigo: string;
    clienteNombre: string;
    fechaVencimiento: string;
    puntos: number;
  } | null>(null);
  const [confirmingCupon, setConfirmingCupon] = useState<Cupon | null>(null);

  const queryClient = useQueryClient();

  const { data: cupones, isLoading } = useQuery({ queryKey: ["cupones"], queryFn: fetchCupones });
  const { data: clientes } = useQuery({ queryKey: ["clientes"], queryFn: fetchClients });


  const soonExpiringCupones = cupones?.filter((c: Cupon) => {
    if (c.redimido) return false;

    const daysLeft = daysUntilExpiration(String(c.fecha_vencimiento));
    return daysLeft <= 45; // Only cupones expiring in 1.5 months (≈ 45 days)
  });

  const sortedExpiringCupones = soonExpiringCupones?.sort((a: Cupon, b: Cupon) => {
    const daysA = daysUntilExpiration(String(a.fecha_vencimiento));
    const daysB = daysUntilExpiration(String(b.fecha_vencimiento));
    return daysA - daysB; // cupones closer to expiring come first
  });

  const conditionalRowStyles = [
    {
      when: (row: Cupon) => {
        const daysLeft = daysUntilExpiration(String(row.fecha_vencimiento));
        return daysLeft <= 30;
      },
      style: {
        backgroundColor: '#f8d7da',
        
      },
    },
    {
      when: (row: Cupon) => {
        const daysLeft = daysUntilExpiration(String(row.fecha_vencimiento));
        return daysLeft > 30 && daysLeft <= 45;
      },
      style: {
        backgroundColor: '#fff3cd',
        
      },
    },
  ];

  const customStyles = {
    table: {
      style: {
        border: '1px solid #D3D3D3',
      },
    },
    header: {
      style: {
        
        fontSize: '20px',
        fontWeight: 'bold',
      },
    },
    headRow: {
      style: {
        backgroundColor: '#ffffff',
        fontWeight: 'bold',
        fontSize: '14px'
      },
    },
    rows: {
      style: {
        fontSize: '16px'
      }
    },
    pagination: {
      style: {
        
        marginTop: '10px',
        padding: '10px',
        color: '#000000'
      }
    }
    
  };

  const columns = [
      // { name: 'ID', selector: (row: Cupon) => row.id, width: '80px' },
      { name: 'Nombre', selector: (row: Cupon) => {
        if (!clientes) return false;
        const cliente = clientes.find((c: Cupon) => c.id === row.cliente_id);
        return cliente ? cliente.nombre : 'N/A';
        }, sortable: true, $grow: 2
      },
      { name: 'Teléfono', selector: (row: Cupon) => {
        if (!clientes) return false;
        const cliente = clientes.find((c: Cliente) => c.id === row.cliente_id);
        return cliente ? cliente.telefono : 'N/A';
        },
      },
      { name: 'Codigo', selector: (row: Cupon) => row.codigo, grow: 0.8 },
      { name: 'Puntos', 
        selector: (row: Cupon) => row.puntos, 
        sortable: true, 
        grow: 0.5, 
        conditionalCellStyles: [
          {
            when: () => true, // applies to every row
            style: {
              color: '#3846ae',
              fontWeight: 'bold'
            },
          },
        ],
      },
      { name: 'Vencimiento', selector: (row: Cupon) => {
        const fechaVencimiento = new Date(row.fecha_vencimiento); // Convert to Date object
        const formattedDate = formatDate(fechaVencimiento);
        return formattedDate;
        }, $grow: 1.5
      },
      { name: 'Redimido', selector: (row: Cupon) => row.redimido ? 'Sí' : 'No', grow: 0.5},
      {
        name: '',
        cell: (row: Cupon) => {
          if (row.redimido) return null;
  
          return (
            <button
              onClick={() => setConfirmingCupon(row)}
              className="text-blue-500 ml-2 hover:bg-gray-200 p-2 rounded-sm cursor-pointer"
            >
              {loading ? "Redimiendo..." : "Redimir"}
            </button>
          )
        },
        grow: 1.2
      },
      {
        name: '',
        cell: (row: Cupon) => {
          const cliente = clientes?.find((c: Cliente) => c.id === row.cliente_id);
          const clienteNombre = cliente ? cliente.nombre : 'Cliente';
          const fecha = new Date(row.fecha_vencimiento);
          
          const fechaVencimiento = String(formatDate(fecha));
      
          return (
            <button
              className="text-green-500 ml-2 hover:bg-gray-200 p-2 rounded-sm cursor-pointer"
              onClick={() => setCuponToRender({
                codigo: row.codigo,
                clienteNombre,
                fechaVencimiento,
                puntos: row.puntos
              })}
            >
              Descargar Cupón
            </button>
          );
        },
        $grow: 2
      },
    ];

  return (
    <div className="">
      <div className="mx-20 flex flex-col items-center text-center">
    
        <h1 className="text-3xl font-bold mb-4 mt-10">Incienso Rewards</h1>
        {/* <Image
          src="/logo-incienso.png"
          width={100}
          height={100}
          alt="Picture of the author"
        /> */}
        
        {message && (
          <div className="text-center mt-4 font-medium text-gray-700">
            {message}
          </div>
        )}
        
        <DataTable
          title="Cupones por vencerse"
          columns={columns}
          data={sortedExpiringCupones}
          conditionalRowStyles={conditionalRowStyles}
          pagination
          persistTableHead
          customStyles={customStyles}
          noDataComponent={<div className="m-8">No hay registros para visualizar</div>}
        />
        
        {confirmingCupon && (
          <ConfirmationModal
            message={`¿Estás seguro de que deseas redimir el cupón de código ${confirmingCupon.codigo}?`}
            confirmText="Sí, redimir"
            cancelText="Cancelar"
            onConfirm={async () => {
              setLoading(true);
              setMessage("");
              try {
                await redimirCupon(String(confirmingCupon.id));
                setMessage("Cupón redimido exitosamente ✅");
                queryClient.invalidateQueries({ queryKey: ["cupones"] });
              } catch (error) {
                console.error("Error redimiendo cupón:", error);
                setMessage("❌ Hubo un error al redimir el cupón.");
              } finally {
                setLoading(false);
                setConfirmingCupon(null);
              }
            }}
            onCancel={() => setConfirmingCupon(null)}
          />
        )}
        {cuponToRender && (
          <HiddenCoupon
            codigo={cuponToRender.codigo}
            clienteNombre={cuponToRender.clienteNombre}
            fechaVencimiento={cuponToRender.fechaVencimiento}
            puntos={cuponToRender.puntos}
            onRenderComplete={(canvas) => {
              const link = document.createElement('a');
              link.download = `cupon-${cuponToRender.codigo}.png`;
              link.href = canvas.toDataURL();
              link.click();
              setCuponToRender(null);
            }}
          />
        )}

        
        
      </div>
    </div>
  );
}
