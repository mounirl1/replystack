@extends('legal.layouts.legal')

@section('title', 'Conditions d\'Utilisation')
@section('link_legal', 'Mentions Légales')
@section('link_terms', 'Conditions d\'Utilisation')
@section('link_sales', 'Conditions de Vente')
@section('link_privacy', 'Politique de Confidentialité')
@section('link_cookies', 'Politique des Cookies')

@section('content')
<h1>Conditions d'Utilisation</h1>
<p class="last-updated">{{ $translations['lastUpdated'] }}: {{ $lastUpdatedDate }}</p>

<div class="highlight-box">
    <strong>Important :</strong> En utilisant ReplyStack, vous acceptez ces Conditions d'Utilisation. Veuillez les lire attentivement avant d'utiliser nos services.
</div>

<h2>1. Définitions</h2>
<ul>
    <li><strong>"ReplyStack"</strong>, <strong>"nous"</strong>, <strong>"notre"</strong>, <strong>"nos"</strong> : {{ $companyName }}, une {{ $companyForm }} enregistrée sous le droit marocain, ICE {{ $companyId }}.</li>
    <li><strong>"Service"</strong> : La plateforme ReplyStack incluant l'application web, le tableau de bord, l'extension navigateur et toutes les fonctionnalités associées.</li>
    <li><strong>"Utilisateur"</strong>, <strong>"vous"</strong>, <strong>"votre"</strong>, <strong>"vos"</strong> : Toute personne physique ou morale utilisant le Service.</li>
    <li><strong>"Contenu"</strong> : Tous les textes, données, informations, avis, réponses et matériaux téléchargés, générés ou traités via le Service.</li>
    <li><strong>"Contenu Généré par IA"</strong> : Les réponses et textes générés par le système d'intelligence artificielle intégré à ReplyStack.</li>
</ul>

<h2>2. Acceptation des Conditions</h2>
<p>En créant un compte, en installant l'extension navigateur ou en utilisant toute partie du Service, vous reconnaissez avoir lu, compris et accepté d'être lié par ces Conditions d'Utilisation.</p>
<p>Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser le Service.</p>

<h2>3. Description du Service</h2>
<p>ReplyStack fournit :</p>
<ul>
    <li>La génération de réponses aux avis clients assistée par IA</li>
    <li>Une extension navigateur pour Chrome et Firefox permettant de générer des réponses directement sur les plateformes d'avis</li>
    <li>Un tableau de bord web pour gérer les réponses, consulter les analyses et configurer les préférences</li>
    <li>L'intégration avec des plateformes d'avis tierces (Google Business, TripAdvisor, etc.)</li>
</ul>

<h2>4. Inscription au Compte</h2>

<h3>4.1 Éligibilité</h3>
<p>Vous devez avoir au moins 18 ans et avoir la capacité juridique de conclure des contrats pour utiliser le Service. En utilisant ReplyStack, vous déclarez et garantissez que vous remplissez ces conditions.</p>

<h3>4.2 Informations du Compte</h3>
<p>Vous vous engagez à :</p>
<ul>
    <li>Fournir des informations exactes, actuelles et complètes lors de l'inscription</li>
    <li>Maintenir et mettre à jour rapidement les informations de votre compte</li>
    <li>Garder votre mot de passe sécurisé et confidentiel</li>
    <li>Nous notifier immédiatement de toute utilisation non autorisée de votre compte</li>
</ul>

<h3>4.3 Responsabilité du Compte</h3>
<p>Vous êtes responsable de toutes les activités qui se produisent sous votre compte. Nous ne sommes pas responsables des pertes ou dommages résultant d'une utilisation non autorisée de votre compte.</p>

<h2>5. Utilisation Acceptable</h2>

<h3>5.1 Utilisations Autorisées</h3>
<p>Vous pouvez utiliser le Service pour :</p>
<ul>
    <li>Générer des réponses assistées par IA aux avis clients légitimes pour votre entreprise</li>
    <li>Gérer et suivre les réponses aux avis</li>
    <li>Accéder aux analyses et insights sur votre gestion des avis</li>
</ul>

