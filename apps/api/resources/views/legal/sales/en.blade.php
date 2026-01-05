@extends('legal.layouts.legal')

@section('title', 'Terms of Sale')
@section('link_legal', 'Legal Notice')
@section('link_terms', 'Terms of Use')
@section('link_sales', 'Terms of Sale')
@section('link_privacy', 'Privacy Policy')
@section('link_cookies', 'Cookie Policy')

@section('content')
<h1>Terms of Sale</h1>
<p class="last-updated">{{ $translations['lastUpdated'] }}: {{ $lastUpdatedDate }}</p>

<div class="highlight-box">
    <strong>Notice:</strong> These Terms of Sale govern all subscription purchases for ReplyStack services. By subscribing, you agree to these terms.
</div>

<h2>1. Seller Information</h2>
<ul>
    <li><strong>Company:</strong> {{ $companyName }}</li>
    <li><strong>Legal Form:</strong> {{ $companyForm }} (Moroccan Law)</li>
    <li><strong>ICE:</strong> {{ $companyId }}</li>
    <li><strong>Address:</strong> {{ $companyAddress }}</li>
    <li><strong>Email:</strong> <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
    <li><strong>Representative:</strong> {{ $directorName }}, {{ $directorTitle }}</li>
</ul>

<h2>2. Scope</h2>
<p>These Terms of Sale apply to all subscription purchases made through the ReplyStack platform (replystack.io). By completing a purchase, you enter into a binding contract with {{ $companyName }}.</p>

<h2>3. Products and Services</h2>

<h3>3.1 Service Description</h3>
<p>ReplyStack offers subscription plans for AI-powered review response generation:</p>
<ul>
    <li><strong>Free Plan:</strong> Limited daily responses, basic features</li>
    <li><strong>Starter Plan:</strong> Monthly response quota, dashboard access</li>
    <li><strong>Pro Plan:</strong> Unlimited responses, advanced features, analytics</li>
    <li><strong>Business Plan:</strong> Multi-location support, team features, priority support</li>
    <li><strong>Enterprise Plan:</strong> Custom solutions, dedicated support, API access</li>
</ul>

<h3>3.2 Service Availability</h3>
<p>Our service is available worldwide. Certain features may vary by region due to regulatory or technical constraints.</p>

<h2>4. Prices</h2>

<h3>4.1 Pricing Information</h3>
<p>All prices are displayed in Euros (EUR) and are exclusive of applicable taxes unless otherwise stated. Current pricing is available on our website at replystack.io/pricing.</p>

<h3>4.2 Price Changes</h3>
<p>We reserve the right to modify our prices at any time. Price changes will:</p>
<ul>
    <li>Be announced at least 30 days in advance</li>
    <li>Not affect active subscriptions until renewal</li>
    <li>Be communicated via email to existing customers</li>
</ul>

<h2>5. Payment</h2>

<h3>5.1 Payment Methods</h3>
<p>Payments are processed through our payment provider, Lemon Squeezy. Accepted payment methods include:</p>
<ul>
    <li>Credit and debit cards (Visa, Mastercard, American Express)</li>
    <li>PayPal (where available)</li>
    <li>Other methods as supported by our payment provider</li>
</ul>

<h3>5.2 Payment Processing</h3>
<p>All payment information is processed securely by Lemon Squeezy. We do not store your credit card details. Lemon Squeezy is PCI-DSS compliant.</p>

<h3>5.3 Billing Cycle</h3>
<ul>
    <li><strong>Monthly subscriptions:</strong> Billed on the same day each month</li>
    <li><strong>Annual subscriptions:</strong> Billed once per year with applicable discount</li>
</ul>

<h3>5.4 Failed Payments</h3>
<p>If a payment fails:</p>
<ul>
    <li>We will attempt to process the payment again within 3 business days</li>
    <li>You will be notified by email of the failed payment</li>
    <li>If payment cannot be processed after 3 attempts, your subscription may be suspended</li>
</ul>

<h2>6. Subscription and Renewal</h2>

<h3>6.1 Automatic Renewal</h3>
<p>All subscriptions automatically renew at the end of each billing period unless cancelled. By subscribing, you authorize us to charge your payment method for recurring payments.</p>

<h3>6.2 Cancellation</h3>
<p>You may cancel your subscription at any time through:</p>
<ul>
    <li>Your account settings on the ReplyStack dashboard</li>
    <li>Contacting our support at <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
</ul>
<p>Cancellation takes effect at the end of the current billing period. You will retain access to paid features until then.</p>

<h3>6.3 Downgrade</h3>
<p>You may downgrade to a lower-tier plan at any time. The change will take effect at the start of your next billing period.</p>

<h2>7. Right of Withdrawal (Cooling-Off Period)</h2>

