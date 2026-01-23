<?php

namespace App\Services\Language;

/**
 * Service for detecting the language of text content.
 *
 * Uses a combination of character-based detection for non-Latin scripts
 * and word pattern matching for Latin-based languages.
 */
class LanguageDetectorService
{
    /**
     * Supported languages with their ISO 639-1 codes.
     */
    public const SUPPORTED_LANGUAGES = [
        'en', 'fr', 'es', 'de', 'it', 'pt', 'nl', // Latin-based
        'ja', 'zh', 'ko', // East Asian
        'ar', // Arabic
        'ru', // Cyrillic
    ];

    /**
     * Minimum confidence threshold for reliable detection.
     */
    private const MIN_CONFIDENCE_THRESHOLD = 0.15;

    /**
     * Default language when detection is uncertain.
     */
    private const DEFAULT_LANGUAGE = 'en';

    /**
     * Character ranges for non-Latin script detection.
     */
    private const SCRIPT_RANGES = [
        'ja' => [
            'hiragana' => '/[\x{3040}-\x{309F}]/u',
            'katakana' => '/[\x{30A0}-\x{30FF}]/u',
            'kanji' => '/[\x{4E00}-\x{9FAF}]/u',
        ],
        'zh' => [
            'hanzi' => '/[\x{4E00}-\x{9FFF}]/u',
            'extended' => '/[\x{3400}-\x{4DBF}]/u',
        ],
        'ko' => [
            'hangul' => '/[\x{AC00}-\x{D7AF}]/u',
            'jamo' => '/[\x{1100}-\x{11FF}]/u',
        ],
        'ar' => [
            'arabic' => '/[\x{0600}-\x{06FF}]/u',
            'extended' => '/[\x{0750}-\x{077F}]/u',
        ],
        'ru' => [
            'cyrillic' => '/[\x{0400}-\x{04FF}]/u',
        ],
    ];

