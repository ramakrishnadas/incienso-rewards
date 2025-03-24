"use client";
import { useQuery } from "@tanstack/react-query";
import { Movimiento, Cliente } from "../lib/definitions";
import styled from 'styled-components';
import DataTable from "react-data-table-component";
import React from "react";
import { fetchClients, fetchMovimientos } from "../lib/helper";
import Link from "next/link";

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
  font-size: 12px;
  color: black;
	&:hover {
		cursor: pointer;
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

const FilterComponent: React.FC<FilterComponentProps> = ({ filterText, onFilter, onClear }) => (
  <>
    <TextField
      id="search"
      type="text"
      placeholder="Filtrar por cliente o ticket"
      aria-label="Search Input"
      value={filterText}
      onChange={onFilter}
    />
    <ClearButton type="button" onClick={onClear}>
      X
    </ClearButton>
  </>
);

async function deleteMovimiento(id: string) {
  await fetch(`/api/movimientos/${id}`, { method: "DELETE" });
  window.location.reload();
}

export default function MovimientosPage() {

  const [filterText, setFilterText] = React.useState('');
    const [resetPaginationToggle, setResetPaginationToggle] = React.useState(false);
  
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
  
  const { data: clientes } = useQuery({ queryKey: ["clientes"], queryFn: fetchClients });
  
  const { data: movimientos, isLoading } = useQuery({ queryKey: ["movimientos"], queryFn: fetchMovimientos });

  if (isLoading) return <p>Cargando...</p>;

  const columns = [
      { name: 'ID', selector: (row: Movimiento) => row.id },
      { name: 'Cliente ID', selector: (row: Movimiento) => row.cliente_id },
      { name: 'Nombre del Cliente', selector: (row: Movimiento) => {
        if (!clientes) return false;
        const referrer = clientes.find((c: Cliente) => c.id === row.cliente_id);
        return referrer ? referrer.nombre : 'N/A';
        }, sortable: true, grow: 2
      },
      { name: 'Tipo', selector: (row: Movimiento) => row.tipo, sortable: true, grow: 2 },
      { name: 'Monto', selector: (row: Movimiento) => row.monto },
      { name: 'Ticket', selector: (row: Movimiento) => row.ticket, grow: 2 },
      { name: 'Puntos', selector: (row: Movimiento) => row.puntos, sortable: true },
      { name: 'Tasa de Puntos', selector: (row: Movimiento) => row.tasa_puntos, grow: 2 },
      { name: 'Fecha', selector: (row: Movimiento) => {
        const date = new Date(row.fecha); // Convert to Date object
        const onlyDate = date.toISOString().split('T')[0];
        return onlyDate;
        }
      },
      {
        name: '',
        cell: (row: Movimiento) => (
          <Link href={`/movimientos/${row.id}`} className="text-blue-500 ml-2">
            Editar
          </Link>
        ),
      },
      {
        name: '',
        cell: (row: Movimiento) => (
          <button
            className="text-red-500 ml-2 cursor-pointer"
            onClick={() => deleteMovimiento(String(row.id))}
          >
            Eliminar
          </button>
        ),
        omit: true
      },
  ];

  const filteredItems = movimientos.filter((m: Movimiento) => {
    if (!clientes) return false;
    const cliente = clientes.find((c: Cliente) => c.id === m.cliente_id);  // Find the client by ID
    const clientName = cliente ? cliente.nombre.toLowerCase() : ''; // Get the client's name or empty string if not found
    
    // Filter by client name or type
    return (
      (m.tipo && m.tipo.toLowerCase().includes(filterText.toLowerCase())) || // Filter by 'tipo'
      clientName.includes(filterText.toLowerCase()) // Filter by 'nombre' (client name)
    );
    
  });

  return (
    <div>
      <h1 className="text-xl font-bold">Movimientos</h1>
      <Link href="/movimientos/nuevo" className="text-green-500">Registrar Movimiento</Link>
      
      <DataTable
        title="Movimientos"
        columns={columns}
        data={filteredItems}
        pagination
        paginationResetDefaultPage={resetPaginationToggle}
        subHeader
        subHeaderComponent={subHeaderComponentMemo}
        persistTableHead
      />

    </div>
  );
}

