"use client";
import { useQuery } from "@tanstack/react-query";
import { Movimiento, Cliente } from "../lib/definitions";
import styled from 'styled-components';
import DataTable, { ExpanderComponentProps } from "react-data-table-component";
import React, { ChangeEvent, useRef } from "react";
import { fetchClients, fetchMovimientos, formatDate } from "../lib/helper";
import Link from "next/link";
import Html5QrcodePlugin from "../components/Html5QrcodeScannerPlugin";

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
  const inputRef = useRef<HTMLInputElement>(null);
  const html5QrcodeScannerRef = useRef<any>(null);
  const [showScanner, setShowScanner] = React.useState(false);

  const onScanSuccess = (decodedText: string, decodedResult: any) => {
    if (inputRef.current) {
      inputRef.current.value = decodedText;
    }

    html5QrcodeScannerRef.current?.stopScanning?.();
    const syntheticEvent = { target: { value: decodedText } } as ChangeEvent<HTMLInputElement>;
    onFilter(syntheticEvent);
    setShowScanner(false);
  };

  return (
    <div className="flex items-center gap-2 relative">
      <TextField
        id="search"
        type="text"
        placeholder="Filtrar por cliente, telefono o ticket"
        aria-label="Search Input"
        value={filterText}
        onChange={onFilter}
        ref={inputRef}
        onFocus={() => setShowScanner(true)}
      />
      <ClearButton type="button" onClick={() => { onClear(); setShowScanner(false); }}>
        X
      </ClearButton>

      {showScanner && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white shadow-lg p-2 rounded">
          <Html5QrcodePlugin
            ref={html5QrcodeScannerRef}
            fps={10}
            qrbox={250}
            disableFlip={false}
            qrCodeSuccessCallback={onScanSuccess}
          />
          <button
            onClick={() => setShowScanner(false)}
            className="mt-2 px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-xs cursor-pointer"
          >
            Cerrar escáner
          </button>
        </div>
      )}
    </div>
  );
};

const ExpandedComponent: React.FC<ExpanderComponentProps<Movimiento>> = ({ data }) => {
  return (
    <>
      <div className="flex p-5 border-1 border-gray-400 space-x-4 justify-evenly items-center">
        <p>Cliente ID: {data.cliente_id}</p>
        <p>Tasa de puntos: {data.tasa_puntos}</p>
        <Link href={`/movimientos/${data.id}`} className="text-blue-500 ml-2 hover:bg-gray-200 p-2 rounded-sm">
          Editar
        </Link>
      </div>
    </>
  );
};

async function deleteMovimiento(id: string) {
  await fetch(`/api/movimientos/${id}`, { method: "DELETE" });
  window.location.reload();
}

export default function MovimientosPage() {

    const [filterText, setFilterText] = React.useState('');
    const [tipoFilter, setTipoFilter] = React.useState('');
    const [resetPaginationToggle, setResetPaginationToggle] = React.useState(false);
    const [currentRow, setCurrentRow] = React.useState<Movimiento | null>(null);
  
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
      // { name: 'Cliente ID', selector: (row: Movimiento) => row.cliente_id },
      { name: 'Nombre', selector: (row: Movimiento) => {
        if (!clientes) return false;
        const cliente = clientes.find((c: Cliente) => c.id === row.cliente_id);
        return cliente ? cliente.nombre : 'N/A';
        }, sortable: true, grow: 2
      },
      { name: 'Teléfono', selector: (row: Movimiento) => {
        if (!clientes) return false;
        const cliente = clientes.find((c: Cliente) => c.id === row.cliente_id);
        return cliente ? cliente.telefono : 'N/A';
        }, grow: 2
      },
      { name: 'Tipo', selector: (row: Movimiento) => row.tipo, grow: 3 },
      { name: 'Monto', selector: (row: Movimiento) => {
        
        const formattedMonto = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
          }).format(parseFloat(row.monto));
          return row.monto ? formattedMonto : "";
        },
        sortable: true 
      },
      { name: 'Ticket', selector: (row: Movimiento) => row.ticket, grow: 2 },
      { name: 'Puntos', 
        selector: (row: Movimiento) => row.puntos, 
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
      { name: 'Fecha', selector: (row: Movimiento) => {
        const fecha = new Date(row.fecha);
        const formattedDate = formatDate(fecha);
        return formattedDate;
        },
        grow: 2
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

  const filteredItems = movimientos?.filter((m: Movimiento) => {
    if (!clientes) return false;
  
    const cliente = clientes?.find((c: Cliente) => c.id === m.cliente_id);
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
    <div className="mx-5">
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
        customStyles={customStyles}
        striped
        expandableRows 
        expandableRowExpanded={(row) => (row === currentRow)}
        expandableRowsComponent={ExpandedComponent}
        onRowExpandToggled={(bool, row) => setCurrentRow(row)}
        expandOnRowClicked
        highlightOnHover
        noDataComponent={<div className="m-8">No hay registros para visualizar</div>}
      />

    </div>
  );
}

