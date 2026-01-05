import { Input } from '@/components/ui/Input';

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
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-text-dark-primary dark:text-text-primary">
          Informations de votre établissement
        </h2>
        <p className="text-text-dark-secondary dark:text-text-secondary mt-2">
          Ces informations seront utilisées dans vos réponses.
        </p>
      </div>

      <div className="space-y-5">
        <Input
          label="Nom de l'établissement"
          value={businessName}
          onChange={(e) => onBusinessNameChange(e.target.value)}
          placeholder="Ex: Restaurant Le Petit Bistrot"
          error={errors?.business_name}
          hint="Ce nom sera mentionné dans vos réponses"
        />

        <Input
          label="Signature (optionnel)"
          value={signature}
          onChange={(e) => onSignatureChange(e.target.value)}
          placeholder="Ex: L'équipe du Petit Bistrot"
          error={errors?.signature}
          hint="Cette signature apparaîtra à la fin de vos réponses"
        />

        <div className="p-4 bg-light-hover dark:bg-dark-hover rounded-xl">
          <p className="text-xs text-text-tertiary mb-2">Aperçu de la fin de réponse :</p>
          <p className="text-sm text-text-dark-secondary dark:text-text-secondary italic">
            "Nous espérons vous revoir très bientôt{businessName ? ` chez ${businessName}` : ''} !
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
