
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Skip in development to avoid local issues if not using https
    if (process.env.NODE_ENV !== 'production') return NextResponse.next();

    // Check the protocol forwarded by the proxy (Cloud Run / Load Balancer)
    // Standard header is x-forwarded-proto
    const proto = request.headers.get('x-forwarded-proto');

    // Check for www and redirect to non-www
    const hostname = request.nextUrl.hostname;  // parsed hostname, no port
    if (hostname.startsWith('www.')) {
        const url = request.nextUrl.clone();
        url.hostname = hostname.replace(/^www\./, '');
        url.port = '';  // clear any internal port (e.g. :8080 on Cloud Run)
        return NextResponse.redirect(url, 301);
    }

    // If request is http, redirect to https
    if (proto && proto === 'http') {
        const url = new URL(request.url);
        url.protocol = 'https:';
        return NextResponse.redirect(url, 301);
    }

    return NextResponse.next();
}

export const config = {
    // Apply to all routes
    matcher: '/:path*',
};
