import { Input } from '@/components/ui/Input';
import { useTranslation } from 'react-i18next';

interface BusinessInfoStepProps {
  businessName: string;
  signature: string;
  onBusinessNameChange: (value: string) => void;
  onSignatureChange: (value: string) => void;
  errors?: {
    business_name?: string;
    signature?: string;
  };
}

export function BusinessInfoStep({
  businessName,
  signature,
  onBusinessNameChange,
  onSignatureChange,
  errors,
}: BusinessInfoStepProps) {
  const { t } = useTranslation('settings');

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-text-dark-primary dark:text-text-primary">
          {t('responseStyle.modal.businessInfo.title')}
        </h2>
        <p className="text-text-dark-secondary dark:text-text-secondary mt-2">
          {t('responseStyle.modal.businessInfo.subtitle')}
        </p>
      </div>

      <div className="space-y-5">
        <Input
          label={t('responseStyle.modal.businessInfo.businessName')}
          value={businessName}
          onChange={(e) => onBusinessNameChange(e.target.value)}
          placeholder={t('responseStyle.form.placeholders.businessName')}
          error={errors?.business_name}
          hint={t('responseStyle.modal.businessInfo.businessNameHint')}
        />

        <Input
          label={t('responseStyle.modal.businessInfo.signature')}
          value={signature}
          onChange={(e) => onSignatureChange(e.target.value)}
          placeholder={t('responseStyle.form.placeholders.signature')}
          error={errors?.signature}
          hint={t('responseStyle.modal.businessInfo.signatureHint')}
        />

        <div className="p-4 bg-light-hover dark:bg-dark-hover rounded-xl">
          <p className="text-xs text-text-tertiary mb-2">{t('responseStyle.modal.businessInfo.previewLabel')}</p>
          <p className="text-sm text-text-dark-secondary dark:text-text-secondary italic">
            "{t('responseStyle.modal.businessInfo.previewText', { businessName: businessName ? t('responseStyle.modal.businessInfo.previewAt', { name: businessName }) : '' })}
            {signature && (
              <>
                <br />
                <span className="mt-1 inline-block">— {signature}</span>
              </>
            )}
            "
          </p>
        </div>
      </div>
    </div>
  );
}
