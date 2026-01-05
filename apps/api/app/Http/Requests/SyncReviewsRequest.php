<?php

namespace App\Http\Requests;

use App\Models\Location;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SyncReviewsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $locationId = $this->input('location_id');

        if (!$locationId) {
            return false;
        }

        $location = Location::find($locationId);

        if (!$location) {
            return false;
        }

        $user = $this->user();

        // Check if user owns the location or is in the same organization
        return $location->user_id === $user->id
            || ($location->organization_id && $location->organization_id === $user->organization_id);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'location_id' => ['required', 'integer', 'exists:locations,id'],
            'platform' => [
                'required',
                'string',
                Rule::in(['google', 'tripadvisor', 'booking', 'yelp', 'facebook', 'g2', 'capterra', 'trustpilot']),
            ],
            'reviews' => ['required', 'array', 'max:100'],
            'reviews.*.external_id' => ['required', 'string', 'max:255'],
            'reviews.*.author_name' => ['required', 'string', 'max:255'],
            'reviews.*.rating' => ['required', 'integer', 'between:1,5'],
            'reviews.*.content' => ['required', 'string'],
            'reviews.*.published_at' => ['required', 'date'],
            'reviews.*.has_response' => ['nullable', 'boolean'],
        ];
    }

    /**
     * Get custom messages for validation errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'location_id.required' => 'L\'établissement est requis.',
            'location_id.exists' => 'L\'établissement n\'existe pas.',
            'platform.required' => 'La plateforme est requise.',
            'platform.in' => 'Plateforme invalide.',
            'reviews.required' => 'Au moins un avis est requis.',
            'reviews.max' => 'Maximum 100 avis par synchronisation.',
            'reviews.*.external_id.required' => 'L\'identifiant de l\'avis est requis.',
            'reviews.*.author_name.required' => 'Le nom de l\'auteur est requis.',
            'reviews.*.rating.required' => 'La note est requise.',
            'reviews.*.rating.between' => 'La note doit être entre 1 et 5.',
            'reviews.*.content.required' => 'Le contenu de l\'avis est requis.',
            'reviews.*.published_at.required' => 'La date de publication est requise.',
            'reviews.*.published_at.date' => 'La date de publication est invalide.',
        ];
    }
}
