"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Cliente, Cupon } from "../lib/definitions";
import styled from 'styled-components';
import DataTable from "react-data-table-component";
import React, { ChangeEvent, useEffect, useRef } from "react";
import { fetchClients, fetchCupones, redimirCupon } from "../lib/helper";
import HiddenCoupon from "../components/HiddenCoupon";
import Html5QrcodePlugin from "../components/Html5QrcodeScannerPlugin";

const TextField = styled.input`
	height: 32px;
	width: 200px;
	border-radius: 3px;
	border-top-left-radius: 5px;
	border-bottom-left-radius: 5px;
	border-top-right-radius: 0;
	border-bottom-right-radius: 0;
	border: 1px solid #e5e5e5;
	padding: 0 32px 0 16px;
  font-size: 11px;
  color: black;
	&:hover {
		
	}
`;

const ClearButton = styled.button`
	border-top-left-radius: 0;
	border-bottom-left-radius: 0;
	border-top-right-radius: 5px;
	border-bottom-right-radius: 5px;
	height: 34px;
	width: 32px;
	text-align: center;
	display: flex;
	align-items: center;
	justify-content: center;
  cursor: pointer;
  color: black;
`;

interface FilterComponentProps {
  filterText: string;
  onFilter: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}

const FilterComponent: React.FC<FilterComponentProps> = ({ filterText, onFilter, onClear }) => {
  // const onNewScanResult = (decodedText: string, decodedResult: any) => {
  //   // handle decoded results here
  //   const syntheticEvent = { target: { value: decodedText } } as ChangeEvent<HTMLInputElement>;
  //   onFilter(syntheticEvent);
  // };
  const inputRef = useRef<HTMLInputElement>(null);
  const html5QrcodeScannerRef = useRef<any>(null);

  // The callback when a QR code or barcode is successfully scanned
  const onScanSuccess = (decodedText: string, decodedResult: any) => {
    if (inputRef.current) {
      inputRef.current.value = decodedText;
    }
  
    html5QrcodeScannerRef.current?.stopScanning(); // This now actually works
    const syntheticEvent = { target: { value: decodedText } } as ChangeEvent<HTMLInputElement>;
    onFilter(syntheticEvent);
  };

  return (
    <>
      <TextField
        id="search"
        type="text"
        placeholder="Filtrar por nombre o codigo"
        aria-label="Search Input"
        value={filterText}
        onChange={onFilter}
      />
      <Html5QrcodePlugin
        ref={html5QrcodeScannerRef}
        fps={10}
        qrbox={250}
        disableFlip={false}
        qrCodeSuccessCallback={onScanSuccess}
      />
      <ClearButton type="button" onClick={onClear} className="hover:bg-gray-200 p-2 rounded-sm">
        X
      </ClearButton>
    </>
  );
}

async function deleteCupon(id: string) {
  await fetch(`/api/cupones/${id}`, { method: "DELETE" });
  window.location.reload();
}