<h3>5.2 Utilisations Interdites</h3>
<p>Vous vous engagez à NE PAS :</p>
<ul>
    <li>Utiliser le Service à des fins illégales ou en violation de toute loi</li>
    <li>Générer des réponses diffamatoires, abusives, harcelantes ou discriminatoires</li>
    <li>Utiliser le Service pour tromper les consommateurs ou publier de faux avis</li>
    <li>Tenter de rétro-ingéniérer, décompiler ou désassembler le Service</li>
    <li>Utiliser des systèmes automatisés (bots, scrapers) pour accéder au Service au-delà de l'utilisation normale</li>
    <li>Partager vos identifiants de compte avec des tiers</li>
    <li>Revendre, redistribuer ou sous-licencier l'accès au Service</li>
    <li>Interférer avec ou perturber le Service ou les serveurs</li>
    <li>Contourner les limites d'utilisation ou quotas</li>
    <li>Utiliser le Service pour concurrencer ReplyStack</li>
</ul>

<h2>6. Contenu Généré par IA</h2>

<h3>6.1 Nature des Réponses IA</h3>
<p>Les réponses générées par ReplyStack sont produites par intelligence artificielle. Bien que nous visions l'exactitude et la qualité :</p>
<ul>
    <li>Le contenu généré par IA peut contenir des erreurs ou inexactitudes</li>
    <li>Les réponses sont des suggestions et doivent être relues avant publication</li>
    <li>Vous êtes seul responsable de la révision et de l'approbation de tout contenu avant publication</li>
</ul>

<h3>6.2 Responsabilité de l'Utilisateur</h3>
<p>Vous reconnaissez et acceptez que :</p>
<ul>
    <li>Vous relirez toutes les réponses générées par IA avant de les publier</li>
    <li>Vous êtes responsable de l'exactitude et de la pertinence des réponses publiées</li>
    <li>ReplyStack n'est pas responsable des conséquences découlant des réponses publiées</li>
    <li>Vous ne tiendrez pas ReplyStack responsable des dommages résultant du contenu généré par IA</li>
</ul>

<h2>7. Propriété Intellectuelle</h2>

<h3>7.1 Propriété de ReplyStack</h3>
<p>Le Service, y compris son design, ses fonctionnalités, son code et toute la propriété intellectuelle associée, appartient à {{ $companyName }}. Vous bénéficiez d'une licence limitée, non exclusive et non transférable pour utiliser le Service conformément à ces Conditions.</p>

<h3>7.2 Votre Contenu</h3>
<p>Vous conservez la propriété de votre contenu original. En utilisant le Service, vous nous accordez une licence limitée pour traiter votre contenu uniquement aux fins de fourniture du Service.</p>

<h3>7.3 Réponses Générées par IA</h3>
<p>Vous pouvez utiliser les réponses générées par IA pour les besoins de votre entreprise. Nous ne revendiquons pas la propriété du contenu généré par IA créé pour votre utilisation.</p>

<h2>8. Services Tiers</h2>

<h3>8.1 Intégration de Plateformes</h3>
<p>Le Service s'intègre à des plateformes tierces (Google, Facebook, TripAdvisor, etc.). Votre utilisation de ces intégrations est également soumise aux conditions d'utilisation de ces plateformes.</p>

<h3>8.2 Absence d'Approbation</h3>
<p>L'intégration avec des services tiers ne constitue pas une approbation par ReplyStack. Nous ne sommes pas responsables de la disponibilité, de l'exactitude ou des politiques des services tiers.</p>

<h2>9. Disponibilité du Service</h2>

<h3>9.1 Temps de Disponibilité</h3>
<p>Nous nous efforçons de maintenir une haute disponibilité du Service mais ne garantissons pas un accès ininterrompu. Le Service peut être temporairement indisponible en raison de :</p>
<ul>
    <li>Maintenance programmée (nous fournirons un préavis lorsque possible)</li>
    <li>Maintenance d'urgence ou mises à jour</li>
    <li>Facteurs hors de notre contrôle (pannes internet, problèmes de services tiers)</li>
</ul>

<h3>9.2 Modifications</h3>
<p>Nous nous réservons le droit de modifier, suspendre ou interrompre toute partie du Service à tout moment. Nous fournirons un préavis raisonnable pour les changements importants.</p>

<h2>10. Limitation de Responsabilité</h2>

