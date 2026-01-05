import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as connectionsApi from '../services/connections';
import type { ManagementUrlsUpdate } from '../services/connections';

export function useLocationConnections(locationId: number | null) {
  return useQuery({
    queryKey: ['connections', locationId],
    queryFn: () => connectionsApi.getLocationConnections(locationId!),
    enabled: !!locationId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useUpdateManagementUrls() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ locationId, urls }: { locationId: number; urls: ManagementUrlsUpdate }) =>
      connectionsApi.updateManagementUrls(locationId, urls),
    onSuccess: (_, { locationId }) => {
      queryClient.invalidateQueries({ queryKey: ['connections', locationId] });
    },
  });
}

export function useToggleAutoFetch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ locationId, enabled }: { locationId: number; enabled: boolean }) =>
      connectionsApi.toggleAutoFetch(locationId, enabled),
    onSuccess: (_, { locationId }) => {
      queryClient.invalidateQueries({ queryKey: ['connections', locationId] });
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
}

export function useDisconnectPlatform() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ locationId, platform }: { locationId: number; platform: 'google' | 'facebook' }) =>
      connectionsApi.disconnectPlatform(locationId, platform),
    onSuccess: (_, { locationId }) => {
      queryClient.invalidateQueries({ queryKey: ['connections', locationId] });
    },
  });
}
