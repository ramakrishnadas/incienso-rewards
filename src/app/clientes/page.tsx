"use client";
import { useQuery } from "@tanstack/react-query";
import { Cliente } from "../lib/definitions";
import styled from 'styled-components';
import DataTable from "react-data-table-component";
import React from "react";
import { fetchClients } from "../lib/helper";
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
  font-size: 11px;
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
			placeholder="Filtrar por nombre o teléfono"
			aria-label="Search Input"
			value={filterText}
			onChange={onFilter}
		/>
		<ClearButton type="button" onClick={onClear}>
			X
		</ClearButton>
	</>
);

async function deleteClient(id: string) {
  await fetch(`/api/clientes/${id}`, { method: "DELETE" });
  window.location.reload();
}

export default function ClientesPage() {
  
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

  const { data: clientes, isLoading } = useQuery({ queryKey: ["clientes"], queryFn: fetchClients });

  if (isLoading) return <p>Cargando...</p>;

  const columns = [
    { name: 'ID', selector: (row: Cliente) => row.id },
    { name: 'Nombre', selector: (row: Cliente) => row.nombre, sortable: true, grow: 2},
    { name: 'Teléfono', selector: (row: Cliente) => row.telefono, },
    { name: 'Email', selector: (row: Cliente) => row.email, grow: 2 },
    { name: 'Puntos', selector: (row: Cliente) => row.puntos, sortable: true, },
    { name: 'Puede referir', selector: (row: Cliente) => row.puede_referir ? "Sí" : "No" },
    { name: 'Referido por', selector: (row: Cliente) => {
      // Find the referrer's name based on the referred by ID
      const referrer = clientes.find((c: Cliente) => c.id === row.referido_por);
      return referrer ? referrer.nombre : 'N/A';
      },
      grow: 2 
    },
    {
      name: '',
      cell: (row: Cliente) => (
        <Link href={`/movimientos/canje?cliente_id=${row.id}`} className="text-blue-500 ml-2">
          Canjear Puntos
        </Link>
      ),
      grow: 2
    },
    {
      name: '',
      cell: (row: Cliente) => (
        <Link href={`/clientes/${row.id}`} className="text-blue-500 ml-2">
          Editar
        </Link>
      ),
    },
    {
      name: '',
      cell: (row: Cliente) => (
        <button
          className="text-red-500 ml-2 cursor-pointer"
          onClick={() => deleteClient(String(row.id))}
        >
          Eliminar
        </button>
      ),
      omit: true
    },
  ];

	const filteredItems = clientes.filter(
		(c: Cliente) => c.nombre && c.nombre.toLowerCase().includes(filterText.toLowerCase()) ||
    (c.telefono && c.telefono.toLowerCase().includes(filterText.toLowerCase()))
	);

  return (
    <div>
      <h1 className="text-xl font-bold">Clientes</h1>
      <Link href="/clientes/nuevo" className="text-green-500">Registrar Cliente</Link>
      
      <DataTable
        title="Clientes"
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