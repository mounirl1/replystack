<?php

namespace App\Mail;

use App\Models\Location;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ReviewRecapMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Location $location,
        public readonly array $stats,
        public readonly string $period
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "[ReplyStack] Récapitulatif avis ({$this->period}) - {$this->location->name}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.review-recap',
        );
    }
}
