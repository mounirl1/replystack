import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles, AlertCircle, MapPin } from 'lucide-react';
import { Card, CardSkeleton } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { OnboardingModal } from '@/components/response-profile/OnboardingModal';
import { ResponseProfileForm } from '@/components/response-profile/ResponseProfileForm';
import { responseProfileApi } from '@/services/responseProfile';
import { locationsApi } from '@/services/api';
import type {
  ResponseProfileFormData,
  ResponseProfileOptions,
} from '@/types/responseProfile';

interface Location {
  id: number;
  name: string;
}

export function ResponseStylePage() {
  const { t } = useTranslation('settings');
  const [searchParams, setSearchParams] = useSearchParams();
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [options, setOptions] = useState<ResponseProfileOptions | null>(null);
  const [profileData, setProfileData] = useState<ResponseProfileFormData | null>(null);
  const [profileExists, setProfileExists] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load locations and options on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load profile when location changes
  useEffect(() => {
    if (selectedLocationId) {
      loadProfile(selectedLocationId);
    }
  }, [selectedLocationId]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [locationsData, optionsData] = await Promise.all([
        locationsApi.getAll(),
        responseProfileApi.getOptions(),
      ]);

      setLocations(locationsData.locations || []);
      setOptions(optionsData);

      // Auto-select first location or from URL param
      const locationParam = searchParams.get('location');
      if (locationParam && locationsData.locations?.find((l: Location) => l.id === parseInt(locationParam))) {
        setSelectedLocationId(parseInt(locationParam));
      } else if (locationsData.locations?.length > 0) {
        setSelectedLocationId(locationsData.locations[0].id);
      }
    } catch (err) {
      setError(t('responseStyle.errors.load'));
      console.error('Failed to load initial data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProfile = async (locationId: number) => {
    try {
      const { profile, exists } = await responseProfileApi.getProfile(locationId);
      setProfileData(profile as ResponseProfileFormData);
      setProfileExists(exists);

      // Show onboarding if profile doesn't exist or is not completed
      if (!exists || !profile.onboarding_completed) {
        setShowOnboarding(true);
      }
    } catch (err) {
      setError(t('responseStyle.errors.loadProfile'));
      console.error('Failed to load profile:', err);
    }
  };

  const handleLocationChange = (locationId: number) => {
    setSelectedLocationId(locationId);
    setSearchParams({ location: locationId.toString() });
  };

  const handleOnboardingComplete = async (data: ResponseProfileFormData) => {
    if (!selectedLocationId) return;

    try {
      setIsSaving(true);
      await responseProfileApi.saveProfile(selectedLocationId, data);
      setProfileData(data);
      setProfileExists(true);
      setShowOnboarding(false);
      setSuccessMessage(t('responseStyle.success'));
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(t('responseStyle.errors.save'));
      console.error('Failed to save profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfileChange = (changes: Partial<ResponseProfileFormData>) => {
    if (profileData) {
      setProfileData({ ...profileData, ...changes });
    }
  };

  const handleSave = async () => {
    if (!selectedLocationId || !profileData) return;

    try {
      setIsSaving(true);
      await responseProfileApi.saveProfile(selectedLocationId, profileData);
      setSuccessMessage(t('responseStyle.saved'));
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(t('responseStyle.errors.save'));
      console.error('Failed to save profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!selectedLocationId) return;

    try {
      setIsResetting(true);
      const { profile } = await responseProfileApi.resetProfile(selectedLocationId);
      setProfileData(profile);
      setProfileExists(false);
      setSuccessMessage(t('responseStyle.reset'));
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(t('responseStyle.errors.reset'));
      console.error('Failed to reset profile:', err);
    } finally {
      setIsResetting(false);
    }
  };

  const handleRedoOnboarding = () => {
    setShowOnboarding(true);
  };

  const selectedLocation = locations.find((l) => l.id === selectedLocationId);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <div className="h-8 w-48 bg-light-border dark:bg-dark-border rounded animate-pulse" />
          <div className="h-5 w-72 bg-light-border dark:bg-dark-border rounded animate-pulse mt-2" />
        </div>
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-light-hover dark:bg-dark-hover rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MapPin size={24} className="text-text-tertiary" />
          </div>
          <h3 className="text-lg font-medium text-text-dark-primary dark:text-text-primary mb-2">
            {t('responseStyle.noLocation.title')}
          </h3>
          <p className="text-sm text-text-tertiary max-w-sm mx-auto mb-4">
            {t('responseStyle.noLocation.description')}
          </p>
          <Button variant="primary">
            {t('responseStyle.noLocation.cta')}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Location selector */}
      {locations.length > 1 && (
        <Select
          value={selectedLocationId?.toString() || ''}
          onChange={(e) => handleLocationChange(parseInt(e.target.value))}
          options={locations.map((l) => ({ value: l.id.toString(), label: l.name }))}
          className="w-full sm:w-64"
        />
      )}

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            ×
          </button>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500">
          <Sparkles size={20} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Profile not configured - show CTA */}
      {!profileExists && !showOnboarding && profileData && (
        <Card className="!bg-gradient-to-br from-primary-500/10 to-primary-600/5 !border-primary-500/20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                <Sparkles size={24} className="text-primary-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-dark-primary dark:text-text-primary">
                  {t('responseStyle.configure.title')}
                </h3>
                <p className="text-text-dark-secondary dark:text-text-secondary mt-1 max-w-lg">
                  {t('responseStyle.configure.description', { name: selectedLocation?.name })}
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowOnboarding(true)}
              rightIcon={<Sparkles size={16} />}
            >
              {t('responseStyle.configure.cta')}
            </Button>
          </div>
        </Card>
      )}

      {/* Profile configured - show form */}
      {profileExists && profileData && options && (
        <ResponseProfileForm
          data={profileData}
          options={options}
          onChange={handleProfileChange}
          onSave={handleSave}
          onReset={handleReset}
          onRedoOnboarding={handleRedoOnboarding}
          isSaving={isSaving}
          isResetting={isResetting}
        />
      )}

      {/* Onboarding Modal */}
      {options && profileData && (
        <OnboardingModal
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          onComplete={handleOnboardingComplete}
          initialData={profileData}
          options={options}
          locationName={selectedLocation?.name || ''}
        />
      )}
    </div>
  );
}