    /**
     * Word patterns for Latin-based language detection.
     * Uses common stop words and characteristic words for each language.
     */
    private const WORD_PATTERNS = [
        'fr' => [
            'stopwords' => ['le', 'la', 'les', 'de', 'du', 'des', 'et', 'en', 'un', 'une', 'que', 'qui', 'est', 'dans', 'pour', 'pas', 'au', 'sur', 'ce', 'avec', 'ne', 'se', 'son', 'tout', 'plus', 'par', 'nous', 'vous', 'ils', 'mais', 'ou', 'comme', 'si', 'leur', 'donc', 'sans', 'bien', 'aussi', 'entre', 'peu', 'ont', 'ses', 'ces', 'aux', 'mes', 'tres', 'ete', 'fait', 'etre'],
            'characteristic' => ['merci', 'bonjour', 'beaucoup', 'toujours', 'jamais', 'peut', 'cette', 'quelque', 'seulement', 'cependant', 'vraiment', 'avons', 'avez', 'etait', 'etaient', 'notre', 'votre', 'leurs', 'cela', 'celle', 'celui', 'aujourd', 'depuis', 'pendant', 'encore', 'quand', 'comment', 'pourquoi', 'parce'],
        ],
        'en' => [
            'stopwords' => ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some'],
            'characteristic' => ['thank', 'thanks', 'great', 'awesome', 'wonderful', 'amazing', 'excellent', 'perfect', 'lovely', 'beautiful', 'delicious', 'friendly', 'helpful', 'definitely', 'recommend', 'experience', 'service', 'staff', 'place', 'food', 'hotel', 'room', 'clean', 'comfortable', 'location', 'price', 'value', 'worth', 'visit', 'again', 'back', 'next', 'always', 'never', 'nothing', 'everything', 'something', 'anything'],
        ],
        'es' => [
            'stopwords' => ['el', 'la', 'los', 'las', 'de', 'del', 'en', 'y', 'a', 'que', 'es', 'se', 'no', 'un', 'una', 'por', 'con', 'para', 'su', 'al', 'lo', 'como', 'mas', 'pero', 'sus', 'le', 'ya', 'o', 'fue', 'este', 'ha', 'si', 'porque', 'esta', 'son', 'entre', 'cuando', 'muy', 'sin', 'sobre', 'ser', 'tiene', 'tambien', 'me', 'hasta', 'hay', 'donde', 'han', 'quien', 'estan', 'estado'],
            'characteristic' => ['gracias', 'hola', 'bueno', 'buena', 'excelente', 'perfecto', 'increible', 'maravilloso', 'fantastico', 'estupendo', 'genial', 'recomiendo', 'definitivamente', 'siempre', 'nunca', 'todo', 'nada', 'algo', 'mucho', 'poco', 'mejor', 'peor', 'lugar', 'comida', 'servicio', 'personal', 'atencion', 'limpio', 'limpia', 'precio', 'calidad', 'volver', 'experiencia'],
        ],
        'de' => [
            'stopwords' => ['der', 'die', 'das', 'und', 'in', 'den', 'von', 'zu', 'mit', 'ist', 'nicht', 'sich', 'des', 'auf', 'fur', 'ein', 'eine', 'dem', 'als', 'auch', 'es', 'an', 'er', 'so', 'aus', 'bei', 'war', 'noch', 'wie', 'nach', 'am', 'nur', 'oder', 'aber', 'vor', 'zur', 'bis', 'mehr', 'durch', 'uber', 'seine', 'wenn', 'hat', 'werden', 'ihr', 'sind', 'sie', 'einem', 'dieser', 'einen', 'kann', 'haben', 'schon', 'vom'],
            'characteristic' => ['danke', 'sehr', 'gut', 'toll', 'super', 'wunderbar', 'ausgezeichnet', 'perfekt', 'fantastisch', 'herrlich', 'gerne', 'wieder', 'immer', 'empfehlen', 'freundlich', 'sauber', 'lecker', 'gemutlich', 'preis', 'leistung', 'qualitat', 'erfahrung', 'essen', 'zimmer', 'personal', 'bedienung', 'service', 'aufenthalt', 'urlaub', 'hotel'],
        ],
        'it' => [
            'stopwords' => ['il', 'la', 'lo', 'le', 'i', 'gli', 'di', 'da', 'in', 'a', 'e', 'che', 'non', 'un', 'una', 'per', 'con', 'su', 'si', 'come', 'ma', 'del', 'al', 'sono', 'era', 'anche', 'piu', 'questo', 'o', 'essere', 'suo', 'se', 'ci', 'ha', 'nel', 'tra', 'ho', 'hanno', 'tutti', 'della', 'dal', 'quello', 'stata', 'stato', 'degli', 'delle', 'alla'],
            'characteristic' => ['grazie', 'ottimo', 'ottima', 'perfetto', 'perfetta', 'bellissimo', 'bellissima', 'fantastico', 'meraviglioso', 'eccellente', 'buono', 'buona', 'bene', 'male', 'sempre', 'mai', 'molto', 'poco', 'tutto', 'niente', 'qualcosa', 'consiglio', 'raccomando', 'esperienza', 'servizio', 'personale', 'cibo', 'camera', 'pulito', 'pulita', 'prezzo', 'qualita', 'tornare'],
        ],
        'pt' => [
            'stopwords' => ['o', 'a', 'os', 'as', 'de', 'da', 'do', 'em', 'e', 'que', 'um', 'uma', 'para', 'com', 'nao', 'se', 'na', 'no', 'por', 'mais', 'como', 'mas', 'ao', 'ele', 'das', 'dos', 'tem', 'seu', 'sua', 'ou', 'quando', 'muito', 'nos', 'ja', 'eu', 'tambem', 'so', 'pelo', 'pela', 'ate', 'isso', 'ela', 'entre', 'depois', 'sem', 'mesmo', 'aos', 'ter', 'seus', 'quem', 'nas', 'me', 'esse', 'eles'],
            'characteristic' => ['obrigado', 'obrigada', 'otimo', 'otima', 'excelente', 'perfeito', 'perfeita', 'maravilhoso', 'maravilhosa', 'fantastico', 'fantastica', 'adorei', 'amei', 'recomendo', 'sempre', 'nunca', 'tudo', 'nada', 'algo', 'muito', 'pouco', 'melhor', 'pior', 'lugar', 'comida', 'servico', 'atendimento', 'limpo', 'limpa', 'preco', 'qualidade', 'voltar', 'experiencia'],
        ],
        'nl' => [
            'stopwords' => ['de', 'het', 'een', 'van', 'en', 'in', 'is', 'op', 'te', 'dat', 'die', 'voor', 'zijn', 'met', 'niet', 'aan', 'om', 'ook', 'als', 'maar', 'er', 'nog', 'uit', 'dan', 'bij', 'naar', 'of', 'door', 'al', 'kan', 'tot', 'werd', 'zou', 'wat', 'meer', 'over', 'ze', 'geen', 'nu', 'worden', 'waar', 'wel', 'hebben', 'deze', 'heb', 'heeft', 'had', 'ons', 'hem'],
            'characteristic' => ['dank', 'bedankt', 'goed', 'geweldig', 'fantastisch', 'uitstekend', 'perfect', 'heerlijk', 'lekker', 'mooi', 'fijn', 'gezellig', 'vriendelijk', 'schoon', 'netjes', 'prijs', 'kwaliteit', 'aanraden', 'aanbevelen', 'ervaring', 'service', 'personeel', 'eten', 'kamer', 'verblijf', 'vakantie', 'terugkomen', 'altijd', 'nooit', 'alles', 'niets', 'iets'],
        ],
    ];

