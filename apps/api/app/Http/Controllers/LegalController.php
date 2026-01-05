<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class LegalController extends Controller
{
    protected array $supportedLocales = ['fr', 'en', 'es', 'it', 'pt'];
    protected string $defaultLocale = 'en';

    protected function getLocale(Request $request): string
    {
        // 1. Check URL parameter ?lang=xx
        $lang = $request->query('lang');
        if ($lang && in_array($lang, $this->supportedLocales)) {
            return $lang;
        }

        // 2. Check Accept-Language header
        $browserLang = substr($request->header('Accept-Language', 'en'), 0, 2);
        if (in_array($browserLang, $this->supportedLocales)) {
            return $browserLang;
        }

        return $this->defaultLocale;
    }

    protected function getCommonData(string $locale): array
    {
        $translations = [
            'fr' => [
                'backToHome' => 'Retour à l\'accueil',
                'lastUpdated' => 'Dernière mise à jour',
                'allRightsReserved' => 'Tous droits réservés',
            ],
            'en' => [
                'backToHome' => 'Back to home',
                'lastUpdated' => 'Last updated',
                'allRightsReserved' => 'All rights reserved',
            ],
            'es' => [
                'backToHome' => 'Volver al inicio',
                'lastUpdated' => 'Última actualización',
                'allRightsReserved' => 'Todos los derechos reservados',
            ],
            'it' => [
                'backToHome' => 'Torna alla home',
                'lastUpdated' => 'Ultimo aggiornamento',
                'allRightsReserved' => 'Tutti i diritti riservati',
            ],
            'pt' => [
                'backToHome' => 'Voltar ao início',
                'lastUpdated' => 'Última atualização',
                'allRightsReserved' => 'Todos os direitos reservados',
            ],
        ];

        return [
            'locale' => $locale,
            'supportedLocales' => $this->supportedLocales,
            'companyName' => 'Techcorp informatique et communication',
            'commercialName' => 'ReplyStack',
            'companyForm' => 'SA',
            'companyId' => '003689600000091',
            'companyAddress' => 'Marrakech, Morocco',
            'directorName' => 'Mounir LAKHFIF',
            'directorTitle' => $locale === 'fr' ? 'Président' : ($locale === 'es' ? 'Presidente' : ($locale === 'it' ? 'Presidente' : ($locale === 'pt' ? 'Presidente' : 'President'))),
            'contactEmail' => 'contact@replystack.io',
            'supportEmail' => 'msl.innov@gmail.com',
            'lastUpdatedDate' => '2025-01-05',
            'translations' => $translations[$locale] ?? $translations['en'],
        ];
    }

    public function privacy(Request $request)
    {
        $locale = $this->getLocale($request);
        return view("legal.privacy.{$locale}", $this->getCommonData($locale));
    }

    public function terms(Request $request)
    {
        $locale = $this->getLocale($request);
        return view("legal.terms.{$locale}", $this->getCommonData($locale));
    }

    public function sales(Request $request)
    {
        $locale = $this->getLocale($request);
        return view("legal.sales.{$locale}", $this->getCommonData($locale));
    }

    public function cookies(Request $request)
    {
        $locale = $this->getLocale($request);
        return view("legal.cookies.{$locale}", $this->getCommonData($locale));
    }

    public function legalNotice(Request $request)
    {
        $locale = $this->getLocale($request);
        return view("legal.legal-notice.{$locale}", $this->getCommonData($locale));
    }
}