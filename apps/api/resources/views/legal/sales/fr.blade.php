@extends('legal.layouts.legal')

@section('title', 'Conditions de Vente')
@section('link_legal', 'Mentions Légales')
@section('link_terms', 'Conditions d\'Utilisation')
@section('link_sales', 'Conditions de Vente')
@section('link_privacy', 'Politique de Confidentialité')
@section('link_cookies', 'Politique des Cookies')

@section('content')
<h1>Conditions Générales de Vente</h1>
<p class="last-updated">{{ $translations['lastUpdated'] }}: {{ $lastUpdatedDate }}</p>

<div class="highlight-box">
    <strong>Avis :</strong> Ces Conditions Générales de Vente régissent tous les achats d'abonnements aux services ReplyStack. En vous abonnant, vous acceptez ces conditions.
</div>

<h2>1. Informations sur le Vendeur</h2>
<ul>
    <li><strong>Société :</strong> {{ $companyName }}</li>
    <li><strong>Forme Juridique :</strong> {{ $companyForm }} (Droit Marocain)</li>
    <li><strong>ICE :</strong> {{ $companyId }}</li>
    <li><strong>Adresse :</strong> {{ $companyAddress }}</li>
    <li><strong>Email :</strong> <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
    <li><strong>Représentant :</strong> {{ $directorName }}, {{ $directorTitle }}</li>
</ul>

<h2>2. Champ d'Application</h2>
<p>Ces Conditions Générales de Vente s'appliquent à tous les achats d'abonnements effectués via la plateforme ReplyStack (replystack.io). En finalisant un achat, vous concluez un contrat contraignant avec {{ $companyName }}.</p>

<h2>3. Produits et Services</h2>

<h3>3.1 Description du Service</h3>
<p>ReplyStack propose des formules d'abonnement pour la génération de réponses aux avis assistée par IA :</p>
<ul>
    <li><strong>Plan Gratuit :</strong> Réponses quotidiennes limitées, fonctionnalités de base</li>
    <li><strong>Plan Starter :</strong> Quota mensuel de réponses, accès au tableau de bord</li>
    <li><strong>Plan Pro :</strong> Réponses illimitées, fonctionnalités avancées, analytiques</li>
    <li><strong>Plan Business :</strong> Support multi-établissements, fonctionnalités équipe, support prioritaire</li>
    <li><strong>Plan Enterprise :</strong> Solutions personnalisées, support dédié, accès API</li>
</ul>

<h3>3.2 Disponibilité du Service</h3>
<p>Notre service est disponible dans le monde entier. Certaines fonctionnalités peuvent varier selon les régions en raison de contraintes réglementaires ou techniques.</p>

<h2>4. Prix</h2>

<h3>4.1 Informations sur les Prix</h3>
<p>Tous les prix sont affichés en Euros (EUR) et sont hors taxes applicables, sauf indication contraire. Les tarifs actuels sont disponibles sur notre site web à replystack.io/pricing.</p>

<h3>4.2 Modification des Prix</h3>
<p>Nous nous réservons le droit de modifier nos prix à tout moment. Les modifications de prix :</p>
<ul>
    <li>Seront annoncées au moins 30 jours à l'avance</li>
    <li>N'affecteront pas les abonnements actifs jusqu'au renouvellement</li>
    <li>Seront communiquées par email aux clients existants</li>
</ul>

<h2>5. Paiement</h2>

<h3>5.1 Moyens de Paiement</h3>
<p>Les paiements sont traités par notre prestataire de paiement, Lemon Squeezy. Les moyens de paiement acceptés comprennent :</p>
<ul>
    <li>Cartes de crédit et de débit (Visa, Mastercard, American Express)</li>
    <li>PayPal (selon disponibilité)</li>
    <li>Autres moyens supportés par notre prestataire de paiement</li>
</ul>

