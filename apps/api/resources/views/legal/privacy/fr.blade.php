@extends('legal.layouts.legal')

@section('title', 'Politique de Confidentialité')
@section('link_legal', 'Mentions Légales')
@section('link_terms', 'Conditions d\'Utilisation')
@section('link_sales', 'Conditions de Vente')
@section('link_privacy', 'Politique de Confidentialité')
@section('link_cookies', 'Politique des Cookies')

@section('content')
<h1>Politique de Confidentialité</h1>
<p class="last-updated">{{ $translations['lastUpdated'] }}: {{ $lastUpdatedDate }}</p>

<div class="highlight-box">
    <strong>Notre Engagement :</strong> Chez ReplyStack, nous nous engageons à protéger votre vie privée et vos données personnelles. Cette politique explique comment nous collectons, utilisons et protégeons vos informations conformément au RGPD (UE), CCPA (Californie), LGPD (Brésil) et à la Loi marocaine 09-08.
</div>

<h2>1. Responsable du Traitement</h2>
<p>Le responsable du traitement de vos données personnelles est :</p>
<ul>
    <li><strong>Société :</strong> {{ $companyName }}</li>
    <li><strong>Forme Juridique :</strong> {{ $companyForm }} (Droit Marocain)</li>
    <li><strong>ICE :</strong> {{ $companyId }}</li>
    <li><strong>Adresse :</strong> {{ $companyAddress }}</li>
    <li><strong>Email :</strong> <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
    <li><strong>Représentant :</strong> {{ $directorName }}, {{ $directorTitle }}</li>
</ul>

<h2>2. Champ d'Application</h2>
<p>Cette Politique de Confidentialité s'applique à :</p>
<ul>
    <li>Le site web et l'application web ReplyStack</li>
    <li>Le tableau de bord ReplyStack</li>
    <li>L'extension navigateur ReplyStack pour Chrome et Firefox</li>
    <li>Tous les services et communications associés</li>
</ul>

<h2>3. Données Collectées</h2>

<h3>3.1 Informations de Compte</h3>
<ul>
    <li>Adresse email</li>
    <li>Nom (optionnel)</li>
    <li>Mot de passe (stocké sous forme de hash sécurisé, jamais en clair)</li>
    <li>Plan et statut d'abonnement</li>
</ul>

<h3>3.2 Données de Profil Entreprise</h3>
<ul>
    <li>Nom de l'établissement</li>
    <li>Secteur d'activité</li>
    <li>Adresse (optionnelle)</li>
    <li>Préférences de réponse (ton, langue, signature)</li>
</ul>

<h3>3.3 Données des Avis Clients</h3>
<ul>
    <li>Contenu des avis, auteurs, notes et dates des plateformes connectées</li>
    <li>Réponses générées par IA</li>
    <li>Historique des réponses et analytiques</li>
</ul>

<h3>3.4 OAuth et Connexions aux Plateformes</h3>
<ul>
    <li>Tokens OAuth pour Google Business Profile et Facebook (chiffrés au repos)</li>
    <li>Identifiants de plateforme pour les comptes connectés</li>
</ul>

