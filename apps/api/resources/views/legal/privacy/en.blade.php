@extends('legal.layouts.legal')

@section('title', 'Privacy Policy')
@section('link_legal', 'Legal Notice')
@section('link_terms', 'Terms of Use')
@section('link_sales', 'Terms of Sale')
@section('link_privacy', 'Privacy Policy')
@section('link_cookies', 'Cookie Policy')

@section('content')
<h1>Privacy Policy</h1>
<p class="last-updated">{{ $translations['lastUpdated'] }}: {{ $lastUpdatedDate }}</p>

<div class="highlight-box">
    <strong>Our Commitment:</strong> At ReplyStack, we are committed to protecting your privacy and personal data. This policy explains how we collect, use, and protect your information in compliance with GDPR (EU), CCPA (California), LGPD (Brazil), and Moroccan Law 09-08.
</div>

<h2>1. Data Controller</h2>
<p>The data controller responsible for your personal data is:</p>
<ul>
    <li><strong>Company:</strong> {{ $companyName }}</li>
    <li><strong>Legal Form:</strong> {{ $companyForm }} (Moroccan Law)</li>
    <li><strong>ICE:</strong> {{ $companyId }}</li>
    <li><strong>Address:</strong> {{ $companyAddress }}</li>
    <li><strong>Email:</strong> <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
    <li><strong>Representative:</strong> {{ $directorName }}, {{ $directorTitle }}</li>
</ul>

<h2>2. Scope of This Policy</h2>
<p>This Privacy Policy applies to:</p>
<ul>
    <li>The ReplyStack website and web application</li>
    <li>The ReplyStack dashboard</li>
    <li>The ReplyStack browser extension for Chrome and Firefox</li>
    <li>Any related services and communications</li>
</ul>

<h2>3. Data We Collect</h2>

<h3>3.1 Account Information</h3>
<ul>
    <li>Email address</li>
    <li>Name (optional)</li>
    <li>Password (stored as a secure hash, never in plain text)</li>
    <li>Plan and subscription status</li>
</ul>

<h3>3.2 Business Profile Data</h3>
<ul>
    <li>Establishment name</li>
    <li>Business sector</li>
    <li>Address (optional)</li>
    <li>Response preferences (tone, language, signature)</li>
</ul>

<h3>3.3 Customer Review Data</h3>
<ul>
    <li>Review content, authors, ratings, and dates from connected platforms</li>
    <li>AI-generated responses</li>
    <li>Response history and analytics</li>
</ul>

<h3>3.4 OAuth and Platform Connections</h3>
<ul>
    <li>OAuth tokens for Google Business Profile and Facebook (encrypted at rest)</li>
    <li>Platform identifiers for connected accounts</li>
</ul>

<h3>3.5 Usage Data</h3>
<ul>
    <li>Log files (IP address, browser type, access times)</li>
    <li>Feature usage statistics</li>
    <li>Preferences and settings</li>
</ul>

<h3>3.6 Payment Information</h3>
<ul>
    <li>Billing information is processed by our payment provider (Lemon Squeezy)</li>
    <li>We do NOT store credit card numbers or banking details</li>
</ul>

<h3>3.7 Browser Extension Data</h3>
<ul>
    <li>Review data from supported platforms (Google Business, TripAdvisor, etc.)</li>
    <li>The extension only operates on supported review platform pages</li>
    <li>We do not track your general browsing activity</li>
</ul>

<h2>4. How We Use Your Data</h2>
<table>
    <thead>
        <tr>
            <th>Purpose</th>
            <th>Legal Basis</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Providing the ReplyStack service (AI response generation, review aggregation)</td>
            <td>Contract performance</td>
        </tr>
        <tr>
            <td>Managing your user account</td>
            <td>Contract performance</td>
        </tr>
        <tr>
            <td>Processing payments and billing</td>
            <td>Contract performance / Legal obligation</td>
        </tr>
        <tr>
            <td>Sending transactional emails (account, billing, security)</td>
            <td>Contract performance</td>
        </tr>
        <tr>
            <td>Improving our services through analytics</td>
            <td>Legitimate interest</td>
        </tr>
        <tr>
            <td>Security and fraud prevention</td>
            <td>Legitimate interest / Legal obligation</td>
        </tr>
        <tr>
            <td>Marketing communications</td>
            <td>Consent (opt-in)</td>
        </tr>
    </tbody>
</table>

<h2>5. Data Recipients and Processors</h2>
<p>We share your data with the following service providers:</p>
<table>
    <thead>
        <tr>
            <th>Recipient</th>
            <th>Purpose</th>
            <th>Location</th>
            <th>Safeguards</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Anthropic, PBC</td>
            <td>AI response generation</td>
            <td>USA</td>
            <td>DPF, SCCs</td>
        </tr>
        <tr>
            <td>Railway, Inc.</td>
            <td>API hosting</td>
            <td>USA</td>
            <td>DPF, SCCs</td>
        </tr>
        <tr>
            <td>Vercel Inc.</td>
            <td>Frontend hosting</td>
            <td>USA</td>
            <td>DPF, SCCs</td>
        </tr>
        <tr>
            <td>Lemon Squeezy, LLC</td>
            <td>Payment processing</td>
            <td>USA</td>
            <td>DPF, SCCs, PCI-DSS</td>
        </tr>
        <tr>
            <td>Google LLC</td>
            <td>OAuth (if connected)</td>
            <td>USA</td>
            <td>DPF, SCCs</td>
        </tr>
        <tr>
            <td>Meta Platforms, Inc.</td>
            <td>OAuth (if connected)</td>
            <td>USA</td>
            <td>DPF, SCCs</td>
        </tr>
    </tbody>
