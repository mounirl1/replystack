<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alerte Avis</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f7; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="background: #dc2626; padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 20px;">⚠️ Nouvel avis négatif</h1>
        </div>

        <div style="padding: 24px;">
            <p style="color: #6b7280; margin: 0 0 16px;">Un nouvel avis nécessite votre attention sur <strong>{{ $location->name }}</strong>.</p>

            <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; border-radius: 4px; margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <strong style="color: #374151;">{{ $review->author_name ?? 'Anonyme' }}</strong>
                    <span style="color: #6b7280; font-size: 14px;">{{ ucfirst($review->platform) }}</span>
                </div>

                <div style="margin-bottom: 8px;">
                    @for ($i = 1; $i <= 5; $i++)
                        <span style="color: {{ $i <= ($review->normalized_rating ?? $review->rating) ? '#f59e0b' : '#d1d5db' }}; font-size: 18px;">★</span>
                    @endfor
                    <span style="color: #6b7280; font-size: 14px; margin-left: 8px;">{{ ($review->normalized_rating ?? $review->rating) }}/5</span>
                </div>

                @if($review->title)
                    <p style="font-weight: 600; color: #374151; margin: 0 0 4px;">{{ $review->title }}</p>
                @endif

                <p style="color: #374151; margin: 0; line-height: 1.5;">{{ $review->full_comment ?: $review->content }}</p>

                @if($review->published_at)
                    <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0;">
                        Publié le {{ $review->published_at->format('d/m/Y à H:i') }}
                    </p>
                @endif
            </div>

            <p style="color: #6b7280; font-size: 14px; margin: 0;">
                Répondez rapidement pour montrer votre engagement envers la satisfaction client.
            </p>
        </div>

        <div style="background: #f9fafb; padding: 16px 24px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                Envoyé par <a href="{{ config('app.frontend_url', 'https://www.reply-stack.app') }}" style="color: #6366f1;">ReplyStack</a>
            </p>
        </div>
    </div>
</body>
</html>
