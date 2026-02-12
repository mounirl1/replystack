<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify your email address</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: #ffffff;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
        .logo {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo-icon {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #6366f1 0%, #14b8a6 100%);
            border-radius: 16px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            margin-bottom: 12px;
        }
        .logo-text {
            font-size: 24px;
            font-weight: 700;
            color: #1f2937;
        }
        h1 {
            color: #1f2937;
            font-size: 22px;
            margin-bottom: 16px;
        }
        p {
            color: #4b5563;
            margin-bottom: 16px;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #6366f1 0%, #14b8a6 100%);
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 10px;
            font-weight: 600;
            font-size: 16px;
            margin: 24px 0;
        }
        .button:hover {
            opacity: 0.9;
        }
        .link-fallback {
            word-break: break-all;
            color: #6366f1;
            font-size: 14px;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 13px;
            color: #9ca3af;
            text-align: center;
        }
        .info {
            background-color: #eff6ff;
            border: 1px solid #3b82f6;
            border-radius: 8px;
            padding: 12px 16px;
            font-size: 14px;
            color: #1e40af;
            margin-top: 24px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <div class="logo-icon">✨</div>
            <div class="logo-text">ReplyStack</div>
        </div>

        <h1>Hello {{ $userName }},</h1>

        <p>
            Welcome to ReplyStack! Please verify your email address by clicking the button below.
        </p>

        <div style="text-align: center;">
            <a href="{{ $verificationUrl }}" class="button">Verify my email</a>
        </div>

        <p style="font-size: 14px; color: #6b7280;">
            If the button doesn't work, copy and paste this link into your browser:
        </p>
        <p class="link-fallback">{{ $verificationUrl }}</p>

        <div class="info">
            ℹ️ This link expires in <strong>24 hours</strong>. If you didn't create a ReplyStack account, you can safely ignore this email.
        </div>

        <div class="footer">
            <p>
                This email was sent by <strong>ReplyStack</strong><br>
                The AI assistant for responding to your customer reviews
            </p>
            <p>
                <a href="https://www.reply-stack.app" style="color: #6366f1;">www.reply-stack.app</a>
            </p>
        </div>
    </div>
</body>
</html>
