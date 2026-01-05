@extends('legal.layouts.legal')

@section('title', 'Politique des Cookies')
@section('link_legal', 'Mentions Légales')
@section('link_terms', 'Conditions d\'Utilisation')
@section('link_sales', 'Conditions de Vente')
@section('link_privacy', 'Politique de Confidentialité')
@section('link_cookies', 'Politique des Cookies')

@section('content')
<h1>Politique des Cookies</h1>
<p class="last-updated">{{ $translations['lastUpdated'] }}: {{ $lastUpdatedDate }}</p>

<div class="highlight-box">
    <strong>Résumé :</strong> ReplyStack utilise uniquement les cookies essentiels nécessaires au fonctionnement du service. Nous n'utilisons pas de cookies publicitaires ou de suivi.
</div>

<h2>1. Qu'est-ce qu'un Cookie ?</h2>
<p>Les cookies sont de petits fichiers texte qui sont stockés sur votre appareil (ordinateur, tablette ou smartphone) lorsque vous visitez un site web. Ils aident le site à mémoriser vos actions et préférences au fil du temps.</p>

<h2>2. Notre Politique de Cookies</h2>
<p>ReplyStack s'engage à respecter votre vie privée. Nous utilisons une approche minimaliste des cookies :</p>
<ul>
    <li>Nous utilisons uniquement des <strong>cookies strictement nécessaires</strong> au fonctionnement du service</li>
    <li>Nous <strong>n'utilisons pas</strong> de cookies publicitaires ou marketing</li>
    <li>Nous <strong>n'utilisons pas</strong> de cookies de suivi tiers</li>
    <li>Nous <strong>ne vendons pas</strong> les données collectées via les cookies</li>
</ul>

<h2>3. Cookies que Nous Utilisons</h2>

<h3>3.1 Cookies Essentiels</h3>
<p>Ces cookies sont nécessaires au fonctionnement du site et ne peuvent pas être désactivés.</p>

<table>
    <thead>
        <tr>
            <th>Nom du Cookie</th>
            <th>Finalité</th>
            <th>Durée</th>
            <th>Type</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>session</td>
            <td>Maintient votre session de connexion et la sécurité</td>
            <td>Session / 2 heures</td>
            <td>Première partie</td>
        </tr>
        <tr>
            <td>XSRF-TOKEN</td>
            <td>Protège contre les attaques de falsification de requêtes intersites</td>
            <td>Session / 2 heures</td>
            <td>Première partie</td>
        </tr>
        <tr>
            <td>remember_token</td>
            <td>Maintient votre connexion si vous choisissez "Se souvenir de moi"</td>
            <td>30 jours</td>
            <td>Première partie</td>
        </tr>
    </tbody>
</table>

<h3>3.2 Cookies Fonctionnels</h3>
<p>Ces cookies permettent des fonctionnalités personnalisées.</p>

<table>
    <thead>
        <tr>
            <th>Nom du Cookie</th>
            <th>Finalité</th>
            <th>Durée</th>
            <th>Type</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>locale</td>
            <td>Mémorise votre préférence de langue</td>
            <td>1 an</td>
            <td>Première partie</td>
        </tr>
        <tr>
            <td>theme</td>
            <td>Mémorise votre préférence de thème d'affichage (clair/sombre)</td>
            <td>1 an</td>
            <td>Première partie</td>
        </tr>
    </tbody>
</table>

<h3>3.3 Extension Navigateur</h3>
<p>L'extension navigateur ReplyStack utilise le stockage local (pas de cookies) pour :</p>
<ul>
    <li>Stocker votre jeton d'authentification de manière sécurisée</li>
    <li>Mettre en cache vos préférences pour un accès plus rapide</li>
    <li>Mémoriser vos derniers paramètres utilisés</li>
</ul>
<p>Ces données sont stockées localement dans votre navigateur et ne sont pas partagées avec des tiers.</p>

<h2>4. Cookies que Nous N'Utilisons PAS</h2>

