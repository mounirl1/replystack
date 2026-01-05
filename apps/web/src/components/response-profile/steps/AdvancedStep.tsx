import { Textarea } from '@/components/ui/Input';

interface AdvancedStepProps {
  highlights: string;
  avoidTopics: string;
  additionalContext: string;
  onHighlightsChange: (value: string) => void;
  onAvoidTopicsChange: (value: string) => void;
  onAdditionalContextChange: (value: string) => void;
}

export function AdvancedStep({
  highlights,
  avoidTopics,
  additionalContext,
  onHighlightsChange,
  onAvoidTopicsChange,
  onAdditionalContextChange,
}: AdvancedStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-text-dark-primary dark:text-text-primary">
          Personnalisation avancée
        </h2>
        <p className="text-text-dark-secondary dark:text-text-secondary mt-2">
          Affinez encore plus vos réponses (optionnel).
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <Textarea
            label="Points forts à mentionner"
            value={highlights}
            onChange={(e) => onHighlightsChange(e.target.value)}
            placeholder="Ex: Notre chef étoilé, Notre terrasse avec vue, Notre service 24h/24..."
            hint="Ces éléments seront mentionnés quand c'est pertinent"
            rows={3}
          />
        </div>

        <div>
          <Textarea
            label="Sujets à éviter"
            value={avoidTopics}
            onChange={(e) => onAvoidTopicsChange(e.target.value)}
            placeholder="Ex: Ne jamais mentionner les prix, Ne pas promettre de compensation..."
            hint="Ces sujets ne seront jamais mentionnés"
            rows={3}
          />
        </div>

        <div>
          <Textarea
            label="Contexte additionnel"
            value={additionalContext}
            onChange={(e) => onAdditionalContextChange(e.target.value)}
            placeholder="Ex: Nous venons de rénover notre espace, Nous sommes une entreprise familiale depuis 3 générations..."
            hint="Informations supplémentaires pour contextualiser vos réponses"
            rows={3}
          />
        </div>
      </div>

      <p className="text-xs text-text-tertiary text-center">
        Cette étape est optionnelle. Vous pouvez la compléter plus tard dans les paramètres.
      </p>
    </div>
  );
}
