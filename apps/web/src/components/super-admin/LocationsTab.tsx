import { useState, useEffect } from 'react';
import { Search, X, MapPin, MessageSquare } from 'lucide-react';
import { PlanBadge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import {
  superAdminApi,
  type SuperAdminLocation,
  type LocationsListParams,
} from '@/services/superAdmin';

// Platform icon component
function PlatformIcon({ platform, connected }: { platform: string; connected: boolean }) {
  const icons: Record<string, { letter: string; color: string }> = {
    google: { letter: 'G', color: 'text-red-500' },
    tripadvisor: { letter: 'TA', color: 'text-green-500' },
    booking: { letter: 'B', color: 'text-blue-600' },
    yelp: { letter: 'Y', color: 'text-red-600' },
    facebook: { letter: 'f', color: 'text-blue-500' },
  };

  const icon = icons[platform] || { letter: platform[0].toUpperCase(), color: 'text-gray-500' };

  return (
    <span
      className={`
        inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded
        ${connected
          ? `${icon.color} bg-opacity-10 bg-current`
          : 'text-gray-300 dark:text-gray-600'
        }
      `}
      title={`${platform}${connected ? ' (connected)' : ' (not connected)'}`}
    >
      {icon.letter}
    </span>
  );
}

// Skeleton row for loading state
function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-3">
        <div className="h-4 w-32 skeleton-light rounded" />
        <div className="h-3 w-48 skeleton-light rounded mt-1" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-24 skeleton-light rounded" />
        <div className="h-3 w-32 skeleton-light rounded mt-1" />
      </td>
      <td className="px-4 py-3">
        <div className="h-5 w-14 skeleton-light rounded-full" />
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-6 w-6 skeleton-light rounded" />
          ))}
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="h-4 w-8 skeleton-light rounded ml-auto" />
      </td>
      <td className="px-4 py-3 text-right">
        <div className="h-4 w-20 skeleton-light rounded ml-auto" />
      </td>
    </tr>
  );
}

export function LocationsTab() {
  const [locations, setLocations] = useState<SuperAdminLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [params, setParams] = useState<LocationsListParams>({
    page: 1,
    per_page: 15,
    sort_by: 'created_at',
    sort_order: 'desc',
  });
  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: null as number | null,
    to: null as number | null,
  });

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== params.search) {
        setParams((prev) => ({ ...prev, search: searchValue || undefined, page: 1 }));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue]);

  // Fetch locations
  useEffect(() => {
    loadLocations();
  }, [params]);

  const loadLocations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await superAdminApi.getLocations(params);
      setLocations(response.data);
      setMeta(response.meta);
    } catch (err) {
      console.error('Failed to load locations:', err);
      setError('Failed to load locations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setParams((prev) => ({ ...prev, page }));
  };

  const handleSort = (sortBy: 'name' | 'created_at' | 'reviews_count') => {
    setParams((prev) => ({
      ...prev,
      sort_by: sortBy,
      sort_order: prev.sort_by === sortBy && prev.sort_order === 'asc' ? 'desc' : 'asc',
      page: 1,
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const SortIndicator = ({ field }: { field: string }) => {
    if (params.sort_by !== field) return null;
    return (
      <span className="ml-1">
        {params.sort_order === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <p className="text-red-500">{error}</p>
        <button
          onClick={loadLocations}
          className="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search by name, address, or owner email..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full pl-9 pr-9 py-2 text-sm bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          />
          {searchValue && (
            <button
              onClick={() => setSearchValue('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <span className="text-sm text-text-tertiary">
          {meta.total} location{meta.total !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-light-border dark:border-dark-border bg-light-hover/50 dark:bg-dark-hover/50">
                <th
                  onClick={() => handleSort('name')}
                  className="text-left px-4 py-3 font-medium text-text-tertiary cursor-pointer hover:text-text-dark-primary dark:hover:text-text-primary"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location
                    <SortIndicator field="name" />
                  </div>
                </th>
                <th className="text-left px-4 py-3 font-medium text-text-tertiary">
                  Owner
                </th>
                <th className="text-left px-4 py-3 font-medium text-text-tertiary">
                  Plan
                </th>
                <th className="text-left px-4 py-3 font-medium text-text-tertiary">
                  Platforms
                </th>
                <th
                  onClick={() => handleSort('reviews_count')}
                  className="text-right px-4 py-3 font-medium text-text-tertiary cursor-pointer hover:text-text-dark-primary dark:hover:text-text-primary"
                >
                  <div className="flex items-center justify-end gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Reviews
                    <SortIndicator field="reviews_count" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('created_at')}
                  className="text-right px-4 py-3 font-medium text-text-tertiary cursor-pointer hover:text-text-dark-primary dark:hover:text-text-primary"
                >
                  Created
                  <SortIndicator field="created_at" />
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <SkeletonRow key={i} />
                  ))}
                </>
              ) : locations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-text-tertiary">
                    {searchValue ? 'No locations found matching your search.' : 'No locations yet.'}
                  </td>
                </tr>
              ) : (
                locations.map((location) => (
                  <tr
                    key={location.id}
                    className="border-b border-light-border dark:border-dark-border last:border-0 hover:bg-light-hover/50 dark:hover:bg-dark-hover/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-text-dark-primary dark:text-text-primary">
                          {location.name}
                        </p>
                        {location.address && (
                          <p className="text-xs text-text-tertiary truncate max-w-xs">
                            {location.address}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {location.user ? (
                        <div>
                          <p className="font-medium text-text-dark-primary dark:text-text-primary">
                            {location.user.name || 'N/A'}
                          </p>
                          <p className="text-xs text-text-tertiary">
                            {location.user.email}
                          </p>
                        </div>
                      ) : (
                        <span className="text-text-tertiary">No owner</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {location.user && (
                        <PlanBadge plan={location.user.plan} />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <PlatformIcon platform="google" connected={location.platforms.google} />
                        <PlatformIcon platform="tripadvisor" connected={location.platforms.tripadvisor} />
                        <PlatformIcon platform="booking" connected={location.platforms.booking} />
                        <PlatformIcon platform="yelp" connected={location.platforms.yelp} />
                        <PlatformIcon platform="facebook" connected={location.platforms.facebook} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-medium text-text-dark-primary dark:text-text-primary">
                        {location.reviews_count}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-text-tertiary">
                      {formatDate(location.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {meta.last_page > 1 && (
        <Pagination
          currentPage={meta.current_page}
          totalPages={meta.last_page}
          total={meta.total}
          from={meta.from}
          to={meta.to}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
