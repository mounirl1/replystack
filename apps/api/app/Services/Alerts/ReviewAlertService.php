<?php

namespace App\Services\Alerts;

use App\Mail\ReviewInstantAlertMail;
use App\Mail\ReviewRecapMail;
use App\Models\Location;
use App\Models\Review;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ReviewAlertService
{
    /**
     * Send an instant alert for a negative review.
     */
    public function sendInstantAlert(Review $review): void
    {
        $location = $review->location;

        if (!$location || !$location->hasAlertsEnabled()) {
            return;
        }

        $rating = $review->normalized_rating ?? $review->rating;

        // Check if alert should fire based on star rating config
        $shouldAlert = match ($rating) {
            1 => $location->alert_on_1_star,
            2 => $location->alert_on_2_star,
            default => $rating <= $location->alert_negative_threshold,
        };

        if (!$shouldAlert) {
            return;
        }

        // Check if review is recent (within 24h)
        if ($review->published_at && $review->published_at->diffInHours(now()) > 24) {
            return;
        }

        // Cooldown check
        if (!$location->canSendReviewAlert()) {
            return;
        }

        // Send email
        if (!empty($location->alert_email)) {
            Mail::to($location->alert_email)
                ->send(new ReviewInstantAlertMail($review, $location));
        }

        $location->markReviewAlertSent();

        Log::info('Instant review alert sent', [
            'location_id' => $location->id,
            'review_id' => $review->id,
            'rating' => $rating,
        ]);
    }

    /**
     * Send a recap email for a location.
     */
    public function sendRecap(Location $location, string $since): void
    {
        $stats = $this->getRecapStats($location, $since);

        if ($stats['new_reviews'] === 0) {
            return;
        }

        $period = $this->formatPeriod($location->alert_recap_frequency);

        // Determine recipients
        $recipients = [];
        if (!empty($location->alert_recap_emails)) {
            $recipients = array_filter(array_map('trim', explode(';', $location->alert_recap_emails)));
        }
        if (empty($recipients) && !empty($location->alert_email)) {
            $recipients = [$location->alert_email];
        }

        if (empty($recipients)) {
            return;
        }

        Mail::to($recipients)
            ->send(new ReviewRecapMail($location, $stats, $period));

        Log::info('Review recap sent', [
            'location_id' => $location->id,
            'period' => $period,
            'new_reviews' => $stats['new_reviews'],
        ]);
    }

    /**
     * Get recap statistics for a location since a given date.
     */
    private function getRecapStats(Location $location, string $since): array
    {
        $stats = DB::table('reviews')
            ->where('location_id', $location->id)
            ->where('created_at', '>=', $since)
            ->selectRaw('
                COUNT(*) as new_reviews,
                AVG(normalized_rating) as avg_rating,
                COUNT(CASE WHEN normalized_rating = 1 THEN 1 END) as rating_1,
                COUNT(CASE WHEN normalized_rating = 2 THEN 1 END) as rating_2,
                COUNT(CASE WHEN normalized_rating = 3 THEN 1 END) as rating_3,
                COUNT(CASE WHEN normalized_rating = 4 THEN 1 END) as rating_4,
                COUNT(CASE WHEN normalized_rating = 5 THEN 1 END) as rating_5,
                COUNT(CASE WHEN reply IS NOT NULL AND reply != "" THEN 1 END) as with_reply,
                COUNT(CASE WHEN reply IS NULL OR reply = "" THEN 1 END) as without_reply,
                COUNT(CASE WHEN normalized_rating <= 2 THEN 1 END) as negative_count
            ')
            ->first();

        $newReviews = (int) $stats->new_reviews;
        $withReply = (int) $stats->with_reply;

        return [
            'new_reviews' => $newReviews,
            'avg_rating' => round((float) ($stats->avg_rating ?? 0), 2),
            'rating_distribution' => [
                1 => (int) $stats->rating_1,
                2 => (int) $stats->rating_2,
                3 => (int) $stats->rating_3,
                4 => (int) $stats->rating_4,
                5 => (int) $stats->rating_5,
            ],
            'with_reply' => $withReply,
            'without_reply' => (int) $stats->without_reply,
            'reply_rate' => $newReviews > 0 ? round(($withReply / $newReviews) * 100, 2) : 0,
            'negative_count' => (int) $stats->negative_count,
        ];
    }

    private function formatPeriod(string $frequency): string
    {
        return match ($frequency) {
            'daily' => 'Quotidien',
            'weekly' => 'Hebdomadaire',
            'monthly' => 'Mensuel',
            default => 'Récapitulatif',
        };
    }
}