<div class="jurisdiction-notice">
    <h3>7.1 For EU/EEA Consumers</h3>
    <p>Under EU consumer protection laws, you have the right to withdraw from this contract within 14 days without giving any reason.</p>
    <p>The withdrawal period expires 14 days from the day of the conclusion of the contract.</p>
    <p>To exercise the right of withdrawal, you must inform us of your decision by a clear statement (email to <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a>).</p>

    <h4>Exceptions</h4>
    <p>The right of withdrawal does not apply if:</p>
    <ul>
        <li>You have expressly consented to the service beginning during the withdrawal period</li>
        <li>You have acknowledged that you will lose your right of withdrawal once the service is fully performed</li>
        <li>The service has been fully performed with your prior express consent</li>
    </ul>

    <h4>Effect of Withdrawal</h4>
    <p>If you withdraw from this contract, we will reimburse all payments received from you without undue delay and no later than 14 days from the day we received notice of your withdrawal.</p>
</div>

<h3>7.2 For Other Jurisdictions</h3>
<p>For customers outside the EU/EEA, refund policies are governed by Section 8 of these Terms.</p>

<h2>8. Refund Policy</h2>

<h3>8.1 General Policy</h3>
<p>Due to the digital nature of our services:</p>
<ul>
    <li>Refunds are generally not provided for subscription periods that have already begun</li>
    <li>We evaluate refund requests on a case-by-case basis for technical issues or service failures</li>
</ul>

<h3>8.2 Requesting a Refund</h3>
<p>To request a refund:</p>
<ol>
    <li>Contact us at <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
    <li>Include your account email and reason for the request</li>
    <li>We will respond within 5 business days</li>
</ol>

<h3>8.3 Approved Refunds</h3>
<p>If a refund is approved:</p>
<ul>
    <li>The refund will be processed to your original payment method</li>
    <li>Processing time is typically 5-10 business days</li>
    <li>Your subscription will be cancelled</li>
</ul>

<h2>9. Taxes</h2>

<h3>9.1 VAT and Sales Tax</h3>
<p>Prices may be subject to Value Added Tax (VAT) or other applicable taxes depending on your location. Our payment provider will calculate and apply the correct tax rate based on your billing address.</p>

<h3>9.2 Tax Invoices</h3>
<p>Invoices are automatically generated and sent to your registered email address after each payment. You can also download invoices from your account dashboard.</p>

<h2>10. Service Level</h2>

<h3>10.1 Availability</h3>
<p>We aim for 99.9% uptime for our services. Scheduled maintenance will be announced in advance when possible.</p>

<h3>10.2 Support</h3>
<table>
    <thead>
        <tr>
            <th>Plan</th>
            <th>Support Level</th>
            <th>Response Time</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Free</td>
            <td>Email support</td>
            <td>72 hours</td>
        </tr>
        <tr>
            <td>Starter</td>
            <td>Email support</td>
            <td>48 hours</td>
        </tr>
        <tr>
            <td>Pro</td>
            <td>Priority email support</td>
            <td>24 hours</td>
        </tr>
        <tr>
            <td>Business</td>
            <td>Priority support</td>
            <td>12 hours</td>
        </tr>
        <tr>
            <td>Enterprise</td>
            <td>Dedicated support</td>
            <td>4 hours</td>
        </tr>
    </tbody>
</table>

<h2>11. Limitation of Liability</h2>
<p>Our liability for any claims arising from the subscription service is limited to the amount you have paid us in the 12 months prior to the claim. We are not liable for indirect, incidental, or consequential damages.</p>

<h2>12. Dispute Resolution</h2>

<h3>12.1 Contact Us First</h3>
<p>If you have a complaint or dispute, please contact us first at <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a>. We will work to resolve the issue within 30 days.</p>

<h3>12.2 Online Dispute Resolution (EU)</h3>
<p>For EU consumers: The European Commission provides an online dispute resolution platform at <a href="https://ec.europa.eu/consumers/odr" target="_blank">https://ec.europa.eu/consumers/odr</a></p>

<h3>12.3 Governing Law</h3>
<p>These Terms of Sale are governed by the laws of the Kingdom of Morocco. Disputes shall be subject to the exclusive jurisdiction of the courts of Marrakech, Morocco, except where mandatory consumer protection laws require otherwise.</p>

<h2>13. Changes to Terms</h2>
<p>We may update these Terms of Sale. Changes will be announced 30 days in advance and will not affect existing subscriptions until renewal.</p>

<h2>14. Contact</h2>
<p>For questions about purchases, billing, or these Terms of Sale:</p>
<ul>
    <li><strong>Email:</strong> <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
    <li><strong>Address:</strong> {{ $companyName }}, {{ $companyAddress }}</li>
</ul>
@endsection
