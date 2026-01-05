import { User, Building2, Smile, ArrowRight, PenLine } from 'lucide-react';

interface IncludeElementsStepProps {
  values: {
    include_customer_name: boolean;
    include_business_name: boolean;
    include_emojis: boolean;
    include_invitation: boolean;
    include_signature: boolean;
  };
  onChange: (key: keyof IncludeElementsStepProps['values'], value: boolean) => void;
}

const elements = [
  {
    key: 'include_customer_name' as const,
    label: 'Prénom du client',
    description: 'Utiliser le prénom du client quand disponible',
    icon: User,
  },
  {
    key: 'include_business_name' as const,
    label: 'Nom de l\'établissement',
    description: 'Mentionner le nom de votre établissement',
    icon: Building2,
  },
  {
    key: 'include_emojis' as const,
    label: 'Emojis',
    description: 'Ajouter des emojis pertinents avec modération',
    icon: Smile,
  },
  {
    key: 'include_invitation' as const,
    label: 'Invitation à revenir',
    description: 'Terminer par une invitation à revenir',
    icon: ArrowRight,
  },
  {
    key: 'include_signature' as const,
    label: 'Signature',
    description: 'Signer vos réponses (configurable après)',
    icon: PenLine,
  },
];

export function IncludeElementsStep({
  values,
  onChange,
}: IncludeElementsStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-text-dark-primary dark:text-text-primary">
          Quels éléments inclure dans vos réponses ?
        </h2>
        <p className="text-text-dark-secondary dark:text-text-secondary mt-2">
          Sélectionnez les éléments que vous souhaitez voir dans vos réponses.
        </p>
      </div>

      <div className="space-y-3">
        {elements.map((element) => {
          const Icon = element.icon;
          const isChecked = values[element.key];

          return (
            <button
              key={element.key}
              type="button"
              onClick={() => onChange(element.key, !isChecked)}
              className={`
                w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-150
                hover:border-primary-500/50 hover:bg-light-hover dark:hover:bg-dark-hover
                ${isChecked
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface'
                }
              `}
            >
              <div
                className={`
                  w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                  ${isChecked
                    ? 'bg-primary-500 text-white'
                    : 'bg-light-hover dark:bg-dark-hover text-text-dark-secondary dark:text-text-secondary'
                  }
                `}
              >
                <Icon size={20} />
              </div>
              <div className="flex-1 text-left">
                <p
                  className={`
                    font-medium
                    ${isChecked
                      ? 'text-primary-500'
                      : 'text-text-dark-primary dark:text-text-primary'
                    }
                  `}
                >
                  {element.label}
                </p>
                <p className="text-sm text-text-dark-secondary dark:text-text-secondary">
                  {element.description}
                </p>
              </div>
              <div
                className={`
                  w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors
                  ${isChecked
                    ? 'bg-primary-500 border-primary-500 text-white'
                    : 'border-light-border dark:border-dark-border'
                  }
                `}
              >
                {isChecked && (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-text-tertiary text-center">
        Cette étape est optionnelle. Vous pouvez passer à la suite.
      </p>
    </div>
  );
}
