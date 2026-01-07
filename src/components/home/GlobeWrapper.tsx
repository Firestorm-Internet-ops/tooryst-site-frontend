
'use client';

import dynamic from 'next/dynamic';
import { config } from '@/lib/config';
import type { ComponentProps } from 'react';
import type { Globe3D as Globe3DType } from '@/components/sections/Globe3D';

const Globe3D = dynamic(
    () => import('@/components/sections/Globe3D').then((mod) => ({ default: mod.Globe3D })),
    {
        ssr: false,
        loading: () => (
            <div className="relative w-full h-[340px] sm:h-[420px] md:h-[520px] lg:h-[600px] rounded-3xl overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center border border-blue-100">
                <div className="text-blue-600">{config.text.loading.globe}</div>
            </div>
        ),
    }
);

export function GlobeWrapper(props: ComponentProps<typeof Globe3DType>) {
    return <Globe3D {...props} />;
}
