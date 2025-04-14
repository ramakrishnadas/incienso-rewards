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
        { name: 'Inicio', href: '/', current: true, icon: 'fa-house' },
        { name: 'Clientes', href: '/clientes', current: false, icon: 'fa-user' },
        { name: 'Movimientos', href: '/movimientos', current: false, icon: 'fa-arrows-turn-to-dots' },
        { name: 'Cupones', href: '/cupones', current: false, icon: 'fa-ticket' },        
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
                                        <i className={`fa-solid ${item.icon} text-white`}></i>&nbsp;&nbsp;{item.name}
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
                <button
                    onClick={() => {
                        const elem = document.documentElement;
                        if (!document.fullscreenElement) {
                            elem.requestFullscreen().catch((err) =>
                                console.error(`Error trying to enter fullscreen: ${err.message}`)
                            );
                        } else {
                            document.exitFullscreen();
                        }
                    }}
                    className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer absolute right-3 top-3"
                    >
                    <i className="fa-solid fa-expand text-white fa-2xl"></i>
                </button>
            </div>
        </Disclosure>
    )
}