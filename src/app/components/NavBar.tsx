"use client"
import Link from "next/link";
import { Disclosure } from '@headlessui/react'
import LogoutButton from "./LogoutButton";

// Add the session prop with boolean type
interface NavBarProps {
    session: boolean;
}
  
export default function NavBar({ session }: NavBarProps) {
    
    const navigation = [
        { name: 'Inicio', href: '/', current: true },
        { name: 'Clientes', href: '/clientes', current: false },
        { name: 'Movimientos', href: '/movimientos', current: false },
    ]

    return (
        <Disclosure as="nav" className="bg-gray-800">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center">
                        <div className="shrink-0">
                            <img
                            alt="Your Company"
                            src="/logo-incienso.png"
                            className="size-12"
                            />
                        </div>
                        <div className="hidden md:block">
                            {session ? (
                                <div className="ml-10 flex items-baseline space-x-4">
                                    {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white no-underline"
                                    >
                                        {item.name}
                                    </Link>
                                    ))}
                                    <LogoutButton />
                                </div>
                            ) : (
                                <div></div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Disclosure>
    )
}