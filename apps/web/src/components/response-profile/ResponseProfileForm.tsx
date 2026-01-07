import { useState } from 'react';
import { Sparkles, RotateCcw, Save, Search } from 'lucide-react';
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

  const toneOptions = options.tones.map((t) => ({
    value: t.value,
    label: t.label,
  }));

  const lengthOptions = options.lengths.map((l) => ({
    value: l.value,
    label: `${l.label} (${l.wordRange.min}-${l.wordRange.max} mots)`,
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
          title="Paramètres de base"
          description="Configuration principale de vos réponses"
          action={
            <Badge variant="success" size="md">
              Configuré
            </Badge>
          }
        />

        <div className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <Select
              label="Secteur d'activité"
              options={[{ value: '', label: 'Sélectionner...' }, ...sectorOptions]}
              value={data.business_sector || ''}
              onChange={(e) =>
                onChange({
                  business_sector: e.target.value as ResponseProfileFormData['business_sector'],
                })
              }
            />

            <Input
              label="Nom de l'établissement"
              value={data.business_name}
              onChange={(e) => onChange({ business_name: e.target.value })}
              placeholder="Ex: Restaurant Le Petit Bistrot"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <Input
              label="Ville / Localisation"
              value={data.city}
              onChange={(e) => onChange({ city: e.target.value })}
              placeholder="Ex: Paris, Lyon, Marseille..."
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <Select
              label="Ton par défaut"
              options={toneOptions}
              value={data.tone}
              onChange={(e) =>
                onChange({ tone: e.target.value as ResponseProfileFormData['tone'] })
              }
            />

            <Select
              label="Longueur par défaut"
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
              label="Stratégie avis négatifs"
              options={strategyOptions}
              value={data.negative_strategy}
              onChange={(e) =>
                onChange({
                  negative_strategy: e.target.value as ResponseProfileFormData['negative_strategy'],
                })
              }
            />

            <Input
              label="Signature"
              value={data.signature}
              onChange={(e) => onChange({ signature: e.target.value })}
              placeholder="Ex: L'équipe du Petit Bistrot"
            />
          </div>
        </div>
      </Card>

      {/* Include Elements */}
      <Card>
        <CardHeader
          title="Éléments à inclure"
          description="Personnalisez le contenu de vos réponses selon le type d'avis"
        />

        <IncludeElementsTable
          value={data.include_elements}
          onChange={(include_elements) => onChange({ include_elements })}
        />
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader
          title="Personnalisation avancée"
          description="Affinez encore plus vos réponses"
        />

        <div className="space-y-5">
          <Textarea
            label="Points forts à mentionner"
            value={data.highlights}
            onChange={(e) => onChange({ highlights: e.target.value })}
            placeholder="Ex: Notre chef étoilé, Notre terrasse avec vue..."
            hint="Ces éléments seront mentionnés quand c'est pertinent"
            rows={3}
          />

          <Textarea
            label="Sujets à éviter"
            value={data.avoid_topics}
            onChange={(e) => onChange({ avoid_topics: e.target.value })}
            placeholder="Ex: Ne jamais mentionner les prix..."
            hint="Ces sujets ne seront jamais mentionnés"
            rows={3}
          />

          <Textarea
            label="Contexte additionnel"
            value={data.additional_context}
            onChange={(e) => onChange({ additional_context: e.target.value })}
            placeholder="Ex: Nous venons de rénover notre espace..."
            hint="Informations supplémentaires pour contextualiser vos réponses"
            rows={3}
          />
        </div>
      </Card>

      {/* SEO Optimization */}
      <Card>
        <CardHeader
          title="Optimisation SEO"
          description="Améliorez le référencement de vos réponses"
          action={
            <div className="flex items-center gap-2 text-text-tertiary">
              <Search size={16} />
              <span className="text-xs">Optionnel</span>
            </div>
          }
        />

        <div className="space-y-5">
          <Textarea
            label="Mots-clés SEO"
            value={data.seo_keywords}
            onChange={(e) => onChange({ seo_keywords: e.target.value })}
            placeholder="Ex: restaurant gastronomique, cuisine française, terrasse..."
            hint="Mots-clés à intégrer naturellement dans vos réponses"
            rows={2}
          />

          <Textarea
            label="Services / Produits principaux"
            value={data.main_services}
            onChange={(e) => onChange({ main_services: e.target.value })}
            placeholder="Ex: brunch du dimanche, menu dégustation, cave à vin..."
            hint="Services ou produits phares à mentionner si pertinent"
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
            Refaire l'onboarding
          </Button>
          <Button
            variant="outline"
            onClick={onReset}
            isLoading={isResetting}
            leftIcon={<RotateCcw size={16} />}
          >
            Réinitialiser
          </Button>
        </div>

        <Button
          onClick={onSave}
          isLoading={isSaving}
          leftIcon={<Save size={16} />}
        >
          Enregistrer les modifications
        </Button>
      </div>
    </div>
  );
}