<h3>5.2 Traitement des Paiements</h3>
<p>Toutes les informations de paiement sont traitées de manière sécurisée par Lemon Squeezy. Nous ne stockons pas les détails de votre carte bancaire. Lemon Squeezy est conforme PCI-DSS.</p>

<h3>5.3 Cycle de Facturation</h3>
<ul>
    <li><strong>Abonnements mensuels :</strong> Facturés le même jour chaque mois</li>
    <li><strong>Abonnements annuels :</strong> Facturés une fois par an avec remise applicable</li>
</ul>

<h3>5.4 Échec de Paiement</h3>
<p>En cas d'échec de paiement :</p>
<ul>
    <li>Nous tenterons de traiter le paiement à nouveau dans les 3 jours ouvrables</li>
    <li>Vous serez notifié par email de l'échec du paiement</li>
    <li>Si le paiement ne peut être traité après 3 tentatives, votre abonnement pourra être suspendu</li>
</ul>

<h2>6. Abonnement et Renouvellement</h2>

<h3>6.1 Renouvellement Automatique</h3>
<p>Tous les abonnements se renouvellent automatiquement à la fin de chaque période de facturation sauf annulation. En vous abonnant, vous nous autorisez à débiter votre moyen de paiement pour les paiements récurrents.</p>

<h3>6.2 Annulation</h3>
<p>Vous pouvez annuler votre abonnement à tout moment via :</p>
<ul>
    <li>Les paramètres de votre compte sur le tableau de bord ReplyStack</li>
    <li>En contactant notre support à <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
</ul>
<p>L'annulation prend effet à la fin de la période de facturation en cours. Vous conserverez l'accès aux fonctionnalités payantes jusqu'à cette date.</p>

<h3>6.3 Rétrogradation</h3>
<p>Vous pouvez rétrograder vers un plan inférieur à tout moment. Le changement prendra effet au début de votre prochaine période de facturation.</p>

<h2>7. Droit de Rétractation (Délai de Réflexion)</h2>

<div class="jurisdiction-notice">
    <h3>7.1 Pour les Consommateurs de l'UE/EEE</h3>
    <p>Conformément aux lois européennes de protection des consommateurs, vous avez le droit de vous rétracter de ce contrat dans un délai de 14 jours sans donner de motif.</p>
    <p>Le délai de rétractation expire 14 jours après le jour de la conclusion du contrat.</p>
    <p>Pour exercer le droit de rétractation, vous devez nous informer de votre décision par une déclaration claire (email à <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a>).</p>

    <h4>Exceptions</h4>
    <p>Le droit de rétractation ne s'applique pas si :</p>
    <ul>
        <li>Vous avez expressément consenti à ce que le service commence pendant le délai de rétractation</li>
        <li>Vous avez reconnu que vous perdrez votre droit de rétractation une fois le service pleinement exécuté</li>
        <li>Le service a été pleinement exécuté avec votre consentement exprès préalable</li>
    </ul>

    <h4>Effet de la Rétractation</h4>
    <p>Si vous vous rétractez de ce contrat, nous vous rembourserons tous les paiements reçus de votre part sans retard excessif et au plus tard 14 jours à compter du jour où nous aurons reçu notification de votre rétractation.</p>
</div>

<h3>7.2 Pour les Autres Juridictions</h3>
<p>Pour les clients hors UE/EEE, les politiques de remboursement sont régies par la Section 8 de ces Conditions.</p>

<h2>8. Politique de Remboursement</h2>

<h3>8.1 Politique Générale</h3>
<p>En raison de la nature numérique de nos services :</p>
<ul>
    <li>Les remboursements ne sont généralement pas accordés pour les périodes d'abonnement ayant déjà commencé</li>
    <li>Nous évaluons les demandes de remboursement au cas par cas pour les problèmes techniques ou les défaillances de service</li>
</ul>

<h3>8.2 Demande de Remboursement</h3>
<p>Pour demander un remboursement :</p>
<ol>
    <li>Contactez-nous à <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
    <li>Incluez l'email de votre compte et la raison de votre demande</li>
    <li>Nous répondrons dans les 5 jours ouvrables</li>
