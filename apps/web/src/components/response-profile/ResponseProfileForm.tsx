import { useState } from 'react';
import { Sparkles, RotateCcw, Save, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { IncludeElementsTable } from './IncludeElementsTable';
import type {
  ResponseProfileFormData,
  ResponseProfileOptions,
} from '@/types/responseProfile';

interface ResponseProfileFormProps {
  data: ResponseProfileFormData;
  options: ResponseProfileOptions;
  onChange: (data: Partial<ResponseProfileFormData>) => void;
  onSave: () => void;
  onReset: () => void;
  onRedoOnboarding: () => void;
  isSaving: boolean;
  isResetting: boolean;
}

export function ResponseProfileForm({
  data,
  options,
  onChange,
  onSave,
  onReset,
  onRedoOnboarding,
  isSaving,
  isResetting,
}: ResponseProfileFormProps) {
  const { t } = useTranslation('settings');
  const [_expandedSections, _setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    elements: true,
    advanced: false,
  });

  _setExpandedSections; // Prevent unused variable warning
  const _toggleSection = (section: string) => {
    _setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };
  _toggleSection; // Prevent unused variable warning

  const sectorOptions = options.sectors.map((s) => ({
    value: s.value,
    label: s.label,
  }));

  const toneOptions = options.tones.map((tone) => ({
    value: tone.value,
    label: tone.label,
  }));

  const lengthOptions = options.lengths.map((l) => ({
    value: l.value,
    label: `${l.label} (${t('responseStyle.modal.length.wordRange', { min: l.wordRange.min, max: l.wordRange.max })})`,
  }));

  const strategyOptions = options.negativeStrategies.map((s) => ({
    value: s.value,
    label: s.label,
  }));

  return (
    <div className="space-y-6">
      {/* Basic Settings */}
      <Card>
        <CardHeader
          title={t('responseStyle.form.sections.basic')}
          description={t('responseStyle.form.sections.basicDescription')}
          action={
            <Badge variant="success" size="md">
              {t('responseStyle.form.badges.configured')}
            </Badge>
          }
        />

        <div className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <Select
              label={t('responseStyle.form.labels.sector')}
              options={[{ value: '', label: t('responseStyle.form.placeholders.select') }, ...sectorOptions]}
              value={data.business_sector || ''}
              onChange={(e) =>
                onChange({
                  business_sector: e.target.value as ResponseProfileFormData['business_sector'],
                })
              }
            />

            <Input
              label={t('responseStyle.form.labels.businessName')}
              value={data.business_name}
              onChange={(e) => onChange({ business_name: e.target.value })}
              placeholder={t('responseStyle.form.placeholders.businessName')}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <Input
              label={t('responseStyle.form.labels.city')}
              value={data.city}
              onChange={(e) => onChange({ city: e.target.value })}
              placeholder={t('responseStyle.seo.cityPlaceholder')}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <Select
              label={t('responseStyle.form.labels.defaultTone')}
              options={toneOptions}
              value={data.tone}
              onChange={(e) =>
                onChange({ tone: e.target.value as ResponseProfileFormData['tone'] })
              }
            />

            <Select
              label={t('responseStyle.form.labels.defaultLength')}
              options={lengthOptions}
              value={data.default_length}
              onChange={(e) =>
                onChange({
                  default_length: e.target.value as ResponseProfileFormData['default_length'],
                })
              }
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <Select
              label={t('responseStyle.form.labels.negativeStrategy')}
              options={strategyOptions}
              value={data.negative_strategy}
              onChange={(e) =>
                onChange({
                  negative_strategy: e.target.value as ResponseProfileFormData['negative_strategy'],
                })
              }
            />

            <Input
              label={t('responseStyle.modal.businessInfo.signature')}
              value={data.signature}
              onChange={(e) => onChange({ signature: e.target.value })}
              placeholder={t('responseStyle.form.placeholders.signature')}
            />
          </div>
        </div>
      </Card>

      {/* Include Elements */}
      <Card>
        <CardHeader
          title={t('responseStyle.form.sections.elements')}
          description={t('responseStyle.includeElements.description')}
        />

        <IncludeElementsTable
          value={data.include_elements}
          onChange={(include_elements) => onChange({ include_elements })}
        />
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader
          title={t('responseStyle.form.sections.advanced')}
          description={t('responseStyle.form.sections.advancedDescription')}
        />

        <div className="space-y-5">
          <Textarea
            label={t('responseStyle.form.labels.highlights')}
            value={data.highlights}
            onChange={(e) => onChange({ highlights: e.target.value })}
            placeholder={t('responseStyle.modal.advanced.highlightsPlaceholder')}
            hint={t('responseStyle.modal.advanced.highlightsHint')}
            rows={3}
          />

          <Textarea
            label={t('responseStyle.form.labels.avoidTopics')}
            value={data.avoid_topics}
            onChange={(e) => onChange({ avoid_topics: e.target.value })}
            placeholder={t('responseStyle.modal.advanced.avoidTopicsPlaceholder')}
            hint={t('responseStyle.modal.advanced.avoidTopicsHint')}
            rows={3}
          />

          <Textarea
            label={t('responseStyle.form.labels.additionalContext')}
            value={data.additional_context}
            onChange={(e) => onChange({ additional_context: e.target.value })}
            placeholder={t('responseStyle.modal.advanced.additionalContextPlaceholder')}
            hint={t('responseStyle.modal.advanced.additionalContextHint')}
            rows={3}
          />
        </div>
      </Card>

      {/* SEO Optimization */}
      <Card>
        <CardHeader
          title={t('responseStyle.seo.title')}
          description={t('responseStyle.seo.description')}
          action={
            <div className="flex items-center gap-2 text-text-tertiary">
              <Search size={16} />
              <span className="text-xs">{t('responseStyle.seo.optional')}</span>
            </div>
          }
        />

        <div className="space-y-5">
          <Textarea
            label={t('responseStyle.seo.keywords')}
            value={data.seo_keywords}
            onChange={(e) => onChange({ seo_keywords: e.target.value })}
            placeholder={t('responseStyle.seo.keywordsPlaceholder')}
            hint={t('responseStyle.seo.keywordsHint')}
            rows={2}
          />

          <Textarea
            label={t('responseStyle.seo.services')}
            value={data.main_services}
            onChange={(e) => onChange({ main_services: e.target.value })}
            placeholder={t('responseStyle.seo.servicesPlaceholder')}
            hint={t('responseStyle.seo.servicesHint')}
            rows={2}
          />
        </div>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={onRedoOnboarding}
            leftIcon={<Sparkles size={16} />}
          >
            {t('responseStyle.form.buttons.redoOnboarding')}
          </Button>
          <Button
            variant="outline"
            onClick={onReset}
            isLoading={isResetting}
            leftIcon={<RotateCcw size={16} />}
          >
            {t('responseStyle.form.buttons.reset')}
          </Button>
        </div>

        <Button
          onClick={onSave}
          isLoading={isSaving}
          leftIcon={<Save size={16} />}
        >
          {t('responseStyle.form.buttons.save')}
        </Button>
      </div>
    </div>
  );
}
