<?php

namespace App\Mail;

use App\Models\Review;
use App\Models\Location;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ReviewInstantAlertMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Review $review,
        public readonly Location $location
    ) {}

    public function envelope(): Envelope
    {
        $stars = str_repeat('★', $this->review->normalized_rating ?? $this->review->rating ?? 0);

        return new Envelope(
            subject: "[ReplyStack] Nouvel avis {$stars} - {$this->location->name}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.review-instant-alert',
        );
    }
}
