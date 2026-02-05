<?php

return [
    // Authentication
    'auth' => [
        'registered' => 'Account creato con successo.',
        'logged_in' => 'Accesso effettuato con successo.',
        'logged_out' => 'Disconnessione effettuata con successo.',
        'all_devices_logged_out' => 'Tutti i dispositivi sono stati disconnessi.',
        'invalid_magic_token' => 'Token magico non valido o scaduto.',
        'magic_token_valid' => 'Token magico convalidato con successo.',
        'password_reset_link_sent' => 'Se esiste un account con questa email, riceverai un link per reimpostare.',
        'invalid_reset_token' => 'Token di reimpostazione non valido o scaduto.',
        'reset_token_expired' => 'Questo link di reimpostazione è scaduto. Per favore richiedine uno nuovo.',
        'password_reset_success' => 'Password reimpostata con successo.',
    ],

    // Validation
    'validation' => [
        'failed' => 'Validazione fallita.',
    ],

    // Quota
    'quota' => [
        'exceeded' => 'Hai raggiunto il limite della tua quota.',
    ],

    // Replies
    'replies' => [
        'generation_failed' => 'Impossibile generare la risposta. Riprova.',
        'not_found' => 'Risposta non trovata.',
    ],

    // User
    'user' => [
        'settings_updated' => 'Impostazioni aggiornate con successo.',
        'password_incorrect' => 'Password errata.',
        'must_transfer_organization' => 'Devi trasferire o eliminare la tua organizzazione prima di eliminare il tuo account.',
        'account_deleted' => 'Account eliminato con successo.',
    ],

    // Locations
    'locations' => [
        'limit_reached' => 'Hai raggiunto il limite di sedi per il tuo piano.',
        'created' => 'Sede creata con successo.',
        'not_found' => 'Sede non trovata.',
        'updated' => 'Sede aggiornata con successo.',
        'cannot_delete_last' => 'Non puoi eliminare la tua unica sede.',
        'deleted' => 'Sede eliminata con successo.',
        'not_accessible' => 'Sede non trovata o non accessibile.',
    ],

    // Response Profile
    'response_profile' => [
        'saved' => 'Profilo di risposta salvato con successo.',
        'reset' => 'Profilo di risposta reimpostato ai valori predefiniti.',
    ],
];
