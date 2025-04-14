"use client"

import { useQuery } from "@tanstack/react-query";
import { Cliente } from "../lib/definitions";
import styled from 'styled-components';
import DataTable from "react-data-table-component";
import React from "react";
import { fetchClients, sendRewardMessages } from "../lib/helper";
import Link from "next/link";
import { fontWeight } from "html2canvas/dist/types/css/property-descriptors/font-weight";

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
  font-size: 14px;
  color: black;
	&:hover {
		
	}
`;

const ClearButton = styled.button`
  border: 1px solid lightgray;
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
		<ClearButton type="button" onClick={onClear} className="hover:bg-gray-200 p-2 rounded-sm">
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
  const [message, setMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);

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
    subHeader: {
      style: {
      }
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
    // { name: 'ID', selector: (row: Cliente) => row.id },
    { name: 'Nombre', selector: (row: Cliente) => row.nombre, sortable: true, grow: 2},
    { name: 'Teléfono', selector: (row: Cliente) => row.telefono, grow: 1.2},
    { name: 'Email', selector: (row: Cliente) => row.email, grow: 2 },
    { name: 'Puntos', 
      selector: (row: Cliente) => row.puntos, 
      sortable: true, 
      width: '120px', 
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
    { name: 'Referir', selector: (row: Cliente) => row.puede_referir ? "Sí" : "No" },
    { name: 'Referido por', selector: (row: Cliente) => {
      // Find the referrer's name based on the referred by ID
      const referrer = clientes.find((c: Cliente) => c.id === row.referido_por);
      return referrer ? referrer.nombre : 'N/A';
      },
      
    },
    {
      name: '',
      cell: (row: Cliente) => (
        <Link href={`/movimientos/nuevo?cliente_id=${row.id}`} className="text-blue-500 ml-2 hover:bg-gray-200 p-2 rounded-sm">
          Registrar Compra
        </Link>
      ),
      grow: 1.6
    },
    {
      name: '',
      cell: (row: Cliente) => (
        <Link href={`/movimientos/canje?cliente_id=${row.id}`} className="text-blue-500 ml-2 hover:bg-gray-200 p-2 rounded-sm">
          Canjear Puntos
        </Link>
      ),
      grow: 1.5
    },
    {
      name: '',
      cell: (row: Cliente) => (
        <Link href={`/clientes/${row.id}`} className="text-blue-500 ml-2 hover:bg-gray-200 p-2 rounded-sm">
          Editar
        </Link>
      ),
      grow: 0.5
    },
    {
      name: '',
      cell: (row: Cliente) => (
        <button
          className="text-red-500 ml-2 cursor-pointer hover:bg-gray-200 p-2 rounded-sm"
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

  const handleSendMessages = async () => {
    setLoading(true);
    setMessage("");
  
    try {
      const response = await sendRewardMessages();
  
      if (response.success) {
        setMessage("✅ Mensajes enviados correctamente.");
      } else {
        setMessage(`❌ Error: ${response.error || "No se enviaron los mensajes."}`);
      }
    } catch (error) {
      setMessage("❌ Error inesperado al enviar los mensajes.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-5">
      <h1 className="text-xl font-bold m-8">Clientes</h1>
      <Link href="/clientes/nuevo" className="text-white mx-8 my-10 bg-slate-700 hover:bg-gray-200 hover:text-slate-700 p-[15px] rounded-sm">Registrar Cliente</Link>
      
      {/* <div className="mx-8 my-4 absolute top-20 right-0">
        <button
          onClick={handleSendMessages}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 cursor-pointer"
          disabled={loading}
        >
          {loading ? "Enviando..." : "Enviar Mensajes de Recompensa"}
        </button>
        {message && (
          <p className="mt-2 text-sm text-gray-700">{message}</p>
        )}
      </div> */}

      <DataTable
        title=""
        columns={columns}
        data={filteredItems}
        pagination
        paginationResetDefaultPage={resetPaginationToggle}
        subHeader
        subHeaderComponent={subHeaderComponentMemo}
        persistTableHead
        customStyles={customStyles}
        striped
      />
      
    </div>
  );
}