import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface AttractionSectionsResponse {
  attraction_id: number;
  slug: string;
  name: string;
  city: string;
  country?: string;
  sections: Array<{
    section_type: string;
    title: string;
    subtitle?: string;
    layout: string;
    is_visible: boolean;
    order: number;
    content: any;
  }>;
}

export function useAttractionSections(slug: string) {
  return useQuery<AttractionSectionsResponse>({
    queryKey: ['attraction-sections', slug],
    queryFn: async () => {
      const res = await apiClient.get<AttractionSectionsResponse>(`/attractions/${slug}/sections`);
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

