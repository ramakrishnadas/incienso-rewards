import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // If no token is found (i.e., the user is not authenticated)
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url)); // Redirect to login page
  }

  // If the user is authenticated, allow them to proceed
  return NextResponse.next();
}

// Apply the middleware only to the paths you want to protect (e.g., home page, etc.)
export const config = {
  matcher: ['/', '/clientes', '/movimientos'], // Apply the middleware to the home page, or any other pages you want to protect
};