</table>
<p><small>DPF = EU-U.S. Data Privacy Framework; SCCs = Standard Contractual Clauses</small></p>

<h2>6. International Data Transfers</h2>
<p>Your data may be transferred to and processed in the United States. We ensure adequate protection through:</p>
<ul>
    <li>EU-U.S. Data Privacy Framework certification of our processors</li>
    <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
    <li>Your explicit consent to these transfers when you create an account</li>
</ul>

<h2>7. Data Retention</h2>
<table>
    <thead>
        <tr>
            <th>Data Type</th>
            <th>Retention Period</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Account data</td>
            <td>Duration of subscription + 3 years</td>
        </tr>
        <tr>
            <td>Reviews and responses</td>
            <td>Duration of subscription + 1 year</td>
        </tr>
        <tr>
            <td>OAuth tokens</td>
            <td>Until disconnection or expiration</td>
        </tr>
        <tr>
            <td>Server logs</td>
            <td>12 months</td>
        </tr>
        <tr>
            <td>Billing records</td>
            <td>10 years (legal requirement)</td>
        </tr>
    </tbody>
</table>

<h2>8. Your Privacy Rights</h2>

<h3>8.1 Rights for All Users</h3>
<ul>
    <li><strong>Right of Access:</strong> Request a copy of your personal data</li>
    <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
    <li><strong>Right to Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
    <li><strong>Right to Data Portability:</strong> Receive your data in a structured format</li>
    <li><strong>Right to Object:</strong> Object to certain processing activities</li>
    <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
</ul>

<div class="jurisdiction-notice">
    <h3>8.2 Additional Rights for EU/EEA Residents (GDPR)</h3>
    <ul>
        <li>Right to lodge a complaint with your local Data Protection Authority</li>
        <li>Right to restrict processing</li>
        <li>Right not to be subject to automated decision-making</li>
    </ul>
</div>

<div class="jurisdiction-notice">
    <h3>8.3 Additional Rights for California Residents (CCPA)</h3>
    <ul>
        <li>Right to know what personal information is collected, used, and shared</li>
        <li>Right to delete personal information</li>
        <li>Right to opt-out of the sale of personal information (Note: We do NOT sell personal data)</li>
        <li>Right to non-discrimination for exercising your rights</li>
    </ul>
</div>

<div class="jurisdiction-notice">
    <h3>8.4 Additional Rights for Brazil Residents (LGPD)</h3>
    <ul>
        <li>Right to information about data sharing with third parties</li>
        <li>Right to anonymization, blocking, or deletion of excessive data</li>
        <li>Right to revoke consent</li>
    </ul>
</div>

<h3>8.5 How to Exercise Your Rights</h3>
<p>To exercise any of these rights, contact us at: <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></p>
<p>We will respond within 30 days of receiving your request.</p>

<h2>9. Cookies</h2>
<p>We use essential cookies for authentication and security. For detailed information, please see our <a href="/cookies?lang=en">Cookie Policy</a>.</p>

<h2>10. Security Measures</h2>
<p>We implement appropriate technical and organizational measures to protect your data:</p>
<ul>
    <li>Encryption of sensitive data at rest (AES-256)</li>
    <li>HTTPS encryption for all data in transit</li>
    <li>OAuth tokens encrypted at rest</li>
    <li>Passwords hashed using bcrypt</li>
    <li>Regular security audits</li>
    <li>Access controls and logging</li>
    <li>Employee training on data protection</li>
</ul>

<h2>11. Browser Extension Privacy</h2>
<p>The ReplyStack browser extension:</p>
<ul>
    <li>Only activates on supported review platforms (Google Business, TripAdvisor, etc.)</li>
    <li>Does NOT track your general browsing activity</li>
    <li>Does NOT collect data from pages outside supported platforms</li>
    <li>Requires permissions only for functionality (storage, active tab on review sites)</li>
    <li>Processes review data locally before syncing with your account</li>
</ul>

<h2>12. Children's Privacy</h2>
<p>ReplyStack is not intended for users under 18 years of age. We do not knowingly collect personal data from children. If you believe we have collected data from a minor, please contact us immediately.</p>

<h2>13. Changes to This Policy</h2>
<p>We may update this Privacy Policy from time to time. We will:</p>
<ul>
    <li>Notify you by email of material changes</li>
    <li>Provide 30 days notice before changes take effect</li>
    <li>Update the "Last Updated" date at the top of this page</li>
</ul>

<h2>14. Contact and Complaints</h2>
<p>For questions or complaints about this policy or our data practices:</p>
<ul>
    <li><strong>Email:</strong> <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
    <li><strong>Address:</strong> {{ $companyName }}, {{ $companyAddress }}</li>
</ul>

<p>You may also contact the relevant supervisory authority:</p>
<ul>
    <li><strong>EU:</strong> Your local Data Protection Authority</li>
    <li><strong>Morocco:</strong> CNDP (Commission Nationale de contrôle de la protection des Données à caractère personnel)</li>
    <li><strong>California:</strong> California Attorney General</li>
    <li><strong>Brazil:</strong> ANPD (Autoridade Nacional de Proteção de Dados)</li>
</ul>
@endsection
