
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Skip in development to avoid local issues if not using https
    if (process.env.NODE_ENV !== 'production') return NextResponse.next();

    // Check the protocol forwarded by the proxy (Cloud Run / Load Balancer)
    // Standard header is x-forwarded-proto
    const proto = request.headers.get('x-forwarded-proto');

    // Check for www and redirect to non-www
    const host = request.headers.get('host');
    if (host && host.startsWith('www.')) {
        const newHost = host.replace(/^www\./, '');
        const url = new URL(request.url);
        url.host = newHost;
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