export default function CuponesPage() {
  
  const [filterText, setFilterText] = React.useState('');
	const [resetPaginationToggle, setResetPaginationToggle] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [cuponToRender, setCuponToRender] = React.useState<{
    codigo: string;
    clienteNombre: string;
    fechaVencimiento: string;
    puntos: number;
  } | null>(null);
  const [redimidoFilter, setRedimidoFilter] = React.useState<'No' | 'Sí' | 'Todos'>('No');


  const queryClient = useQueryClient();

  const subHeaderComponentMemo = React.useMemo(() => {
		const handleClear = () => {
			if (filterText) {
				setResetPaginationToggle(!resetPaginationToggle);
				setFilterText('');
			}
		};

		return (
			<FilterComponent onFilter={e => setFilterText(e.target.value)} onClear={handleClear} filterText={filterText} />
		);
	}, [filterText, resetPaginationToggle]);

  const { data: cupones, isLoading } = useQuery({ queryKey: ["cupones"], queryFn: fetchCupones });

  const { data: clientes } = useQuery({ queryKey: ["clientes"], queryFn: fetchClients });

  if (isLoading) return <p>Cargando...</p>;

  const columns = [
    { name: 'ID', selector: (row: Cupon) => row.id },
    { name: 'Nombre del Cliente', selector: (row: Cupon) => {
            if (!clientes) return false;
            const cliente = clientes.find((c: Cupon) => c.id === row.cliente_id);
            return cliente ? cliente.nombre : 'N/A';
            }, sortable: true, grow: 2
          },
    { name: 'Codigo', selector: (row: Cupon) => row.codigo },
    { name: 'Puntos', selector: (row: Cupon) => row.puntos, sortable: true, },
    { name: 'Fecha de Creación', selector: (row: Cupon) => {
      const date = new Date(row.fecha_creacion); // Convert to Date object
      const onlyDate = date.toISOString().split('T')[0];
      return onlyDate;
      }, grow: 2
    },
    { name: 'Fecha de Vencimiento', selector: (row: Cupon) => {
      const date = new Date(row.fecha_vencimiento); // Convert to Date object
      const onlyDate = date.toISOString().split('T')[0];
      return onlyDate;
      }, grow: 2
    },
    { name: 'Redimido', selector: (row: Cupon) => row.redimido ? 'Sí' : 'No'},
    {
      name: '',
      cell: (row: Cupon) => {
        if (row.redimido) return null;

        return (
          <button
            onClick={async () => {
              setLoading(true);
              setMessage(""); // Clear any previous message
              try {
                const result = await redimirCupon(String(row.id));
                console.log("Cupón redimido:", result);
                setMessage("Cupón redimido exitosamente ✅");
  
                queryClient.invalidateQueries({ queryKey: ["cupones"] });
              
              } catch (error) {
                console.error("Error redimiendo cupón:", error);
                setMessage("❌ Hubo un error al redimir el cupón.");
              } finally {
                setLoading(false);
              }
            }}
            className="text-blue-500 ml-2 hover:bg-gray-200 p-2 rounded-sm cursor-pointer"
          >
            {loading ? "Redimiendo..." : "Redimir"}
          </button>
        )
      },
    },
    {
      name: '',
      cell: (row: Cupon) => {
        const cliente = clientes?.find((c: Cliente) => c.id === row.cliente_id);
        const clienteNombre = cliente ? cliente.nombre : 'Cliente';
        const fechaVencimiento = new Date(row.fecha_vencimiento).toISOString().split('T')[0];
    
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
      grow: 2
    },
    {
      name: '',
      cell: (row: Cupon) => (
        <button
          className="text-red-500 ml-2 cursor-pointer hover:bg-gray-200 p-2 rounded-sm"
          onClick={() => deleteCupon(String(row.id))}
        >
          Eliminar
        </button>
      ),
      omit: true
    },
  ];

	const filteredItems = cupones.filter((c: Cupon) => {
    if (!clientes) return false;
  
    const cliente = clientes.find((cl: Cliente) => cl.id === c.cliente_id);
    const clientName = cliente ? cliente.nombre.toLowerCase() : '';
  
    const lowerFilter = filterText.toLowerCase();
    const matchesTextFilter =
      clientName.includes(lowerFilter) ||
      (c.codigo && c.codigo.toLowerCase().includes(lowerFilter));
  
    const matchesRedimidoFilter =
      redimidoFilter === 'Todos' ||
      (redimidoFilter === 'Sí' && c.redimido) ||
      (redimidoFilter === 'No' && !c.redimido);
  
    return matchesTextFilter && matchesRedimidoFilter;
    
    }
	);


  return (
    <div>
      <h1 className="text-xl font-bold m-8">Cupones</h1>
      {message && (
        <div className="text-center mt-4 font-medium text-gray-700">
          {message}
        </div>
      )}

      <div className="flex items-center gap-2 mb-4 ml-4">
        <label htmlFor="redimido-filter" className="text-sm font-medium text-gray-700">
          Mostrar cupones:
        </label>
        <select
          id="redimido-filter"
          value={redimidoFilter}
          onChange={(e) => setRedimidoFilter(e.target.value as 'No' | 'Sí' | 'Todos')}
          className="border border-gray-300 rounded-md p-1 text-sm"
        >
          <option value="No">No redimidos</option>
          <option value="Sí">Redimidos</option>
          <option value="Todos">Todos</option>
        </select>
      </div>
      <DataTable
        title=""
        columns={columns}
        data={filteredItems}
        pagination
        paginationResetDefaultPage={resetPaginationToggle}
        subHeader
        subHeaderComponent={subHeaderComponentMemo}
        persistTableHead
      />
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
  );
}