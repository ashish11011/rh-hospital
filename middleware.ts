import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.pathname;
  
  // Protect /admin routes (except /admin/login)
  if (url.startsWith('/admin') && !url.startsWith('/admin/login')) {
    const token = request.cookies.get('admin_token');
    
    if (!token || token.value !== 'authenticated') {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect /api/admin routes
  if (url.startsWith('/api/admin')) {
    const token = request.cookies.get('admin_token');
    
    if (!token || token.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
