<?php

namespace App\Services\Google;

use App\Models\ReviewConnection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * GoogleBusinessAccountService
 *
 * Handles Google Business Profile account and location management.
 */
class GoogleBusinessAccountService
{
    private const API_BASE_URL = 'https://mybusinessaccountmanagement.googleapis.com/v1';
    private const BUSINESS_INFO_API_URL = 'https://mybusinessbusinessinformation.googleapis.com/v1';

    public function __construct(
        private readonly GoogleBusinessAuthService $authService
    ) {}

    /**
     * Get all accounts accessible by the authenticated user.
     *
     * @param ReviewConnection $connection
     * @return array
     * @throws \Exception
     */
    public function getAccounts(ReviewConnection $connection): array
    {
        $accessToken = $this->authService->getValidAccessToken($connection);

        $response = Http::withToken($accessToken)
            ->get(self::API_BASE_URL . '/accounts');

        if (!$response->successful()) {
            Log::error('Failed to fetch Google Business accounts', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new \Exception('Failed to fetch Google Business accounts');
        }

        return $response->json('accounts', []);
    }

    /**
     * Get all locations for an account.
     *
     * @param ReviewConnection $connection
     * @param string $accountName Format: accounts/{accountId}
     * @return array
     * @throws \Exception
     */
    public function getLocations(ReviewConnection $connection, string $accountName): array
    {
        $accessToken = $this->authService->getValidAccessToken($connection);

        $response = Http::withToken($accessToken)
            ->get(self::BUSINESS_INFO_API_URL . "/{$accountName}/locations", [
                'readMask' => 'name,title,storeCode,languageCode,storefrontAddress',
            ]);

        if (!$response->successful()) {
            Log::error('Failed to fetch Google Business locations', [
                'account' => $accountName,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new \Exception('Failed to fetch Google Business locations');
        }

        return $response->json('locations', []);
    }

    /**
     * Get a specific location's details.
     *
     * @param ReviewConnection $connection
     * @param string $locationName Format: locations/{locationId}
     * @return array
     * @throws \Exception
     */
    public function getLocation(ReviewConnection $connection, string $locationName): array
    {
        $accessToken = $this->authService->getValidAccessToken($connection);

        // Need to prepend account name if not present
        $fullLocationName = str_contains($locationName, '/') ? $locationName : "locations/{$locationName}";

        $response = Http::withToken($accessToken)
            ->get(self::BUSINESS_INFO_API_URL . "/{$fullLocationName}", [
                'readMask' => 'name,title,storeCode,languageCode,storefrontAddress,profile,metadata',
            ]);

        if (!$response->successful()) {
            Log::error('Failed to fetch Google Business location', [
                'location' => $locationName,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new \Exception('Failed to fetch Google Business location');
        }

        return $response->json();
    }

    /**
     * Select an account and location for a connection.
     *
     * @param ReviewConnection $connection
     * @param string $accountName
     * @param string $locationId
     */
    public function selectAccountAndLocation(
        ReviewConnection $connection,
        string $accountName,
        string $locationId
    ): void {
        $connection->update([
            'account_name' => $accountName,
            'location_id_google' => $locationId,
        ]);
    }

    /**
     * Get the full location name (with account).
     *
     * @param ReviewConnection $connection
     * @return string|null
     */
    public function getFullLocationName(ReviewConnection $connection): ?string
    {
        if (empty($connection->account_name) || empty($connection->location_id_google)) {
            return null;
        }

        return "{$connection->account_name}/{$connection->location_id_google}";
    }

    /**
     * Parse a location name to extract account and location IDs.
     *
     * @param string $locationName Format: accounts/{accountId}/locations/{locationId}
     * @return array{account_id: string, location_id: string}|null
     */
    public static function parseLocationName(string $locationName): ?array
    {
        if (preg_match('/accounts\/([^\/]+)\/locations\/([^\/]+)/', $locationName, $matches)) {
            return [
                'account_id' => $matches[1],
                'location_id' => $matches[2],
            ];
        }

        return null;
    }
}
