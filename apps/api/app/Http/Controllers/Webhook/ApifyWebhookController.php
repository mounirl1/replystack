<?php

namespace App\Http\Controllers\Webhook;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessApifyResultsJob;
use App\Models\ApifyRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * ApifyWebhookController
 *
 * Handles webhook callbacks from Apify when actor runs complete.
 */
class ApifyWebhookController extends Controller
{
    /**
     * Handle Apify webhook event.
     *
     * POST /webhooks/apify
     */
    public function handle(Request $request): JsonResponse
    {
        $eventType = $request->input('eventType');
        $runId = $request->input('resource.id') ?? $request->input('runId');

        Log::info('Apify webhook received', [
            'event_type' => $eventType,
            'run_id' => $runId,
            'payload' => $request->all(),
        ]);

        if (empty($runId)) {
            Log::warning('Apify webhook missing run ID');
            return response()->json(['message' => 'Missing run ID'], 400);
        }

        // Find the corresponding ApifyRequest
        $apifyRequest = ApifyRequest::where('run_id', $runId)->first();

        if (!$apifyRequest) {
            Log::warning('Apify webhook for unknown run', ['run_id' => $runId]);
            // Still return 200 to prevent Apify from retrying
            return response()->json(['message' => 'Unknown run ID'], 200);
        }

        // Handle based on event type
        switch ($eventType) {
            case 'ACTOR.RUN.SUCCEEDED':
                $this->handleSuccess($apifyRequest);
                break;

            case 'ACTOR.RUN.FAILED':
                $this->handleFailure($apifyRequest, $request->input('resource.statusMessage'));
                break;

            case 'ACTOR.RUN.ABORTED':
                $this->handleAborted($apifyRequest);
                break;

            case 'ACTOR.RUN.TIMED_OUT':
                $this->handleTimeout($apifyRequest);
                break;

            default:
                Log::info('Apify webhook unhandled event', ['event_type' => $eventType]);
        }

        return response()->json(['message' => 'Webhook processed']);
    }

    /**
     * Handle successful run completion.
     */
    private function handleSuccess(ApifyRequest $apifyRequest): void
    {
        // Mark as processing (we'll fetch results now)
        $apifyRequest->markProcessing();

        // Dispatch job to fetch and process results
        ProcessApifyResultsJob::dispatch($apifyRequest);

        Log::info('Apify run succeeded, dispatching result processing', [
            'apify_request_id' => $apifyRequest->id,
            'run_id' => $apifyRequest->run_id,
        ]);
    }

    /**
     * Handle failed run.
     */
    private function handleFailure(ApifyRequest $apifyRequest, ?string $statusMessage): void
    {
        $errorMessage = $statusMessage ?? 'Actor run failed';

        $apifyRequest->markFailed($errorMessage);

        // Also release sync lock on connection
        $connection = $apifyRequest->reviewConnection;
        if ($connection) {
            $connection->markSyncFailed($errorMessage);
        }

        Log::error('Apify run failed', [
            'apify_request_id' => $apifyRequest->id,
            'run_id' => $apifyRequest->run_id,
            'error' => $errorMessage,
        ]);
    }

    /**
     * Handle aborted run.
     */
    private function handleAborted(ApifyRequest $apifyRequest): void
    {
        $apifyRequest->markFailed('Actor run was aborted');

        $connection = $apifyRequest->reviewConnection;
        if ($connection) {
            $connection->markSyncFailed('Scraping was aborted');
        }

        Log::warning('Apify run aborted', [
            'apify_request_id' => $apifyRequest->id,
            'run_id' => $apifyRequest->run_id,
        ]);
    }

    /**
     * Handle timed out run.
     */
    private function handleTimeout(ApifyRequest $apifyRequest): void
    {
        $apifyRequest->markFailed('Actor run timed out');

        $connection = $apifyRequest->reviewConnection;
        if ($connection) {
            $connection->markSyncFailed('Scraping timed out');
        }

        Log::warning('Apify run timed out', [
            'apify_request_id' => $apifyRequest->id,
            'run_id' => $apifyRequest->run_id,
        ]);
    }
}
