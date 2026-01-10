import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

export function TestimonialsGrid(): ReactElement {
  const { t } = useTranslation('landing');

  const testimonials = t('testimonialsSection.items', { returnObjects: true }) as Testimonial[];

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {testimonials.map((testimonial, index) => (
        <div key={index} className="testimonial-card">
          <div className="flex gap-1 mb-4 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={16} fill="currentColor" />
            ))}
          </div>
          <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.quote}"</p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold">
              {testimonial.author
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{testimonial.author}</p>
              <p className="text-sm text-gray-500">{testimonial.role}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