<p>Pour être clair, ReplyStack <strong>n'utilise pas</strong> :</p>
<ul>
    <li><strong>Cookies publicitaires :</strong> Nous n'affichons pas de publicités et ne vous suivons pas à des fins publicitaires</li>
    <li><strong>Cookies d'analyse :</strong> Nous n'utilisons pas Google Analytics ou des outils d'analyse tiers similaires</li>
    <li><strong>Cookies de réseaux sociaux :</strong> Nous n'intégrons pas de suivi de réseaux sociaux</li>
    <li><strong>Cookies de suivi tiers :</strong> Nous n'autorisons pas les tiers à placer des cookies sur notre site</li>
</ul>

<h2>5. Services Tiers</h2>

<p>Lorsque vous utilisez certaines fonctionnalités, vous pouvez interagir avec des services tiers qui ont leurs propres politiques de cookies :</p>

<table>
    <thead>
        <tr>
            <th>Service</th>
            <th>Finalité</th>
            <th>Leur Politique de Cookies</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Lemon Squeezy</td>
            <td>Traitement des paiements</td>
            <td><a href="https://www.lemonsqueezy.com/privacy" target="_blank">Voir la Politique</a></td>
        </tr>
        <tr>
            <td>Google OAuth</td>
            <td>Connexion avec Google (optionnel)</td>
            <td><a href="https://policies.google.com/privacy" target="_blank">Voir la Politique</a></td>
        </tr>
    </tbody>
</table>

<p>Ces cookies tiers ne sont définis que lorsque vous utilisez explicitement ces services (par exemple, lors du paiement ou de la connexion OAuth).</p>

<h2>6. Gestion des Cookies</h2>

<h3>6.1 Paramètres du Navigateur</h3>
<p>Vous pouvez contrôler les cookies via les paramètres de votre navigateur :</p>
<ul>
    <li><strong>Chrome :</strong> Paramètres → Confidentialité et sécurité → Cookies</li>
    <li><strong>Firefox :</strong> Paramètres → Vie privée et sécurité → Cookies</li>
    <li><strong>Safari :</strong> Préférences → Confidentialité → Cookies</li>
    <li><strong>Edge :</strong> Paramètres → Cookies et autorisations de site</li>
</ul>

<h3>6.2 Impact de la Désactivation des Cookies</h3>
<p>Si vous désactivez les cookies essentiels :</p>
<ul>
    <li>Vous ne pourrez pas vous connecter à votre compte</li>
    <li>Les fonctionnalités de sécurité de session ne fonctionneront pas</li>
    <li>Le service pourrait ne pas fonctionner correctement</li>
</ul>

<h2>7. Consentement aux Cookies</h2>
<p>Selon le RGPD et les réglementations similaires, les cookies strictement nécessaires ne requièrent pas de consentement car ils sont essentiels au fonctionnement du service. Puisque ReplyStack n'utilise que des cookies essentiels :</p>
<ul>
    <li>Nous n'affichons pas de bannière de consentement aux cookies pour nos cookies essentiels</li>
    <li>En utilisant notre service, vous reconnaissez l'utilisation de ces cookies nécessaires</li>
    <li>Vous pouvez toujours gérer les cookies via les paramètres de votre navigateur</li>
</ul>

<h2>8. Protection des Données</h2>
<p>Les données des cookies sont traitées conformément à notre <a href="/privacy?lang=fr">Politique de Confidentialité</a>. Nous garantissons :</p>
<ul>
    <li>Tous les cookies sont transmis via HTTPS (chiffrés)</li>
    <li>Les cookies de session utilisent les drapeaux secure et httpOnly</li>
    <li>Les données des cookies ne sont pas partagées avec des tiers à des fins marketing</li>
</ul>

<h2>9. Modifications de cette Politique</h2>
<p>Nous pouvons mettre à jour cette Politique des Cookies de temps en temps. Les modifications seront publiées sur cette page avec une date de révision mise à jour. Nous vous informerons de tout changement important par email.</p>

<h2>10. Contact</h2>
<p>Si vous avez des questions sur notre utilisation des cookies :</p>
<ul>
    <li><strong>Email :</strong> <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
    <li><strong>Adresse :</strong> {{ $companyName }}, {{ $companyAddress }}</li>
</ul>
@endsection
