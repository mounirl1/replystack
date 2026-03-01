<?php

namespace App\Http\Requests\Auth;

use App\Rules\TurnstileRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

/**
 * Request validation for user registration.
 *
 * @property string $email
 * @property string $password
 * @property string $password_confirmation
 * @property string|null $name
 * @property string|null $cf_turnstile_response
 */
class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [
            'email' => [
                'required',
                'string',
                'email:rfc',
                'max:255',
                'unique:users,email',
            ],
            'password' => [
                'required',
                'string',
                'confirmed',
                Password::min(8)
                    ->mixedCase()
                    ->numbers(),
            ],
            'name' => [
                'nullable',
                'string',
                'max:255',
            ],
        ];

        // Require Turnstile token unless request comes from browser extension
        if (!$this->isFromExtension()) {
            $rules['cf_turnstile_response'] = ['required', 'string', new TurnstileRule()];
        }

        return $rules;
    }

    /**
     * Check if the request originates from the ReplyStack browser extension.
     *
     * Validates against configured extension IDs to prevent Origin header spoofing.
     */
    protected function isFromExtension(): bool
    {
        $origin = $this->header('Origin', '');

        $chromeId = config('services.extension.chrome_id');
        $firefoxId = config('services.extension.firefox_id');

        if ($chromeId && $origin === "chrome-extension://{$chromeId}") {
            return true;
        }

        if ($firefoxId && $origin === "moz-extension://{$firefoxId}") {
            return true;
        }

        return false;
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'email.required' => 'L\'adresse email est requise.',
            'email.email' => 'L\'adresse email doit être valide.',
            'email.unique' => 'Cette adresse email est déjà utilisée.',
            'password.required' => 'Le mot de passe est requis.',
            'password.confirmed' => 'La confirmation du mot de passe ne correspond pas.',
            'password.min' => 'Le mot de passe doit contenir au moins 8 caractères.',
            'cf_turnstile_response.required' => 'Please complete the CAPTCHA verification.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'email' => 'adresse email',
            'password' => 'mot de passe',
            'name' => 'nom',
            'cf_turnstile_response' => 'CAPTCHA',
        ];
    }
}
