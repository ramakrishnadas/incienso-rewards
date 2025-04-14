"use client";
import { useQuery } from "@tanstack/react-query";
import { Movimiento, Cliente } from "../lib/definitions";
import styled from 'styled-components';
import DataTable from "react-data-table-component";
import React from "react";
import { fetchClients, fetchMovimientos, formatDate } from "../lib/helper";
import Link from "next/link";

const TextField = styled.input`
	height: 32px;
	width: 300px;
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
      placeholder="Filtrar por cliente, telefono o ticket"
      aria-label="Search Input"
      value={filterText}
      onChange={onFilter}
    />
    <ClearButton type="button" onClick={onClear} className="hover:bg-gray-200 p-2 rounded-sm">
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
    const [tipoFilter, setTipoFilter] = React.useState('');
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
        const cliente = clientes.find((c: Cliente) => c.id === row.cliente_id);
        return cliente ? cliente.nombre : 'N/A';
        }, sortable: true, grow: 2
      },
      { name: 'Teléfono del Cliente', selector: (row: Movimiento) => {
        if (!clientes) return false;
        const cliente = clientes.find((c: Cliente) => c.id === row.cliente_id);
        return cliente ? cliente.telefono : 'N/A';
        }, grow: 2
      },
      { name: 'Tipo', selector: (row: Movimiento) => row.tipo, sortable: true, grow: 2.5 },
      { name: 'Monto', selector: (row: Movimiento) => {
        
        const formattedMonto = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
          }).format(parseFloat(row.monto));
          return row.monto ? formattedMonto : "";
        } 
      },
      { name: 'Ticket', selector: (row: Movimiento) => row.ticket, grow: 2 },
      { name: 'Puntos', selector: (row: Movimiento) => row.puntos, sortable: true },
      { name: 'Tasa de Puntos', selector: (row: Movimiento) => row.tasa_puntos, grow: 2 },
      { name: 'Fecha', selector: (row: Movimiento) => {
        const fecha = new Date(row.fecha);
        const formattedDate = formatDate(fecha);
        return formattedDate;
        }
      },
      {
        name: '',
        cell: (row: Movimiento) => (
          <Link href={`/movimientos/${row.id}`} className="text-blue-500 ml-2 hover:bg-gray-200 p-2 rounded-sm">
            Editar
          </Link>
        ),
      },
      {
        name: '',
        cell: (row: Movimiento) => (
          <button
            className="text-red-500 ml-2 cursor-pointer hover:bg-gray-200 p-2 rounded-sm"
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
  
    const cliente = clientes.find((c: Cliente) => c.id === m.cliente_id);
    const clientName = cliente ? cliente.nombre.toLowerCase() : '';
    const clientPhone = cliente ? cliente.telefono.toLowerCase() : '';
  
    const lowerFilter = filterText.toLowerCase();
    const matchesTextFilter =
      clientName.includes(lowerFilter) ||
      clientPhone.includes(lowerFilter) ||
      (m.ticket && m.ticket.toLowerCase().includes(lowerFilter));
  
    const matchesTipoFilter = tipoFilter === '' || m.tipo === tipoFilter;
  
    return matchesTextFilter && matchesTipoFilter;
  });

  return (
    <div>
      <h1 className="text-xl font-bold m-8">Movimientos</h1>
      {/* <Link href="/movimientos/nuevo" className="text-white mx-8 my-2 bg-slate-700 hover:bg-gray-200 hover:text-slate-700 p-[15px] rounded-sm">Registrar Movimiento</Link> */}
      <div className="flex items-center gap-4 mx-8 mb-4">
        <label htmlFor="tipoFilter">Filtrar por tipo:</label>
        <select
          id="tipoFilter"
          value={tipoFilter}
          onChange={(e) => setTipoFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Todos</option>
          <option value="Compra">Compra</option>
          <option value="Canje">Canje</option>
          <option value="Bono por primera compra">Bono por primera compra</option>
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
        className=""
      />

    </div>
  );
}

