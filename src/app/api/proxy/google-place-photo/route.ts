import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const photoReference = searchParams.get('photo_reference');
    const maxWidth = searchParams.get('maxwidth') || '800'; // Default maxwidth

    if (!photoReference) {
        return new NextResponse('Missing photo_reference', { status: 400 });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        console.error('Proxy Error: Missing API Key');
        return new NextResponse('Server configuration error: Missing API Key', { status: 500 });
    }

    const baseUrl = 'https://maps.googleapis.com/maps/api/place/photo';
    const url = `${baseUrl}?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${apiKey}`;

    try {
        // Forward the Referer header from the incoming request to satisfy API key restrictions
        const upstreamHeaders = new Headers();
        const incomingReferer = request.headers.get('referer');
        if (incomingReferer) {
            upstreamHeaders.set('Referer', incomingReferer);
        } else {
            // Fallback for when no referer is present (e.g. direct API call), 
            // try to use the app URL or localhost if in dev
            upstreamHeaders.set('Referer', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
        }

        const upstreamResponse = await fetch(url, {
            headers: upstreamHeaders
        });

        if (!upstreamResponse.ok) {
            const errorText = await upstreamResponse.text();
            console.error(`Proxy Upstream Error: ${upstreamResponse.status} ${upstreamResponse.statusText}`, errorText);
            return new NextResponse(`Upstream error: ${upstreamResponse.status} ${upstreamResponse.statusText} - ${errorText}`, {
                status: upstreamResponse.status,
            });
        }

        // Get the image buffer
        const imageBuffer = await upstreamResponse.arrayBuffer();

        // Forward relevant headers
        const headers = new Headers();
        const contentType = upstreamResponse.headers.get('content-type');
        if (contentType) headers.set('Content-Type', contentType);

        // Set caching headers
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');

        return new NextResponse(imageBuffer, {
            status: 200,
            headers,
        });
    } catch (error) {
        console.error('Error proxying Google Place photo:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