</ol>

<h3>8.3 Remboursements Approuvés</h3>
<p>Si un remboursement est approuvé :</p>
<ul>
    <li>Le remboursement sera traité sur votre moyen de paiement d'origine</li>
    <li>Le délai de traitement est généralement de 5 à 10 jours ouvrables</li>
    <li>Votre abonnement sera annulé</li>
</ul>

<h2>9. Taxes</h2>

<h3>9.1 TVA et Taxes de Vente</h3>
<p>Les prix peuvent être soumis à la Taxe sur la Valeur Ajoutée (TVA) ou autres taxes applicables selon votre localisation. Notre prestataire de paiement calculera et appliquera le taux de taxe approprié en fonction de votre adresse de facturation.</p>

<h3>9.2 Factures</h3>
<p>Les factures sont automatiquement générées et envoyées à votre adresse email enregistrée après chaque paiement. Vous pouvez également télécharger les factures depuis votre tableau de bord.</p>

<h2>10. Niveau de Service</h2>

<h3>10.1 Disponibilité</h3>
<p>Nous visons une disponibilité de 99,9% pour nos services. Les maintenances programmées seront annoncées à l'avance lorsque possible.</p>

<h3>10.2 Support</h3>
<table>
    <thead>
        <tr>
            <th>Plan</th>
            <th>Niveau de Support</th>
            <th>Délai de Réponse</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Gratuit</td>
            <td>Support par email</td>
            <td>72 heures</td>
        </tr>
        <tr>
            <td>Starter</td>
            <td>Support par email</td>
            <td>48 heures</td>
        </tr>
        <tr>
            <td>Pro</td>
            <td>Support email prioritaire</td>
            <td>24 heures</td>
        </tr>
        <tr>
            <td>Business</td>
            <td>Support prioritaire</td>
            <td>12 heures</td>
        </tr>
        <tr>
            <td>Enterprise</td>
            <td>Support dédié</td>
            <td>4 heures</td>
        </tr>
    </tbody>
</table>

<h2>11. Limitation de Responsabilité</h2>
<p>Notre responsabilité pour toute réclamation découlant du service d'abonnement est limitée au montant que vous nous avez versé au cours des 12 mois précédant la réclamation. Nous ne sommes pas responsables des dommages indirects, accessoires ou consécutifs.</p>

<h2>12. Résolution des Litiges</h2>

<h3>12.1 Contactez-nous d'abord</h3>
<p>Si vous avez une réclamation ou un litige, veuillez d'abord nous contacter à <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a>. Nous nous efforcerons de résoudre le problème dans les 30 jours.</p>

<h3>12.2 Règlement en Ligne des Litiges (UE)</h3>
<p>Pour les consommateurs de l'UE : La Commission Européenne fournit une plateforme de règlement en ligne des litiges à <a href="https://ec.europa.eu/consumers/odr" target="_blank">https://ec.europa.eu/consumers/odr</a></p>

<h3>12.3 Droit Applicable</h3>
<p>Ces Conditions de Vente sont régies par les lois du Royaume du Maroc. Les litiges seront soumis à la compétence exclusive des tribunaux de Marrakech, Maroc, sauf si les lois impératives de protection des consommateurs en disposent autrement.</p>

<h2>13. Modifications des Conditions</h2>
<p>Nous pouvons mettre à jour ces Conditions de Vente. Les modifications seront annoncées 30 jours à l'avance et n'affecteront pas les abonnements existants jusqu'au renouvellement.</p>

<h2>14. Contact</h2>
<p>Pour toute question concernant les achats, la facturation ou ces Conditions de Vente :</p>
<ul>
    <li><strong>Email :</strong> <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
    <li><strong>Adresse :</strong> {{ $companyName }}, {{ $companyAddress }}</li>
</ul>
@endsection
