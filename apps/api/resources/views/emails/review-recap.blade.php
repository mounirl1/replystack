<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Récapitulatif Avis</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f7; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="background: #6366f1; padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 20px;">📊 Récapitulatif des avis</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">{{ $location->name }} — {{ $period }}</p>
        </div>

        <div style="padding: 24px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
                <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 28px; font-weight: 700; color: #16a34a;">{{ $stats['new_reviews'] }}</div>
                    <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Nouveaux avis</div>
                </div>
                <div style="background: #eff6ff; padding: 16px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 28px; font-weight: 700; color: #2563eb;">{{ number_format($stats['avg_rating'], 1) }}</div>
                    <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Note moyenne</div>
                </div>
            </div>

            @if(!empty($stats['rating_distribution']))
                <h3 style="color: #374151; font-size: 14px; margin: 0 0 12px;">Distribution des notes</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                    @foreach([5, 4, 3, 2, 1] as $rating)
                        @php
                            $count = $stats['rating_distribution'][$rating] ?? 0;
                            $pct = $stats['new_reviews'] > 0 ? round(($count / $stats['new_reviews']) * 100) : 0;
                        @endphp
                        <tr>
                            <td style="padding: 4px 8px 4px 0; width: 30px; color: #6b7280; font-size: 13px;">{{ $rating }}★</td>
                            <td style="padding: 4px 0;">
                                <div style="background: #e5e7eb; border-radius: 4px; height: 16px; overflow: hidden;">
                                    <div style="background: {{ $rating >= 4 ? '#16a34a' : ($rating >= 3 ? '#f59e0b' : '#dc2626') }}; height: 100%; width: {{ $pct }}%; border-radius: 4px;"></div>
                                </div>
                            </td>
                            <td style="padding: 4px 0 4px 8px; width: 40px; text-align: right; color: #6b7280; font-size: 13px;">{{ $count }}</td>
                        </tr>
                    @endforeach
                </table>
            @endif

            <div style="border-top: 1px solid #e5e7eb; padding-top: 16px;">
                <table style="width: 100%; font-size: 14px;">
                    <tr>
                        <td style="padding: 4px 0; color: #6b7280;">Avis sans réponse</td>
                        <td style="padding: 4px 0; text-align: right; font-weight: 600; color: {{ ($stats['without_reply'] ?? 0) > 0 ? '#dc2626' : '#16a34a' }};">{{ $stats['without_reply'] ?? 0 }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 4px 0; color: #6b7280;">Taux de réponse</td>
                        <td style="padding: 4px 0; text-align: right; font-weight: 600; color: #374151;">{{ number_format($stats['reply_rate'] ?? 0, 0) }}%</td>
                    </tr>
                    <tr>
                        <td style="padding: 4px 0; color: #6b7280;">Avis négatifs (1-2★)</td>
                        <td style="padding: 4px 0; text-align: right; font-weight: 600; color: {{ ($stats['negative_count'] ?? 0) > 0 ? '#dc2626' : '#16a34a' }};">{{ $stats['negative_count'] ?? 0 }}</td>
                    </tr>
                </table>
            </div>
        </div>

        <div style="background: #f9fafb; padding: 16px 24px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                Envoyé par <a href="{{ config('app.frontend_url', 'https://www.reply-stack.app') }}" style="color: #6366f1;">ReplyStack</a>
            </p>
        </div>
    </div>
</body>
</html>
