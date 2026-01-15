import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, MessageSquare, Clock, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageSEO } from '@/components/seo/PageSEO';
import { contactApi } from '@/services/api';

type ContactReason = 'support' | 'sales' | 'partnership' | 'other';

export function Contact() {
  const { t } = useTranslation('contact');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState<ContactReason>('support');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await contactApi.send({
        name,
        email,
        reason,
        subject,
        message,
      });
      setIsSuccess(true);
      // Reset form
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setReason('support');
    } catch (err) {
      setError(t('form.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const reasons: { value: ContactReason; label: string; icon: string }[] = [
    { value: 'support', label: t('reasons.support'), icon: '🛟' },
    { value: 'sales', label: t('reasons.sales'), icon: '💼' },
    { value: 'partnership', label: t('reasons.partnership'), icon: '🤝' },
    { value: 'other', label: t('reasons.other'), icon: '💬' },
  ];

  // Structured data for contact page
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": t('seo.title'),
    "description": t('seo.description'),
    "mainEntity": {
      "@type": "Organization",
      "name": "ReplyStack",
      "email": "support@reply-stack.app",
      "url": "https://www.reply-stack.app"
    }
  };

  return (
    <>
      <PageSEO
        title={t('seo.title')}
        description={t('seo.description')}
        canonicalPath="/contact"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t('hero.title')}
            </h1>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto">
              {t('hero.subtitle')}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-8">
              {/* Quick Contact Cards */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{t('info.email.title')}</h3>
                    <a
                      href="mailto:support@reply-stack.app"
                      className="text-primary-600 hover:text-primary-700"
                    >
                      support@reply-stack.app
                    </a>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{t('info.email.description')}</p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{t('info.chat.title')}</h3>
                    <span className="text-green-600 text-sm font-medium">{t('info.chat.status')}</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{t('info.chat.description')}</p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{t('info.response.title')}</h3>
                    <span className="text-amber-600 text-sm font-medium">{t('info.response.time')}</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{t('info.response.description')}</p>
              </div>

              {/* FAQ Link */}
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{t('faq.title')}</h3>
                <p className="text-gray-600 text-sm mb-4">{t('faq.description')}</p>
                <a
                  href="/faq"
                  className="inline-flex items-center text-primary-600 font-medium hover:text-primary-700"
                >
                  {t('faq.link')} →
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                {isSuccess ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {t('success.title')}
                    </h2>
                    <p className="text-gray-600 mb-6">
                      {t('success.message')}
                    </p>
                    <Button onClick={() => setIsSuccess(false)}>
                      {t('success.sendAnother')}
                    </Button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      {t('form.title')}
                    </h2>

                    {error && (
                      <div className="flex items-center gap-3 bg-red-50 text-red-700 px-4 py-3 rounded-xl mb-6">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p>{error}</p>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Reason Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          {t('form.reason')}
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {reasons.map((r) => (
                            <button
                              key={r.value}
                              type="button"
                              onClick={() => setReason(r.value)}
                              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                                reason === r.value
                                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
                              }`}
                            >
                              <span className="text-2xl">{r.icon}</span>
                              <span className="text-sm font-medium">{r.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Name & Email */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <Input
                          label={t('form.name')}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder={t('form.namePlaceholder')}
                          required
                        />
                        <Input
                          label={t('form.email')}
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={t('form.emailPlaceholder')}
                          required
                        />
                      </div>

                      {/* Subject */}
                      <Input
                        label={t('form.subject')}
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder={t('form.subjectPlaceholder')}
                        required
                      />

                      {/* Message */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('form.message')}
                        </label>
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder={t('form.messagePlaceholder')}
                          rows={6}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none transition-colors"
                        />
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        size="lg"
                        isLoading={isSubmitting}
                        leftIcon={<Send className="w-5 h-5" />}
                        className="w-full md:w-auto"
                      >
                        {t('form.submit')}
                      </Button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
