"use client"

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return <button className="absolute right-20 rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white no-underline cursor-pointer" onClick={() => signOut()}>Logout</button>;
}