    /**
     * Detect the language of the given text.
     *
     * @param string $text The text to analyze
     * @return LanguageDetectionResult
     */
    public function detect(string $text): LanguageDetectionResult
    {
        $text = trim($text);

        if (empty($text)) {
            return new LanguageDetectionResult(
                language: self::DEFAULT_LANGUAGE,
                confidence: 0.0,
                isReliable: false
            );
        }

        // First, check for non-Latin scripts (highest priority)
        $scriptResult = $this->detectByScript($text);
        if ($scriptResult !== null) {
            return $scriptResult;
        }

        // Then use word-based detection for Latin scripts
        return $this->detectByWords($text);
    }

    /**
     * Detect language by character script (for non-Latin languages).
     */
    private function detectByScript(string $text): ?LanguageDetectionResult
    {
        $totalChars = mb_strlen(preg_replace('/\s/', '', $text));
        if ($totalChars === 0) {
            return null;
        }

        $scriptScores = [];

        foreach (self::SCRIPT_RANGES as $lang => $patterns) {
            $matchedChars = 0;
            foreach ($patterns as $pattern) {
                preg_match_all($pattern, $text, $matches);
                $matchedChars += count($matches[0]);
            }

            if ($matchedChars > 0) {
                $scriptScores[$lang] = $matchedChars / $totalChars;
            }
        }

        if (empty($scriptScores)) {
            return null;
        }

        arsort($scriptScores);
        $topLang = array_key_first($scriptScores);
        $confidence = $scriptScores[$topLang];

        // Distinguish between Japanese and Chinese (both use kanji/hanzi)
        if (($topLang === 'zh' || $topLang === 'ja') && (isset($scriptScores['zh']) || isset($scriptScores['ja']))) {
            // Check for hiragana/katakana which are unique to Japanese
            preg_match_all('/[\x{3040}-\x{309F}]/u', $text, $hiraganaMatches);
            preg_match_all('/[\x{30A0}-\x{30FF}]/u', $text, $katakanaMatches);
            $japaneseKanaCount = count($hiraganaMatches[0]) + count($katakanaMatches[0]);

            if ($japaneseKanaCount > 0) {
                // Has Japanese kana, definitely Japanese
                $topLang = 'ja';
                $confidence = max($scriptScores['ja'] ?? 0, $confidence);
            } else {
                // No kana, assume Chinese
                $topLang = 'zh';
                $confidence = $scriptScores['zh'] ?? $confidence;
            }
        }

        // Script-based detection is highly reliable when confidence is high
        $isReliable = $confidence >= 0.3;

        return new LanguageDetectionResult(
            language: $topLang,
            confidence: $confidence,
            isReliable: $isReliable
        );
    }

