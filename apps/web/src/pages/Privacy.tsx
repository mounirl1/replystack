import { useTranslation } from 'react-i18next';
import { PageSEO } from '@/components/seo/PageSEO';

const COMPANY_INFO = {
  name: 'Techcorp informatique et communication',
  commercialName: 'ReplyStack',
  form: 'SA',
  ice: '003689600000091',
  address: 'Marrakech, Morocco',
  director: 'Mounir LAKHFIF',
  email: 'contact@replystack.io',
  lastUpdated: '2025-01-05',
};

export function Privacy() {
  const { i18n } = useTranslation();
  const lang = i18n.language?.substring(0, 2) || 'en';

  const directorTitle = lang === 'fr' ? 'Président' : lang === 'es' ? 'Presidente' : lang === 'it' ? 'Presidente' : lang === 'pt' ? 'Presidente' : 'President';
  const lastUpdatedLabel = lang === 'fr' ? 'Dernière mise à jour' : lang === 'es' ? 'Última actualización' : lang === 'it' ? 'Ultimo aggiornamento' : lang === 'pt' ? 'Última atualização' : 'Last updated';

  return (
    <>
      <PageSEO
        title="Privacy Policy - ReplyStack"
        description="Learn how ReplyStack collects, uses, and protects your personal data. GDPR, CCPA, and LGPD compliant."
        canonicalPath="/privacy"
      />

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
            <p className="text-gray-500 mb-8">{lastUpdatedLabel}: {COMPANY_INFO.lastUpdated}</p>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-8">
              <strong className="text-emerald-800">Our Commitment:</strong>
              <span className="text-emerald-700"> At ReplyStack, we are committed to protecting your privacy and personal data. This policy explains how we collect, use, and protect your information in compliance with GDPR (EU), CCPA (California), LGPD (Brazil), and Moroccan Law 09-08.</span>
            </div>

            <div className="prose prose-gray max-w-none">
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Data Controller</h2>
              <p className="text-gray-600 mb-4">The data controller responsible for your personal data is:</p>
              <ul className="list-disc pl-6 text-gray-600 space-y-1 mb-6">
                <li><strong>Company:</strong> {COMPANY_INFO.name}</li>
                <li><strong>Legal Form:</strong> {COMPANY_INFO.form} (Moroccan Law)</li>
                <li><strong>ICE:</strong> {COMPANY_INFO.ice}</li>
                <li><strong>Address:</strong> {COMPANY_INFO.address}</li>
                <li><strong>Email:</strong> <a href={`mailto:${COMPANY_INFO.email}`} className="text-emerald-600 hover:text-emerald-700">{COMPANY_INFO.email}</a></li>
                <li><strong>Representative:</strong> {COMPANY_INFO.director}, {directorTitle}</li>
              </ul>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Scope of This Policy</h2>
              <p className="text-gray-600 mb-4">This Privacy Policy applies to:</p>
              <ul className="list-disc pl-6 text-gray-600 space-y-1 mb-6">
                <li>The ReplyStack website and web application</li>
                <li>The ReplyStack dashboard</li>
                <li>The ReplyStack browser extension for Chrome and Firefox</li>
                <li>Any related services and communications</li>
              </ul>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Data We Collect</h2>

              <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">3.1 Account Information</h3>
              <ul className="list-disc pl-6 text-gray-600 space-y-1 mb-4">
                <li>Email address</li>
                <li>Name (optional)</li>
                <li>Password (stored as a secure hash, never in plain text)</li>
                <li>Plan and subscription status</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">3.2 Business Profile Data</h3>
              <ul className="list-disc pl-6 text-gray-600 space-y-1 mb-4">
                <li>Establishment name</li>
                <li>Business sector</li>
                <li>Address (optional)</li>
                <li>Response preferences (tone, language, signature)</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">3.3 Customer Review Data</h3>
              <ul className="list-disc pl-6 text-gray-600 space-y-1 mb-4">
                <li>Review content, authors, ratings, and dates from connected platforms</li>
                <li>AI-generated responses</li>
                <li>Response history and analytics</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">3.4 OAuth and Platform Connections</h3>
              <ul className="list-disc pl-6 text-gray-600 space-y-1 mb-4">
                <li>OAuth tokens for Google Business Profile and Facebook (encrypted at rest)</li>
                <li>Platform identifiers for connected accounts</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">3.5 Usage Data</h3>
              <ul className="list-disc pl-6 text-gray-600 space-y-1 mb-4">
                <li>Log files (IP address, browser type, access times)</li>
                <li>Feature usage statistics</li>
                <li>Preferences and settings</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">3.6 Payment Information</h3>
              <ul className="list-disc pl-6 text-gray-600 space-y-1 mb-4">
                <li>Billing information is processed by our payment provider (Lemon Squeezy)</li>
                <li>We do NOT store credit card numbers or banking details</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">3.7 Browser Extension Data</h3>
              <ul className="list-disc pl-6 text-gray-600 space-y-1 mb-6">
                <li>Review data from supported platforms (Google Business, TripAdvisor, etc.)</li>
                <li>The extension only operates on supported review platform pages</li>
                <li>We do not track your general browsing activity</li>
              </ul>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. How We Use Your Data</h2>
              <div className="overflow-x-auto mb-6">
                <table className="min-w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Purpose</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Legal Basis</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 text-sm">
                    <tr className="border-b"><td className="px-4 py-3">Providing the ReplyStack service (AI response generation, review aggregation)</td><td className="px-4 py-3">Contract performance</td></tr>
                    <tr className="border-b"><td className="px-4 py-3">Managing your user account</td><td className="px-4 py-3">Contract performance</td></tr>
                    <tr className="border-b"><td className="px-4 py-3">Processing payments and billing</td><td className="px-4 py-3">Contract performance / Legal obligation</td></tr>
                    <tr className="border-b"><td className="px-4 py-3">Sending transactional emails (account, billing, security)</td><td className="px-4 py-3">Contract performance</td></tr>
                    <tr className="border-b"><td className="px-4 py-3">Improving our services through analytics</td><td className="px-4 py-3">Legitimate interest</td></tr>
                    <tr className="border-b"><td className="px-4 py-3">Security and fraud prevention</td><td className="px-4 py-3">Legitimate interest / Legal obligation</td></tr>
                    <tr><td className="px-4 py-3">Marketing communications</td><td className="px-4 py-3">Consent (opt-in)</td></tr>
                  </tbody>
                </table>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Data Recipients and Processors</h2>
              <p className="text-gray-600 mb-4">We share your data with the following service providers:</p>
              <div className="overflow-x-auto mb-4">
                <table className="min-w-full border border-gray-200 rounded-lg text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b">Recipient</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b">Purpose</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b">Location</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b">Safeguards</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600">
                    <tr className="border-b"><td className="px-4 py-3">Google LLC</td><td className="px-4 py-3">AI response generation</td><td className="px-4 py-3">USA</td><td className="px-4 py-3">DPF, SCCs</td></tr>
                    <tr className="border-b"><td className="px-4 py-3">Mistral AI</td><td className="px-4 py-3">AI response generation</td><td className="px-4 py-3">France</td><td className="px-4 py-3">EU</td></tr>
                    <tr className="border-b"><td className="px-4 py-3">Railway, Inc.</td><td className="px-4 py-3">API hosting</td><td className="px-4 py-3">USA</td><td className="px-4 py-3">DPF, SCCs</td></tr>
                    <tr className="border-b"><td className="px-4 py-3">Vercel Inc.</td><td className="px-4 py-3">Frontend hosting</td><td className="px-4 py-3">USA</td><td className="px-4 py-3">DPF, SCCs</td></tr>
                    <tr className="border-b"><td className="px-4 py-3">Lemon Squeezy, LLC</td><td className="px-4 py-3">Payment processing</td><td className="px-4 py-3">USA</td><td className="px-4 py-3">DPF, SCCs, PCI-DSS</td></tr>
                    <tr className="border-b"><td className="px-4 py-3">Google LLC</td><td className="px-4 py-3">OAuth (if connected)</td><td className="px-4 py-3">USA</td><td className="px-4 py-3">DPF, SCCs</td></tr>
                    <tr><td className="px-4 py-3">Meta Platforms, Inc.</td><td className="px-4 py-3">OAuth (if connected)</td><td className="px-4 py-3">USA</td><td className="px-4 py-3">DPF, SCCs</td></tr>
                  </tbody>
                </table>
              </div>
              <p className="text-gray-500 text-sm mb-6">DPF = EU-U.S. Data Privacy Framework; SCCs = Standard Contractual Clauses</p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. International Data Transfers</h2>
              <p className="text-gray-600 mb-4">Your data may be transferred to and processed in the United States. We ensure adequate protection through:</p>
              <ul className="list-disc pl-6 text-gray-600 space-y-1 mb-6">
                <li>EU-U.S. Data Privacy Framework certification of our processors</li>
                <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
                <li>Your explicit consent to these transfers when you create an account</li>
              </ul>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. Data Retention</h2>
              <div className="overflow-x-auto mb-6">
                <table className="min-w-full border border-gray-200 rounded-lg text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b">Data Type</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b">Retention Period</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600">
                    <tr className="border-b"><td className="px-4 py-3">Account data</td><td className="px-4 py-3">Duration of subscription + 3 years</td></tr>
                    <tr className="border-b"><td className="px-4 py-3">Reviews and responses</td><td className="px-4 py-3">Duration of subscription + 1 year</td></tr>
                    <tr className="border-b"><td className="px-4 py-3">OAuth tokens</td><td className="px-4 py-3">Until disconnection or expiration</td></tr>
                    <tr className="border-b"><td className="px-4 py-3">Server logs</td><td className="px-4 py-3">12 months</td></tr>
                    <tr><td className="px-4 py-3">Billing records</td><td className="px-4 py-3">10 years (legal requirement)</td></tr>
                  </tbody>
                </table>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">8. Your Privacy Rights</h2>

              <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">8.1 Rights for All Users</h3>
              <ul className="list-disc pl-6 text-gray-600 space-y-1 mb-4">
                <li><strong>Right of Access:</strong> Request a copy of your personal data</li>
                <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Right to Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
                <li><strong>Right to Data Portability:</strong> Receive your data in a structured format</li>
                <li><strong>Right to Object:</strong> Object to certain processing activities</li>
                <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
              </ul>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                <h3 className="text-lg font-medium text-blue-800 mb-2">8.2 Additional Rights for EU/EEA Residents (GDPR)</h3>
                <ul className="list-disc pl-6 text-blue-700 space-y-1">
                  <li>Right to lodge a complaint with your local Data Protection Authority</li>
                  <li>Right to restrict processing</li>
                  <li>Right not to be subject to automated decision-making</li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                <h3 className="text-lg font-medium text-amber-800 mb-2">8.3 Additional Rights for California Residents (CCPA)</h3>
                <ul className="list-disc pl-6 text-amber-700 space-y-1">
                  <li>Right to know what personal information is collected, used, and shared</li>
                  <li>Right to delete personal information</li>
                  <li>Right to opt-out of the sale of personal information (Note: We do NOT sell personal data)</li>
                  <li>Right to non-discrimination for exercising your rights</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                <h3 className="text-lg font-medium text-green-800 mb-2">8.4 Additional Rights for Brazil Residents (LGPD)</h3>
                <ul className="list-disc pl-6 text-green-700 space-y-1">
                  <li>Right to information about data sharing with third parties</li>
                  <li>Right to anonymization, blocking, or deletion of excessive data</li>
                  <li>Right to revoke consent</li>
                </ul>
              </div>

              <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">8.5 How to Exercise Your Rights</h3>
              <p className="text-gray-600 mb-2">To exercise any of these rights, contact us at: <a href={`mailto:${COMPANY_INFO.email}`} className="text-emerald-600 hover:text-emerald-700">{COMPANY_INFO.email}</a></p>
              <p className="text-gray-600 mb-6">We will respond within 30 days of receiving your request.</p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">9. Cookies</h2>
              <p className="text-gray-600 mb-6">We use essential cookies for authentication and security. For detailed information, please see our <a href="https://api.reply-stack.app/cookies" className="text-emerald-600 hover:text-emerald-700">Cookie Policy</a>.</p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">10. Security Measures</h2>
              <p className="text-gray-600 mb-4">We implement appropriate technical and organizational measures to protect your data:</p>
              <ul className="list-disc pl-6 text-gray-600 space-y-1 mb-6">
                <li>Encryption of sensitive data at rest (AES-256)</li>
                <li>HTTPS encryption for all data in transit</li>
                <li>OAuth tokens encrypted at rest</li>
                <li>Passwords hashed using bcrypt</li>
                <li>Regular security audits</li>
                <li>Access controls and logging</li>
                <li>Employee training on data protection</li>
              </ul>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">11. Browser Extension Privacy</h2>
              <p className="text-gray-600 mb-4">The ReplyStack browser extension:</p>
              <ul className="list-disc pl-6 text-gray-600 space-y-1 mb-6">
                <li>Only activates on supported review platforms (Google Business, TripAdvisor, etc.)</li>
                <li>Does NOT track your general browsing activity</li>
                <li>Does NOT collect data from pages outside supported platforms</li>
                <li>Requires permissions only for functionality (storage, active tab on review sites)</li>
                <li>Processes review data locally before syncing with your account</li>
              </ul>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">12. Children's Privacy</h2>
              <p className="text-gray-600 mb-6">ReplyStack is not intended for users under 18 years of age. We do not knowingly collect personal data from children. If you believe we have collected data from a minor, please contact us immediately.</p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">13. Changes to This Policy</h2>
              <p className="text-gray-600 mb-4">We may update this Privacy Policy from time to time. We will:</p>
              <ul className="list-disc pl-6 text-gray-600 space-y-1 mb-6">
                <li>Notify you by email of material changes</li>
                <li>Provide 30 days notice before changes take effect</li>
                <li>Update the "Last Updated" date at the top of this page</li>
              </ul>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">14. Contact and Complaints</h2>
              <p className="text-gray-600 mb-4">For questions or complaints about this policy or our data practices:</p>
              <ul className="list-disc pl-6 text-gray-600 space-y-1 mb-4">
                <li><strong>Email:</strong> <a href={`mailto:${COMPANY_INFO.email}`} className="text-emerald-600 hover:text-emerald-700">{COMPANY_INFO.email}</a></li>
                <li><strong>Address:</strong> {COMPANY_INFO.name}, {COMPANY_INFO.address}</li>
              </ul>

              <p className="text-gray-600 mb-4">You may also contact the relevant supervisory authority:</p>
              <ul className="list-disc pl-6 text-gray-600 space-y-1 mb-6">
                <li><strong>EU:</strong> Your local Data Protection Authority</li>
                <li><strong>Morocco:</strong> CNDP (Commission Nationale de contrôle de la protection des Données à caractère personnel)</li>
                <li><strong>California:</strong> California Attorney General</li>
                <li><strong>Brazil:</strong> ANPD (Autoridade Nacional de Proteção de Dados)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