<h3>3.5 Données d'Utilisation</h3>
<ul>
    <li>Fichiers journaux (adresse IP, type de navigateur, heures d'accès)</li>
    <li>Statistiques d'utilisation des fonctionnalités</li>
    <li>Préférences et paramètres</li>
</ul>

<h3>3.6 Informations de Paiement</h3>
<ul>
    <li>Les informations de facturation sont traitées par notre prestataire de paiement (Lemon Squeezy)</li>
    <li>Nous ne stockons PAS les numéros de carte bancaire ni les coordonnées bancaires</li>
</ul>

<h3>3.7 Données de l'Extension Navigateur</h3>
<ul>
    <li>Données d'avis des plateformes supportées (Google Business, TripAdvisor, etc.)</li>
    <li>L'extension ne fonctionne que sur les pages des plateformes d'avis supportées</li>
    <li>Nous ne suivons pas votre activité de navigation générale</li>
</ul>

<h2>4. Comment Nous Utilisons Vos Données</h2>
<table>
    <thead>
        <tr>
            <th>Finalité</th>
            <th>Base Légale</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Fourniture du service ReplyStack (génération de réponses IA, agrégation d'avis)</td>
            <td>Exécution du contrat</td>
        </tr>
        <tr>
            <td>Gestion de votre compte utilisateur</td>
            <td>Exécution du contrat</td>
        </tr>
        <tr>
            <td>Traitement des paiements et facturation</td>
            <td>Exécution du contrat / Obligation légale</td>
        </tr>
        <tr>
            <td>Envoi d'emails transactionnels (compte, facturation, sécurité)</td>
            <td>Exécution du contrat</td>
        </tr>
        <tr>
            <td>Amélioration de nos services par l'analyse</td>
            <td>Intérêt légitime</td>
        </tr>
        <tr>
            <td>Sécurité et prévention de la fraude</td>
            <td>Intérêt légitime / Obligation légale</td>
        </tr>
        <tr>
            <td>Communications marketing</td>
            <td>Consentement (opt-in)</td>
        </tr>
    </tbody>
</table>

<h2>5. Destinataires et Sous-traitants</h2>
<p>Nous partageons vos données avec les prestataires de services suivants :</p>
<table>
    <thead>
        <tr>
            <th>Destinataire</th>
            <th>Finalité</th>
            <th>Localisation</th>
            <th>Garanties</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Anthropic, PBC</td>
            <td>Génération de réponses IA</td>
            <td>USA</td>
            <td>DPF, CCT</td>
        </tr>
        <tr>
            <td>Railway, Inc.</td>
            <td>Hébergement API</td>
            <td>USA</td>
            <td>DPF, CCT</td>
        </tr>
        <tr>
            <td>Vercel Inc.</td>
            <td>Hébergement Frontend</td>
            <td>USA</td>
            <td>DPF, CCT</td>
        </tr>
        <tr>
            <td>Lemon Squeezy, LLC</td>
            <td>Traitement des paiements</td>
            <td>USA</td>
            <td>DPF, CCT, PCI-DSS</td>
        </tr>
        <tr>
            <td>Google LLC</td>
            <td>OAuth (si connecté)</td>
            <td>USA</td>
            <td>DPF, CCT</td>
        </tr>
        <tr>
            <td>Meta Platforms, Inc.</td>
            <td>OAuth (si connecté)</td>
            <td>USA</td>
            <td>DPF, CCT</td>
        </tr>
    </tbody>
</table>
<p><small>DPF = Data Privacy Framework UE-USA ; CCT = Clauses Contractuelles Types</small></p>

<h2>6. Transferts Internationaux de Données</h2>
<p>Vos données peuvent être transférées et traitées aux États-Unis. Nous assurons une protection adéquate par :</p>
<ul>
    <li>La certification Data Privacy Framework UE-USA de nos sous-traitants</li>
    <li>Les Clauses Contractuelles Types (CCT) approuvées par la Commission Européenne</li>
    <li>Votre consentement explicite à ces transferts lors de la création de votre compte</li>
</ul>

<h2>7. Conservation des Données</h2>
<table>
    <thead>
        <tr>
            <th>Type de Données</th>
            <th>Durée de Conservation</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Données de compte</td>
            <td>Durée de l'abonnement + 3 ans</td>
        </tr>
        <tr>
            <td>Avis et réponses</td>
            <td>Durée de l'abonnement + 1 an</td>
        </tr>
        <tr>
            <td>Tokens OAuth</td>
            <td>Jusqu'à déconnexion ou expiration</td>
        </tr>
        <tr>
            <td>Journaux serveur</td>
            <td>12 mois</td>
        </tr>
        <tr>
            <td>Documents de facturation</td>
            <td>10 ans (obligation légale)</td>
        </tr>
    </tbody>
</table>

<h2>8. Vos Droits</h2>

<h3>8.1 Droits pour Tous les Utilisateurs</h3>
<ul>
    <li><strong>Droit d'accès :</strong> Demander une copie de vos données personnelles</li>
    <li><strong>Droit de rectification :</strong> Corriger les données inexactes ou incomplètes</li>
    <li><strong>Droit à l'effacement :</strong> Demander la suppression de vos données ("droit à l'oubli")</li>
    <li><strong>Droit à la portabilité :</strong> Recevoir vos données dans un format structuré</li>
    <li><strong>Droit d'opposition :</strong> Vous opposer à certains traitements</li>
    <li><strong>Droit de retrait du consentement :</strong> Retirer votre consentement à tout moment</li>
</ul>

<div class="jurisdiction-notice">
    <h3>8.2 Droits Supplémentaires pour les Résidents UE/EEE (RGPD)</h3>
    <ul>
        <li>Droit de déposer une plainte auprès de votre Autorité de Protection des Données locale</li>
        <li>Droit à la limitation du traitement</li>
        <li>Droit de ne pas faire l'objet d'une décision automatisée</li>
    </ul>
</div>

<div class="jurisdiction-notice">
    <h3>8.3 Droits Supplémentaires pour les Résidents de Californie (CCPA)</h3>
    <ul>
        <li>Droit de savoir quelles informations personnelles sont collectées, utilisées et partagées</li>
        <li>Droit de supprimer les informations personnelles</li>
        <li>Droit de refuser la vente d'informations personnelles (Note : Nous ne vendons PAS de données personnelles)</li>
        <li>Droit à la non-discrimination pour l'exercice de vos droits</li>
    </ul>
</div>

<div class="jurisdiction-notice">
    <h3>8.4 Droits Supplémentaires pour les Résidents du Brésil (LGPD)</h3>
    <ul>
        <li>Droit à l'information sur le partage des données avec des tiers</li>
        <li>Droit à l'anonymisation, au blocage ou à la suppression des données excessives</li>
        <li>Droit de révoquer le consentement</li>
    </ul>
</div>

<h3>8.5 Comment Exercer Vos Droits</h3>
<p>Pour exercer l'un de ces droits, contactez-nous à : <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></p>
<p>Nous répondrons dans les 30 jours suivant la réception de votre demande.</p>

<h2>9. Cookies</h2>
<p>Nous utilisons des cookies essentiels pour l'authentification et la sécurité. Pour plus d'informations, veuillez consulter notre <a href="/cookies?lang=fr">Politique des Cookies</a>.</p>

<h2>10. Mesures de Sécurité</h2>
<p>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :</p>
<ul>
    <li>Chiffrement des données sensibles au repos (AES-256)</li>
    <li>Chiffrement HTTPS pour toutes les données en transit</li>
    <li>Tokens OAuth chiffrés au repos</li>
    <li>Mots de passe hachés avec bcrypt</li>
    <li>Audits de sécurité réguliers</li>
    <li>Contrôles d'accès et journalisation</li>
    <li>Formation des employés à la protection des données</li>
</ul>

<h2>11. Confidentialité de l'Extension Navigateur</h2>
<p>L'extension navigateur ReplyStack :</p>
<ul>
    <li>Ne s'active que sur les plateformes d'avis supportées (Google Business, TripAdvisor, etc.)</li>
    <li>Ne suit PAS votre activité de navigation générale</li>
    <li>Ne collecte PAS de données des pages en dehors des plateformes supportées</li>
    <li>Ne demande des permissions que pour son fonctionnement (stockage, onglet actif sur les sites d'avis)</li>
    <li>Traite les données d'avis localement avant synchronisation avec votre compte</li>
</ul>

<h2>12. Protection des Mineurs</h2>
<p>ReplyStack n'est pas destiné aux utilisateurs de moins de 18 ans. Nous ne collectons pas sciemment de données personnelles d'enfants. Si vous pensez que nous avons collecté des données d'un mineur, veuillez nous contacter immédiatement.</p>

<h2>13. Modifications de cette Politique</h2>
<p>Nous pouvons mettre à jour cette Politique de Confidentialité de temps en temps. Nous :</p>
<ul>
    <li>Vous notifierons par email des modifications importantes</li>
    <li>Fournirons un préavis de 30 jours avant l'entrée en vigueur des modifications</li>
    <li>Mettrons à jour la date de "Dernière mise à jour" en haut de cette page</li>
</ul>

<h2>14. Contact et Réclamations</h2>
<p>Pour toute question ou réclamation concernant cette politique ou nos pratiques en matière de données :</p>
<ul>
    <li><strong>Email :</strong> <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
    <li><strong>Adresse :</strong> {{ $companyName }}, {{ $companyAddress }}</li>
</ul>

<p>Vous pouvez également contacter l'autorité de contrôle compétente :</p>
<ul>
    <li><strong>UE :</strong> Votre Autorité de Protection des Données locale</li>
    <li><strong>Maroc :</strong> CNDP (Commission Nationale de contrôle de la protection des Données à caractère personnel)</li>
    <li><strong>Californie :</strong> Procureur Général de Californie</li>
    <li><strong>Brésil :</strong> ANPD (Autoridade Nacional de Proteção de Dados)</li>
</ul>
@endsection
