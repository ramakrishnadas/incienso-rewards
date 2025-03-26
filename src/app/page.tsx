import Link from "next/link";
import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Incienso Rewards",
  description: "Programa de recompensas de Incienso Store",
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center text-center bg-amber-50">
  
      <h1 className="text-3xl font-bold mb-4 mt-10">Incienso Rewards</h1>
      <Image
        src="/logo-incienso.png"
        width={400}
        height={400}
        alt="Picture of the author"
      />
      <p className="text-gray-600 mb-6">Gestiona clientes y movimientos con facilidad.</p>
      <div className="flex space-x-4">
        <Link href="/clientes" className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600">
          Gestionar clientes
        </Link>
        <Link href="/movimientos" className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-600 no-underline">
          Ver movimientos
        </Link>
      </div>
    </div>
  );
}
