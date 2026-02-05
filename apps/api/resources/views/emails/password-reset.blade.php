<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Réinitialisation de mot de passe</title>
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
        .warning {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 12px 16px;
            font-size: 14px;
            color: #92400e;
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

        <h1>Bonjour {{ $userName }},</h1>

        <p>
            Vous avez demandé à réinitialiser votre mot de passe pour votre compte ReplyStack.
            Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe.
        </p>

        <div style="text-align: center;">
            <a href="{{ $resetUrl }}" class="button">Réinitialiser mon mot de passe</a>
        </div>

        <p style="font-size: 14px; color: #6b7280;">
            Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
        </p>
        <p class="link-fallback">{{ $resetUrl }}</p>

        <div class="warning">
            ⚠️ Ce lien expire dans <strong>60 minutes</strong>. Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.
        </div>

        <div class="footer">
            <p>
                Cet email a été envoyé par <strong>ReplyStack</strong><br>
                L'assistant IA pour répondre à vos avis clients
            </p>
            <p>
                <a href="https://www.reply-stack.app" style="color: #6366f1;">www.reply-stack.app</a>
            </p>
        </div>
    </div>
</body>
</html>
