import { type ReactNode } from 'react';

export interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all
            ${
              activeTab === tab.id
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-text-dark-secondary dark:text-text-secondary hover:text-text-dark-primary dark:hover:text-text-primary hover:bg-light-hover dark:hover:bg-dark-hover'
            }
          `}
        >
          {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
