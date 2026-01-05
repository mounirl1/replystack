<?php

namespace App\Services\Platforms;

use App\Contracts\PlatformApiInterface;
use App\Models\Location;

/**
 * Factory for creating platform API service instances.
 */
class PlatformApiFactory
{
    /**
     * Platforms that support API integration.
     */
    private const API_PLATFORMS = ['google', 'facebook'];

    /**
     * Create a platform API service for the given platform and location.
     *
     * @param string $platform The platform name (google, facebook, etc.)
     * @param Location $location The location with credentials
     * @return PlatformApiInterface|null Returns null if platform doesn't support API
     */
    public static function make(string $platform, Location $location): ?PlatformApiInterface
    {
        return match ($platform) {
            'google' => new GoogleBusinessService($location),
            'facebook' => new FacebookPageService($location),
            default => null,
        };
    }

    /**
     * Check if a platform supports API integration.
     *
     * @param string $platform The platform name
     * @return bool
     */
    public static function supportsApi(string $platform): bool
    {
        return in_array($platform, self::API_PLATFORMS, true);
    }

    /**
     * Get all platforms that support API integration.
     *
     * @return array<string>
     */
    public static function getApiPlatforms(): array
    {
        return self::API_PLATFORMS;
    }

    /**
     * Get a connected service for the location, if available.
     *
     * @param string $platform
     * @param Location $location
     * @return PlatformApiInterface|null Returns null if not connected or not supported
     */
    public static function makeIfConnected(string $platform, Location $location): ?PlatformApiInterface
    {
        $service = self::make($platform, $location);

        if ($service === null || !$service->isConnected()) {
            return null;
        }

        return $service;
    }

    /**
     * Get all connected platform services for a location.
     *
     * @param Location $location
     * @return array<string, PlatformApiInterface>
     */
    public static function getAllConnected(Location $location): array
    {
        $services = [];

        foreach (self::API_PLATFORMS as $platform) {
            $service = self::makeIfConnected($platform, $location);
            if ($service !== null) {
                $services[$platform] = $service;
            }
        }

        return $services;
    }
}
