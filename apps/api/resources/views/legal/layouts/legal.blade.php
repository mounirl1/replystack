<!DOCTYPE html>
<html lang="{{ $locale }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title') - ReplyStack</title>
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="{{ url()->current() }}">
    @foreach($supportedLocales as $loc)
    <link rel="alternate" hreflang="{{ $loc }}" href="{{ url()->current() }}?lang={{ $loc }}">
    @endforeach
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
            line-height: 1.7;
            color: #1a1a1a;
            background: #fafafa;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            background: white;
            min-height: 100vh;
        }
        header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 30px;
            border-bottom: 1px solid #eee;
            margin-bottom: 40px;
            flex-wrap: wrap;
            gap: 15px;
        }
        .header-left {
            display: flex;
            align-items: center;
            gap: 20px;
        }
        .logo {
            font-size: 24px;
            font-weight: 700;
            color: #0ea5e9;
            text-decoration: none;
        }
        .back-link {
            color: #666;
            text-decoration: none;
            font-size: 14px;
        }
        .back-link:hover { color: #0ea5e9; }
        .lang-switcher {
            display: flex;
            gap: 8px;
        }
        .lang-switcher a {
            padding: 4px 10px;
            border-radius: 4px;
            text-decoration: none;
            font-size: 13px;
            color: #666;
            background: #f0f0f0;
            text-transform: uppercase;
        }
        .lang-switcher a:hover,
        .lang-switcher a.active {
            background: #0ea5e9;
            color: white;
        }
        h1 {
            font-size: 32px;
            margin-bottom: 10px;
            color: #111;
        }
        .last-updated {
            color: #666;
            font-size: 14px;
            margin-bottom: 40px;
        }
        h2 {
            font-size: 22px;
            margin: 40px 0 20px;
            color: #111;
            padding-bottom: 10px;
            border-bottom: 2px solid #0ea5e9;
        }
        h3 {
            font-size: 18px;
            margin: 25px 0 15px;
            color: #333;
        }
        p { margin-bottom: 15px; }
        ul, ol {
            margin: 15px 0 15px 25px;
        }
        li { margin-bottom: 8px; }
        a { color: #0ea5e9; }
        .highlight-box {
            background: #f0f9ff;
            border-left: 4px solid #0ea5e9;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        .warning-box {
            background: #fff8f0;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 14px;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border: 1px solid #ddd;
        }
        th { background: #f5f5f5; font-weight: 600; }
        footer {
            margin-top: 60px;
            padding-top: 30px;
            border-top: 1px solid #eee;
            text-align: center;
        }
        .footer-links {
            display: flex;
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
            margin-bottom: 20px;
        }
        .footer-links a {
            color: #666;
            text-decoration: none;
            font-size: 14px;
        }
        .footer-links a:hover { color: #0ea5e9; }
        .copyright {
            color: #999;
            font-size: 12px;
        }
        .jurisdiction-notice {
            background: #f0fdf4;
            border: 1px solid #86efac;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
        }
        @media (max-width: 600px) {
            h1 { font-size: 26px; }
            h2 { font-size: 20px; }
            .container { padding: 20px 15px; }
            header { flex-direction: column; align-items: flex-start; }
            table { font-size: 12px; }
            th, td { padding: 8px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <div class="header-left">
                <a href="{{ config('app.frontend_url', '/') }}" class="logo">ReplyStack</a>
                <a href="{{ config('app.frontend_url', '/') }}" class="back-link">← {{ $translations['backToHome'] }}</a>
            </div>
            <div class="lang-switcher">
                @foreach($supportedLocales as $loc)
                <a href="?lang={{ $loc }}" class="{{ $locale === $loc ? 'active' : '' }}">{{ $loc }}</a>
                @endforeach
            </div>
        </header>

        <main>
            @yield('content')
        </main>

        <footer>
            <div class="footer-links">
                <a href="/legal?lang={{ $locale }}">@yield('link_legal', 'Legal Notice')</a>
                <a href="/terms?lang={{ $locale }}">@yield('link_terms', 'Terms of Use')</a>
                <a href="/sales?lang={{ $locale }}">@yield('link_sales', 'Terms of Sale')</a>
                <a href="/privacy?lang={{ $locale }}">@yield('link_privacy', 'Privacy Policy')</a>
                <a href="/cookies?lang={{ $locale }}">@yield('link_cookies', 'Cookie Policy')</a>
            </div>
            <p class="copyright">
                © {{ date('Y') }} ReplyStack - {{ $companyName }}. {{ $translations['allRightsReserved'] }}.
            </p>
        </footer>
    </div>
</body>
</html>