    /**
     * Detect language by word patterns (for Latin-based languages).
     */
    private function detectByWords(string $text): LanguageDetectionResult
    {
        // Normalize text for matching
        $normalizedText = $this->normalizeText($text);
        $words = $this->extractWords($normalizedText);
        $totalWords = count($words);

        if ($totalWords === 0) {
            return new LanguageDetectionResult(
                language: self::DEFAULT_LANGUAGE,
                confidence: 0.0,
                isReliable: false
            );
        }

        $scores = [];

        foreach (self::WORD_PATTERNS as $lang => $patterns) {
            $stopwordMatches = 0;
            $characteristicMatches = 0;

            foreach ($words as $word) {
                if (in_array($word, $patterns['stopwords'])) {
                    $stopwordMatches++;
                }
                if (in_array($word, $patterns['characteristic'])) {
                    $characteristicMatches++;
                }
            }

            // Weight characteristic words more heavily
            $score = ($stopwordMatches + ($characteristicMatches * 2)) / ($totalWords * 1.5);
            $scores[$lang] = min($score, 1.0); // Cap at 1.0
        }

        arsort($scores);
        $topLang = array_key_first($scores);
        $confidence = $scores[$topLang] ?? 0.0;

        // Check if the detection is reliable
        $isReliable = $confidence >= self::MIN_CONFIDENCE_THRESHOLD && $totalWords >= 3;

        // If not reliable enough, check if there's a clear winner
        $sortedScores = array_values($scores);
        if (count($sortedScores) >= 2) {
            $margin = $sortedScores[0] - $sortedScores[1];
            $isReliable = $isReliable && $margin >= 0.05;
        }

        return new LanguageDetectionResult(
            language: $isReliable ? $topLang : self::DEFAULT_LANGUAGE,
            confidence: $confidence,
            isReliable: $isReliable,
            allScores: $scores
        );
    }

    /**
     * Normalize text for language detection.
     */
    private function normalizeText(string $text): string
    {
        // Convert to lowercase
        $text = mb_strtolower($text);

        // Remove accents for matching (keep original for display)
        $text = $this->removeAccents($text);

        // Remove punctuation except apostrophes
        $text = preg_replace('/[^\p{L}\p{N}\s\']/u', ' ', $text);

        // Normalize whitespace
        $text = preg_replace('/\s+/', ' ', $text);

        return trim($text);
    }

    /**
     * Remove accents from text.
     */
    private function removeAccents(string $text): string
    {
        $accents = [
            'à' => 'a', 'â' => 'a', 'ä' => 'a', 'á' => 'a', 'ã' => 'a',
            'è' => 'e', 'ê' => 'e', 'ë' => 'e', 'é' => 'e',
            'ì' => 'i', 'î' => 'i', 'ï' => 'i', 'í' => 'i',
            'ò' => 'o', 'ô' => 'o', 'ö' => 'o', 'ó' => 'o', 'õ' => 'o',
            'ù' => 'u', 'û' => 'u', 'ü' => 'u', 'ú' => 'u',
            'ç' => 'c', 'ñ' => 'n', 'ß' => 'ss',
        ];

        return strtr($text, $accents);
    }

    /**
     * Extract words from text.
     *
     * @return string[]
     */
    private function extractWords(string $text): array
    {
        $words = preg_split('/\s+/', $text);
        return array_filter($words, fn ($word) => mb_strlen($word) >= 2);
    }

    /**
     * Get the ISO language code (shortcut for detect()->language).
     */
    public function detectLanguageCode(string $text): string
    {
        return $this->detect($text)->language;
    }
}
