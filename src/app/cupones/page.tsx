"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Cliente, Cupon } from "../lib/definitions";
import styled from 'styled-components';
import DataTable, { ExpanderComponentProps } from "react-data-table-component";
import React, { ChangeEvent, useEffect, useRef } from "react";
import { fetchClients, fetchCupones, formatDate, redimirCupon } from "../lib/helper";
import HiddenCoupon from "../components/HiddenCoupon";
import Html5QrcodePlugin from "../components/Html5QrcodeScannerPlugin";
import ConfirmationModal from "../components/ConfirmationModal";

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
        placeholder="Filtrar por nombre o codigo"
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

const ExpandedComponent: React.FC<ExpanderComponentProps<Cupon>> = ({ data }) => {
	const queryClient = useQueryClient();
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [cuponToRender, setCuponToRender] = React.useState<{
    codigo: string;
    clienteNombre: string;
    fechaVencimiento: string;
    puntos: number;
  } | null>(null);
  const [confirmingCupon, setConfirmingCupon] = React.useState<Cupon | null>(null);
  

  const cliente = queryClient.getQueryData<Cliente[]>(["clientes"])?.find(c => c.id === data.cliente_id);
  const clienteNombre = cliente ? cliente.nombre : "Cliente";
  const fechaVencimiento = formatDate(new Date(data.fecha_vencimiento));

  const handleRedimir = async () => {
    setLoading(true);
    setMessage("");
    try {
      await redimirCupon(String(data.id));
      setMessage("Cupón redimido exitosamente ✅");
      queryClient.invalidateQueries({ queryKey: ["cupones"] });
    } catch (error) {
      console.error(error);
      setMessage("❌ Hubo un error al redimir el cupón.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex p-5 border-1 border-gray-400 space-x-4 justify-evenly items-center">
        {message && <p className="text-sm text-gray-600">{message}</p>}
        {!data.redimido && (
          <button onClick={() => setConfirmingCupon(data)} className="text-blue-500 hover:bg-gray-200 p-2 rounded-sm w-fit cursor-pointer">
            {loading ? "Redimiendo..." : "Redimir"}
          </button>
        )}
        <button 
          onClick={() => setCuponToRender({
              codigo: data.codigo,
              clienteNombre,
              fechaVencimiento,
              puntos: data.puntos
            })} 
          className="text-green-500 hover:bg-gray-200 p-2 rounded-sm w-fit cursor-pointer"
        >
          Descargar Cupón
        </button>
      </div>
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
    </>
  );
};

async function deleteCupon(id: string) {
  await fetch(`/api/cupones/${id}`, { method: "DELETE" });
  window.location.reload();
}

export default function CuponesPage() {
  
  const [filterText, setFilterText] = React.useState('');
	const [resetPaginationToggle, setResetPaginationToggle] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [redimidoFilter, setRedimidoFilter] = React.useState<'No' | 'Sí' | 'Todos'>('No');
  const [showExpired, setShowExpired] = React.useState(false);
  const [currentRow, setCurrentRow] = React.useState<Cupon | null>(null);

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

  const conditionalRowStyles = [
    {
      when: (row: Cupon) => {
        const today = new Date();
        const expiration = new Date(row.fecha_vencimiento);
        return expiration < today;
      },
      style: {
        backgroundColor: '#fed7aa',
        
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
    subHeader: {
      style: {
      }
    },
    headRow: {
      style: {
        fontWeight: 'bold',
        fontSize: '14px'      
      },
    },
    rows: {
      style: {
        fontSize: '16px'      
      },
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
    { name: 'Nombre', selector: (row: Cupon) => {
      if (!clientes) return false;
      const cliente = clientes.find((c: Cupon) => c.id === row.cliente_id);
      return cliente ? cliente.nombre : 'N/A';
      }, sortable: true, grow: 2
    },
    { name: 'Teléfono', selector: (row: Cupon) => {
      if (!clientes) return false;
      const cliente = clientes.find((c: Cliente) => c.id === row.cliente_id);
      return cliente ? cliente.telefono : 'N/A';
      }, grow: 2
    },
    { name: 'Codigo', selector: (row: Cupon) => row.codigo },
    { name: 'Puntos', 
      selector: (row: Cupon) => row.puntos, 
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
    { name: 'Creación', selector: (row: Cupon) => {
      const fechaCreacion = new Date(row.fecha_creacion); // Convert to Date object
      const formattedDate = formatDate(fechaCreacion);
      return formattedDate;
      }, grow: 1.5
    },
    { name: 'Vencimiento', selector: (row: Cupon) => {
      const fechaVencimiento = new Date(row.fecha_vencimiento); // Convert to Date object
      const formattedDate = formatDate(fechaVencimiento);
      return formattedDate;
      }, grow: 1.5
    },
    { name: 'Redimido', selector: (row: Cupon) => row.redimido ? 'Sí' : 'No'},
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

	const filteredItems = cupones?.filter((c: Cupon) => {
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

    const isExpired = new Date(c.fecha_vencimiento) < new Date();
    const matchesExpiration = showExpired || !isExpired;
  
    return matchesTextFilter && matchesRedimidoFilter && matchesExpiration;
    
    }
	);


  return (
    <div className="mx-20">
      <h1 className="text-xl font-bold m-8">Cupones</h1>
      {message && (
        <div className="text-center mt-4 font-medium text-gray-700">
          {message}
        </div>
      )}

      <div className="flex items-center gap-2 mb-4 ml-4">
        <label htmlFor="redimido-filter" className="text-base font-medium text-gray-700">
          Mostrar cupones:
        </label>
        <select
          id="redimido-filter"
          value={redimidoFilter}
          onChange={(e) => setRedimidoFilter(e.target.value as 'No' | 'Sí' | 'Todos')}
          className="border border-gray-300 rounded-md p-1 text-base"
        >
          <option value="No">No redimidos</option>
          <option value="Sí">Redimidos</option>
          <option value="Todos">Todos</option>
        </select>
        <br />
        <div className="rounded-md bg-orange-200 p-2 ml-10">
          <label className="flex items-center text-base gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showExpired}
              onChange={(e) => setShowExpired(e.target.checked)}
              className="accent-blue-500 "
            />
            Mostrar vencidos
          </label>
        </div>
      </div>

      <DataTable
        title=""
        columns={columns}
        data={filteredItems}
        conditionalRowStyles={conditionalRowStyles}
        pagination
        paginationResetDefaultPage={resetPaginationToggle}
        subHeader
        subHeaderComponent={subHeaderComponentMemo}
        persistTableHead
        customStyles={customStyles}
        expandableRows 
        expandableRowExpanded={(row) => (row === currentRow)}
        expandableRowsComponent={ExpandedComponent}
        onRowExpandToggled={(bool, row) => setCurrentRow(row)}
        expandOnRowClicked
        highlightOnHover
      />
      
      <script src="html5-qrcode.min.js"></script>
    </div>
    
  );
}