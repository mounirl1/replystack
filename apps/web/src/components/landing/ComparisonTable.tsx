import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, CheckCircle2, X } from 'lucide-react';

interface ComparisonRow {
  feature: string;
  replystack: boolean;
  manual: boolean;
  others: string | boolean;
}

export function ComparisonTable(): ReactElement {
  const { t } = useTranslation('landing');

  const rows = t('comparison.rows', { returnObjects: true }) as ComparisonRow[];

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-4 px-4 font-semibold text-gray-900">
              {t('comparison.feature')}
            </th>
            <th className="text-center py-4 px-4">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-full font-semibold">
                <Sparkles size={16} />
                {t('comparison.replystack')}
              </div>
            </th>
            <th className="text-center py-4 px-4 font-semibold text-gray-600">
              {t('comparison.manual')}
            </th>
            <th className="text-center py-4 px-4 font-semibold text-gray-600">
              {t('comparison.others')}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-gray-100">
              <td className="py-4 px-4 text-gray-700">{row.feature}</td>
              <td className="text-center py-4 px-4">
                {row.replystack === true ? (
                  <CheckCircle2 className="inline text-emerald-500" size={24} />
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
              <td className="text-center py-4 px-4">
                {row.manual === true ? (
                  <CheckCircle2 className="inline text-gray-400" size={24} />
                ) : (
                  <X className="inline text-gray-300" size={24} />
                )}
              </td>
              <td className="text-center py-4 px-4">
                {row.others === true ? (
                  <CheckCircle2 className="inline text-gray-400" size={24} />
                ) : row.others === false ? (
                  <X className="inline text-gray-300" size={24} />
                ) : (
                  <span className="text-sm text-gray-500">{row.others}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
