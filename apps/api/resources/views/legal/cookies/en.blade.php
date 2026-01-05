@extends('legal.layouts.legal')

@section('title', 'Cookie Policy')
@section('link_legal', 'Legal Notice')
@section('link_terms', 'Terms of Use')
@section('link_sales', 'Terms of Sale')
@section('link_privacy', 'Privacy Policy')
@section('link_cookies', 'Cookie Policy')

@section('content')
<h1>Cookie Policy</h1>
<p class="last-updated">{{ $translations['lastUpdated'] }}: {{ $lastUpdatedDate }}</p>

<div class="highlight-box">
    <strong>Summary:</strong> ReplyStack uses only essential cookies required for the service to function. We do not use advertising or tracking cookies.
</div>

<h2>1. What Are Cookies?</h2>
<p>Cookies are small text files that are stored on your device (computer, tablet, or smartphone) when you visit a website. They help the website remember your actions and preferences over time.</p>

<h2>2. Our Cookie Policy</h2>
<p>ReplyStack is committed to respecting your privacy. We use a minimal cookie approach:</p>
<ul>
    <li>We only use <strong>strictly necessary cookies</strong> required for the service to function</li>
    <li>We do <strong>not</strong> use advertising or marketing cookies</li>
    <li>We do <strong>not</strong> use third-party tracking cookies</li>
    <li>We do <strong>not</strong> sell any data collected through cookies</li>
</ul>

<h2>3. Cookies We Use</h2>

<h3>3.1 Essential Cookies</h3>
<p>These cookies are necessary for the website to function and cannot be disabled.</p>

<table>
    <thead>
        <tr>
            <th>Cookie Name</th>
            <th>Purpose</th>
            <th>Duration</th>
            <th>Type</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>session</td>
            <td>Maintains your login session and security</td>
            <td>Session / 2 hours</td>
            <td>First-party</td>
        </tr>
        <tr>
            <td>XSRF-TOKEN</td>
            <td>Protects against cross-site request forgery attacks</td>
            <td>Session / 2 hours</td>
            <td>First-party</td>
        </tr>
        <tr>
            <td>remember_token</td>
            <td>Keeps you logged in if you choose "Remember me"</td>
            <td>30 days</td>
            <td>First-party</td>
        </tr>
    </tbody>
</table>

<h3>3.2 Functional Cookies</h3>
<p>These cookies enable personalized features.</p>

<table>
    <thead>
        <tr>
            <th>Cookie Name</th>
            <th>Purpose</th>
            <th>Duration</th>
            <th>Type</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>locale</td>
            <td>Remembers your language preference</td>
            <td>1 year</td>
            <td>First-party</td>
        </tr>
        <tr>
            <td>theme</td>
            <td>Remembers your display theme preference (light/dark)</td>
            <td>1 year</td>
            <td>First-party</td>
        </tr>
    </tbody>
</table>

<h3>3.3 Browser Extension</h3>
<p>The ReplyStack browser extension uses local storage (not cookies) to:</p>
<ul>
    <li>Store your authentication token securely</li>
    <li>Cache your preferences for faster access</li>
    <li>Remember your last used settings</li>
</ul>
<p>This data is stored locally in your browser and is not shared with third parties.</p>

<h2>4. Cookies We Do NOT Use</h2>

<p>To be clear, ReplyStack does <strong>not</strong> use:</p>
<ul>
    <li><strong>Advertising cookies:</strong> We don't show ads and don't track you for advertising purposes</li>
    <li><strong>Analytics cookies:</strong> We don't use Google Analytics or similar third-party analytics</li>
    <li><strong>Social media cookies:</strong> We don't embed social media tracking</li>
    <li><strong>Third-party tracking cookies:</strong> We don't allow third parties to place cookies on our site</li>
</ul>

<h2>5. Third-Party Services</h2>

<p>When you use certain features, you may interact with third-party services that have their own cookie policies:</p>

<table>
    <thead>
        <tr>
            <th>Service</th>
            <th>Purpose</th>
            <th>Their Cookie Policy</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Lemon Squeezy</td>
            <td>Payment processing</td>
            <td><a href="https://www.lemonsqueezy.com/privacy" target="_blank">View Policy</a></td>
        </tr>
        <tr>
            <td>Google OAuth</td>
            <td>Sign in with Google (optional)</td>
            <td><a href="https://policies.google.com/privacy" target="_blank">View Policy</a></td>
        </tr>
    </tbody>
</table>

<p>These third-party cookies are only set when you explicitly use these services (e.g., during checkout or OAuth login).</p>

<h2>6. Managing Cookies</h2>

<h3>6.1 Browser Settings</h3>
<p>You can control cookies through your browser settings:</p>
<ul>
    <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies</li>
    <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies</li>
    <li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
    <li><strong>Edge:</strong> Settings → Cookies and site permissions</li>
</ul>

<h3>6.2 Impact of Disabling Cookies</h3>
<p>If you disable essential cookies:</p>
<ul>
    <li>You will not be able to log in to your account</li>
    <li>Session security features will not work</li>
    <li>The service may not function properly</li>
</ul>

<h2>7. Cookie Consent</h2>
<p>Under GDPR and similar regulations, strictly necessary cookies do not require consent as they are essential for the service to function. Since ReplyStack only uses essential cookies:</p>
<ul>
    <li>We do not display a cookie consent banner for our essential cookies</li>
    <li>By using our service, you acknowledge the use of these necessary cookies</li>
    <li>You can always manage cookies through your browser settings</li>
</ul>

<h2>8. Data Protection</h2>
<p>Cookie data is processed in accordance with our <a href="/privacy?lang=en">Privacy Policy</a>. We ensure:</p>
<ul>
    <li>All cookies are transmitted over HTTPS (encrypted)</li>
    <li>Session cookies use secure and httpOnly flags</li>
    <li>Cookie data is not shared with third parties for marketing</li>
</ul>

<h2>9. Changes to This Policy</h2>
<p>We may update this Cookie Policy from time to time. Changes will be posted on this page with an updated revision date. We will notify you of any material changes via email.</p>

<h2>10. Contact</h2>
<p>If you have questions about our use of cookies:</p>
<ul>
    <li><strong>Email:</strong> <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
    <li><strong>Address:</strong> {{ $companyName }}, {{ $companyAddress }}</li>
</ul>
@endsection
