import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center">
      <h1 className="text-3xl font-bold mb-4">Gestionar Incienso Rewards</h1>
      <p className="text-gray-600 mb-6">Gestiona clientes y movimientos con facilidad.</p>
      <div className="flex space-x-4">
        <Link href="/clientes" className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600">
          Gestionar clientes
        </Link>
        <Link href="/movimientos" className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-600">
          Ver movimientos
        </Link>
      </div>
    </div>
    
  );
}
