<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Contact Controller
 *
 * Handles contact form submissions from the website.
 */
class ContactController extends Controller
{
    /**
     * Send a contact message.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function send(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'reason' => ['required', 'string', 'in:support,sales,partnership,other'],
            'subject' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        try {
            // Log the contact request
            Log::info('Contact form submission', [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'reason' => $validated['reason'],
                'subject' => $validated['subject'],
            ]);

            // Send email notification
            Mail::raw($this->formatEmailContent($validated), function ($message) use ($validated) {
                $message->to(config('mail.contact_address', 'support@reply-stack.app'))
                    ->replyTo($validated['email'], $validated['name'])
                    ->subject("[ReplyStack Contact - {$validated['reason']}] {$validated['subject']}");
            });

            return response()->json([
                'message' => 'Message sent successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send contact email', [
                'error' => $e->getMessage(),
                'email' => $validated['email'],
            ]);

            return response()->json([
                'message' => 'Failed to send message. Please try again later.',
            ], 500);
        }
    }

    /**
     * Format the email content.
     *
     * @param array $data
     * @return string
     */
    private function formatEmailContent(array $data): string
    {
        $reasonLabels = [
            'support' => 'Support',
            'sales' => 'Sales',
            'partnership' => 'Partnership',
            'other' => 'Other',
        ];

        $reason = $reasonLabels[$data['reason']] ?? $data['reason'];

        return <<<EMAIL
New contact form submission from ReplyStack website.

----------------------------------------
From: {$data['name']} <{$data['email']}>
Reason: {$reason}
Subject: {$data['subject']}
----------------------------------------

Message:
{$data['message']}

----------------------------------------
Reply directly to this email to respond to {$data['name']}.
EMAIL;
    }
}
