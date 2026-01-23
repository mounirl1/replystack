<?php

return [
    // Authentication
    'auth' => [
        'registered' => 'Compte créé avec succès.',
        'logged_in' => 'Connexion réussie.',
        'logged_out' => 'Déconnexion réussie.',
        'all_devices_logged_out' => 'Tous les appareils ont été déconnectés.',
    ],

    // Validation
    'validation' => [
        'failed' => 'Validation échouée.',
    ],

    // Quota
    'quota' => [
        'exceeded' => 'Vous avez atteint votre limite de quota.',
    ],

    // Replies
    'replies' => [
        'generation_failed' => 'Impossible de générer la réponse. Veuillez réessayer.',
        'not_found' => 'Réponse non trouvée.',
    ],

    // User
    'user' => [
        'settings_updated' => 'Paramètres mis à jour avec succès.',
        'password_incorrect' => 'Mot de passe incorrect.',
        'must_transfer_organization' => 'Vous devez transférer ou supprimer votre organisation avant de supprimer votre compte.',
        'account_deleted' => 'Compte supprimé avec succès.',
        'paid_plan_required' => 'Un plan payant est requis pour changer de fournisseur IA.',
        'provider_not_available' => 'Ce fournisseur IA n\'est pas disponible pour votre plan.',
        'ai_provider_updated' => 'Fournisseur IA mis à jour avec succès.',
    ],

    // Locations
    'locations' => [
        'limit_reached' => 'Vous avez atteint la limite d\'établissements pour votre plan.',
        'created' => 'Établissement créé avec succès.',
        'not_found' => 'Établissement non trouvé.',
        'updated' => 'Établissement mis à jour avec succès.',
        'cannot_delete_last' => 'Vous ne pouvez pas supprimer votre seul établissement.',
        'deleted' => 'Établissement supprimé avec succès.',
        'not_accessible' => 'Établissement non trouvé ou non accessible.',
    ],

    // Response Profile
    'response_profile' => [
        'saved' => 'Profil de réponse enregistré avec succès.',
        'reset' => 'Profil de réponse réinitialisé.',
    ],

    // Alertes
    'alerts' => [
        'pro_required' => 'Les paramètres d\'alertes nécessitent un plan Pro ou supérieur.',
        'settings_updated' => 'Paramètres d\'alertes mis à jour avec succès.',
    ],

    // Analytics
    'analytics' => [
        'pro_required' => 'L\'analyse des tendances nécessite un plan Pro ou supérieur.',
    ],
];
