
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the app is in maintenance mode
  if (process.env.MAINTENANCE_MODE === 'true') {
    // Allow access to the maintenance page itself and essential assets
    if (
      request.nextUrl.pathname.startsWith('/maintenance') ||
      request.nextUrl.pathname.startsWith('/_next/') ||
      request.nextUrl.pathname.startsWith('/api/') ||
      request.nextUrl.pathname.includes('.') // Allows files like favicon.ico
    ) {
      return NextResponse.next();
    }

    // Rewrite all other requests to the maintenance page
    return NextResponse.rewrite(new URL('/maintenance', request.url));
  }

  // If not in maintenance mode, proceed as normal
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
