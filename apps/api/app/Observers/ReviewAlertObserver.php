<?php

namespace App\Observers;

use App\Models\Review;
use App\Services\Monitoring\AlertService;
use App\Services\Sentiment\NegativeTrendService;
use Illuminate\Support\Facades\Log;

/**
 * Observer for sending alerts when critical reviews are received.
 */
class ReviewAlertObserver
{
    public function __construct(
        private readonly NegativeTrendService $trendService,
        private readonly AlertService $alertService
    ) {}

    /**
     * Handle the Review "created" event.
     */
    public function created(Review $review): void
    {
        $this->checkForImmediateAlert($review);
    }

    /**
     * Handle the Review "updated" event.
     *
     * Check for alerts if rating was updated to a low value.
     */
    public function updated(Review $review): void
    {
        // Only check if rating was changed
        if ($review->wasChanged('rating')) {
            $this->checkForImmediateAlert($review);
        }
    }

    /**
     * Check if an immediate alert should be sent for this review.
     */
    private function checkForImmediateAlert(Review $review): void
    {
        try {
            if ($this->trendService->shouldSendImmediateAlert($review)) {
                $this->alertService->sendCriticalReviewAlert($review);

                Log::info('ReviewAlertObserver: Immediate alert sent', [
                    'review_id' => $review->id,
                    'location_id' => $review->location_id,
                    'rating' => $review->rating,
                    'platform' => $review->platform,
                ]);
            }
        } catch (\Exception $e) {
            Log::error('ReviewAlertObserver: Failed to send alert', [
                'review_id' => $review->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
