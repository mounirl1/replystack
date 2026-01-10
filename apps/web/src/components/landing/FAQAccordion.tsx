import { useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  defaultOpenIndex?: number;
}

export function FAQAccordion({ defaultOpenIndex = 0 }: FAQAccordionProps): ReactElement {
  const { t } = useTranslation('landing');
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenIndex);

  const items = t('faq.items', { returnObjects: true }) as FAQItem[];

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="border border-gray-200 rounded-2xl overflow-hidden">
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
          >
            <span className="font-semibold text-gray-900 pr-4">{item.question}</span>
            <ChevronDown
              size={20}
              className={`text-gray-500 transition-transform flex-shrink-0 ${
                openIndex === index ? 'rotate-180' : ''
              }`}
            />
          </button>
          {openIndex === index && (
            <div className="px-6 pb-6 text-gray-600 leading-relaxed">
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
