import {
  Building2,
  UtensilsCrossed,
  ShoppingBag,
  Sparkles,
  Dumbbell,
  Home,
  Stethoscope,
  Car,
  Wrench,
  PartyPopper,
  Compass,
  GraduationCap,
  ShoppingCart,
  Briefcase,
  PawPrint,
  Camera,
  Plane,
  MoreHorizontal,
} from 'lucide-react';
import type { BusinessSector, SectorOption } from '@/types/responseProfile';

interface BusinessSectorStepProps {
  value: BusinessSector | null;
  onChange: (value: BusinessSector) => void;
  sectors: SectorOption[];
}

const iconMap: Record<string, React.ReactNode> = {
  Building2: <Building2 size={24} />,
  UtensilsCrossed: <UtensilsCrossed size={24} />,
  ShoppingBag: <ShoppingBag size={24} />,
  Sparkles: <Sparkles size={24} />,
  Dumbbell: <Dumbbell size={24} />,
  Home: <Home size={24} />,
  Stethoscope: <Stethoscope size={24} />,
  Car: <Car size={24} />,
  Wrench: <Wrench size={24} />,
  PartyPopper: <PartyPopper size={24} />,
  Compass: <Compass size={24} />,
  GraduationCap: <GraduationCap size={24} />,
  ShoppingCart: <ShoppingCart size={24} />,
  Briefcase: <Briefcase size={24} />,
  PawPrint: <PawPrint size={24} />,
  Camera: <Camera size={24} />,
  Plane: <Plane size={24} />,
  MoreHorizontal: <MoreHorizontal size={24} />,
};

export function BusinessSectorStep({
  value,
  onChange,
  sectors,
}: BusinessSectorStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-text-dark-primary dark:text-text-primary">
          Quel est votre secteur d'activité ?
        </h2>
        <p className="text-text-dark-secondary dark:text-text-secondary mt-2">
          Cela nous aide à personnaliser le style de vos réponses.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2">
        {sectors.map((sector) => (
          <button
            key={sector.value}
            type="button"
            onClick={() => onChange(sector.value)}
            className={`
              flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-150
              hover:border-primary-500/50 hover:bg-light-hover dark:hover:bg-dark-hover
              ${value === sector.value
                ? 'border-primary-500 bg-primary-500/10'
                : 'border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface'
              }
            `}
          >
            <div
              className={`
                w-12 h-12 rounded-xl flex items-center justify-center
                ${value === sector.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-light-hover dark:bg-dark-hover text-text-dark-secondary dark:text-text-secondary'
                }
              `}
            >
              {iconMap[sector.icon] || <MoreHorizontal size={24} />}
            </div>
            <span
              className={`
                text-sm font-medium text-center
                ${value === sector.value
                  ? 'text-primary-500'
                  : 'text-text-dark-primary dark:text-text-primary'
                }
              `}
            >
              {sector.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
