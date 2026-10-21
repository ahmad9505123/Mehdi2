import { queryOptions, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { listAccountAvailability, listServices } from './services.functions';
export const servicesQuery = queryOptions({ queryKey: ['services'], queryFn: () => listServices(), staleTime: 0 });
export const accountAvailabilityQuery = queryOptions({ queryKey: ['account-availability'], queryFn: () => listAccountAvailability(), staleTime: 0 });
function useLiveTable(table: 'services' | 'account_availability' | 'site_content', queryKey: string) {
  const queryClient = useQueryClient();
  useEffect(() => {
    const channel = supabase.channel(`live-${table}`).on('postgres_changes', { event: '*', schema: 'public', table }, () => { void queryClient.invalidateQueries({ queryKey: [queryKey] }); }).subscribe((status) => {
      if (status === 'SUBSCRIBED') void queryClient.invalidateQueries({ queryKey: [queryKey] });
    });
    return () => { void supabase.removeChannel(channel); };
  }, [queryClient, table, queryKey]);
}
export const useLiveServices = () => useLiveTable('services', 'services');
export const useLiveAccountAvailability = () => useLiveTable('account_availability', 'account-availability');
import { getCatalog } from './services.functions';
export const catalogQuery = queryOptions({ queryKey: ['catalog'], queryFn: () => getCatalog(), staleTime: 0 });
export const useLiveCatalog = () => useLiveTable('site_content', 'catalog');
