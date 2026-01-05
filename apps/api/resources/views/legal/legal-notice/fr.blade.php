@extends('legal.layouts.legal')

@section('title', 'Mentions Légales')
@section('link_legal', 'Mentions Légales')
@section('link_terms', 'Conditions d\'Utilisation')
@section('link_sales', 'Conditions de Vente')
@section('link_privacy', 'Politique de Confidentialité')
@section('link_cookies', 'Politique des Cookies')

@section('content')
<h1>Mentions Légales</h1>
<p class="last-updated">{{ $translations['lastUpdated'] }}: {{ $lastUpdatedDate }}</p>

<h2>1. Éditeur du Site</h2>
<p>Ce site est édité par :</p>
<ul>
    <li><strong>Raison Sociale :</strong> {{ $companyName }}</li>
    <li><strong>Nom Commercial :</strong> {{ $commercialName }}</li>
    <li><strong>Forme Juridique :</strong> {{ $companyForm }} (Société Anonyme de droit marocain)</li>
    <li><strong>ICE (Identifiant Commun de l'Entreprise) :</strong> {{ $companyId }}</li>
    <li><strong>Siège Social :</strong> {{ $companyAddress }}</li>
    <li><strong>Email :</strong> <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
</ul>

<h2>2. Directeur de la Publication</h2>
<p>Le Directeur de la Publication responsable du contenu de ce site est :</p>
<ul>
    <li><strong>Nom :</strong> {{ $directorName }}</li>
    <li><strong>Fonction :</strong> {{ $directorTitle }}</li>
    <li><strong>Contact :</strong> <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
</ul>

<h2>3. Hébergement</h2>
<p>Ce site est hébergé par :</p>

<h3>3.1 API (Backend)</h3>
<ul>
    <li><strong>Hébergeur :</strong> Railway Corporation</li>
    <li><strong>Adresse :</strong> 548 Market St, PMB 65883, San Francisco, CA 94104, USA</li>
    <li><strong>Site web :</strong> <a href="https://railway.app" target="_blank">railway.app</a></li>
</ul>

<h3>3.2 Application Web (Frontend)</h3>
<ul>
    <li><strong>Hébergeur :</strong> Vercel Inc.</li>
    <li><strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</li>
    <li><strong>Site web :</strong> <a href="https://vercel.com" target="_blank">vercel.com</a></li>
</ul>

<h2>4. Propriété Intellectuelle</h2>

<h3>4.1 Marques</h3>
<p>ReplyStack® et le logo ReplyStack sont des marques déposées de {{ $companyName }}. Toute reproduction, imitation ou utilisation non autorisée de ces marques est interdite.</p>

<h3>4.2 Contenu du Site</h3>
<p>Tout le contenu de ce site (textes, images, graphiques, logos, icônes, sons, logiciels, etc.) est la propriété exclusive de {{ $companyName }} ou de ses partenaires et est protégé par les lois sur la propriété intellectuelle.</p>
<p>Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments du site est interdite sans autorisation écrite préalable de {{ $companyName }}.</p>

<h3>4.3 Logiciel</h3>
<p>La plateforme ReplyStack, y compris l'application web et l'extension navigateur, est un logiciel propriétaire. Le code source, les algorithmes et la technologie sous-jacente sont protégés par les droits de propriété intellectuelle.</p>

<h2>5. Contenu Généré par les Utilisateurs</h2>
<p>Les utilisateurs peuvent générer du contenu via le Service (comme des réponses générées par IA). Les utilisateurs conservent les droits sur leur contenu original mais accordent à {{ $companyName }} une licence pour traiter ce contenu aux fins de fourniture du service, comme décrit dans nos Conditions d'Utilisation.</p>

<h2>6. Limitation de Responsabilité</h2>

<h3>6.1 Informations du Site</h3>
<p>{{ $companyName }} s'efforce d'assurer l'exactitude et l'actualité des informations disponibles sur ce site. Cependant, nous ne pouvons garantir l'exactitude, l'exhaustivité ou l'actualité des informations fournies. Nous nous réservons le droit de modifier le contenu à tout moment sans préavis.</p>

<h3>6.2 Liens Externes</h3>
<p>Ce site peut contenir des liens vers des sites tiers. {{ $companyName }} n'a aucun contrôle sur le contenu de ces sites externes et décline toute responsabilité quant à leur contenu, y compris les produits, services ou informations qu'ils peuvent offrir.</p>

<h3>6.3 Contenu Généré par IA</h3>
<p>Les réponses générées par l'intelligence artificielle de ReplyStack sont uniquement des suggestions. Les utilisateurs sont seuls responsables de la révision et de l'approbation de tout contenu avant publication. {{ $companyName }} n'est pas responsable des conséquences de la publication de contenu généré par IA.</p>

<h2>7. Droit Applicable</h2>
<p>Ce site et son contenu sont régis par les lois du Royaume du Maroc. Tout litige relatif à l'utilisation de ce site sera soumis à la compétence exclusive des tribunaux de Marrakech, Maroc.</p>

<h2>8. Protection des Données</h2>
<p>Les données personnelles collectées via ce site sont traitées conformément aux lois applicables sur la protection des données, notamment :</p>
<ul>
    <li>La Loi marocaine 09-08 relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel</li>
    <li>Le Règlement Général sur la Protection des Données (RGPD) de l'UE pour les utilisateurs européens</li>
    <li>Le California Consumer Privacy Act (CCPA) pour les résidents de Californie</li>
    <li>La Lei Geral de Proteção de Dados (LGPD) du Brésil pour les utilisateurs brésiliens</li>
</ul>
<p>Pour plus d'informations, veuillez consulter notre <a href="/privacy?lang=fr">Politique de Confidentialité</a>.</p>

<h2>9. Accessibilité</h2>
<p>Nous nous efforçons de rendre notre site accessible à tous les utilisateurs. Si vous rencontrez des problèmes d'accessibilité, veuillez nous contacter à <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a>.</p>

<h2>10. Crédits</h2>
<p>Conception et développement du site : {{ $companyName }}</p>

<h2>11. Contact</h2>
<p>Pour toute question concernant ces mentions légales :</p>
<ul>
    <li><strong>Email :</strong> <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
    <li><strong>Adresse :</strong> {{ $companyName }}, {{ $companyAddress }}</li>
</ul>
@endsection
