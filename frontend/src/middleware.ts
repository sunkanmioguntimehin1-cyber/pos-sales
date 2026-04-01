import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const BASE_DOMAIN = 'localhost';
const EXCLUDED_SUBDOMAINS = ['www', 'api', 'admin', 'superadmin'];
const PROTECTED_PATHS = ['/superadmin', '/api'];

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;
  
  if (PROTECTED_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  let subdomain = '';
  
  if (hostname.includes('.')) {
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      subdomain = parts[0];
    }
  } else if (hostname.includes(':')) {
    const hostParts = hostname.split(':')[0];
    if (hostParts.includes('.') && hostParts !== BASE_DOMAIN) {
      subdomain = hostParts.split('.')[0];
    }
  }
  
  if (subdomain && !EXCLUDED_SUBDOMAINS.includes(subdomain)) {
    const response = NextResponse.next();
    response.cookies.set('tenant-subdomain', subdomain, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
    });
    return response;
  }
  
  const tenantFromCookie = request.cookies.get('tenant-subdomain');
  if (tenantFromCookie) {
    const response = NextResponse.next();
    response.cookies.set('tenant-subdomain', tenantFromCookie.value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
    });
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