<div class="warning-box">
    <p><strong>Important :</strong> Dans la mesure maximale permise par la loi :</p>
    <ul>
        <li>Le Service est fourni "EN L'ÉTAT" et "SELON DISPONIBILITÉ" sans garantie d'aucune sorte</li>
        <li>Nous déclinons toute garantie implicite, y compris de qualité marchande et d'adéquation à un usage particulier</li>
        <li>Nous ne sommes pas responsables des dommages indirects, accessoires, spéciaux, consécutifs ou punitifs</li>
        <li>Notre responsabilité totale ne pourra excéder le montant que vous nous avez versé au cours des 12 mois précédant la réclamation</li>
    </ul>
</div>

<h2>11. Indemnisation</h2>
<p>Vous acceptez d'indemniser, défendre et dégager de toute responsabilité ReplyStack, ses dirigeants, administrateurs, employés et agents contre toute réclamation, dommage, perte, responsabilité et dépense (y compris les frais juridiques) découlant de :</p>
<ul>
    <li>Votre utilisation du Service</li>
    <li>Votre violation de ces Conditions</li>
    <li>Votre violation des droits de tiers</li>
    <li>Le contenu que vous publiez via le Service</li>
</ul>

<h2>12. Résiliation</h2>

<h3>12.1 Résiliation par Vous</h3>
<p>Vous pouvez résilier votre compte à tout moment en nous contactant ou via les paramètres de compte. À la résiliation, votre droit d'utiliser le Service cessera immédiatement.</p>

<h3>12.2 Résiliation par Nous</h3>
<p>Nous pouvons suspendre ou résilier votre compte si :</p>
<ul>
    <li>Vous violez ces Conditions d'Utilisation</li>
    <li>Votre utilisation présente un risque de sécurité</li>
    <li>Vous ne payez pas les frais applicables</li>
    <li>Requis par la loi ou une procédure judiciaire</li>
</ul>

<h3>12.3 Effet de la Résiliation</h3>
<p>À la résiliation, toutes les licences qui vous ont été accordées prendront fin et vous devrez cesser d'utiliser le Service. Nous pourrons supprimer vos données conformément à notre Politique de Confidentialité.</p>

<h2>13. Droit Applicable et Litiges</h2>
<p>Ces Conditions sont régies par les lois du Royaume du Maroc. Tout litige découlant de ces Conditions ou de votre utilisation du Service sera soumis à la compétence exclusive des tribunaux de Marrakech, Maroc.</p>

<h2>14. Modifications des Conditions</h2>
<p>Nous pouvons mettre à jour ces Conditions de temps en temps. Nous :</p>
<ul>
    <li>Vous notifierons des modifications importantes par email</li>
    <li>Fournirons un préavis d'au moins 30 jours avant l'entrée en vigueur des modifications</li>
    <li>Mettrons à jour la date de "Dernière mise à jour" en haut de cette page</li>
</ul>
<p>L'utilisation continue du Service après l'entrée en vigueur des modifications constitue l'acceptation des nouvelles Conditions.</p>

<h2>15. Dispositions Diverses</h2>

<h3>15.1 Accord Intégral</h3>
<p>Ces Conditions, ainsi que notre Politique de Confidentialité et nos Conditions de Vente, constituent l'accord intégral entre vous et ReplyStack.</p>

<h3>15.2 Divisibilité</h3>
<p>Si une disposition de ces Conditions est jugée invalide ou inapplicable, les autres dispositions resteront pleinement en vigueur.</p>

<h3>15.3 Renonciation</h3>
<p>Notre défaut d'exercer un droit ou une disposition de ces Conditions ne constitue pas une renonciation à ce droit ou cette disposition.</p>

<h3>15.4 Cession</h3>
<p>Vous ne pouvez pas céder ou transférer ces Conditions sans notre consentement écrit préalable. Nous pouvons céder nos droits et obligations sans restriction.</p>

<h2>16. Contact</h2>
<p>Pour toute question concernant ces Conditions d'Utilisation :</p>
<ul>
    <li><strong>Email :</strong> <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
    <li><strong>Adresse :</strong> {{ $companyName }}, {{ $companyAddress }}</li>
</ul>
@endsection
