<?php

return [
    // Authentication
    'auth' => [
        'registered' => 'Cuenta creada con éxito.',
        'logged_in' => 'Inicio de sesión exitoso.',
        'logged_out' => 'Cierre de sesión exitoso.',
        'all_devices_logged_out' => 'Todos los dispositivos han sido desconectados.',
        'invalid_magic_token' => 'Token mágico inválido o expirado.',
        'magic_token_valid' => 'Token mágico validado con éxito.',
        'password_reset_link_sent' => 'Si existe una cuenta con este email, recibirás un enlace de restablecimiento.',
        'invalid_reset_token' => 'Token de restablecimiento inválido o expirado.',
        'reset_token_expired' => 'Este enlace de restablecimiento ha expirado. Por favor solicita uno nuevo.',
        'password_reset_success' => 'Contraseña restablecida con éxito.',
    ],

    // Validation
    'validation' => [
        'failed' => 'Validación fallida.',
    ],

    // Quota
    'quota' => [
        'exceeded' => 'Has alcanzado tu límite de cuota.',
    ],

    // Replies
    'replies' => [
        'generation_failed' => 'Error al generar la respuesta. Por favor, inténtalo de nuevo.',
        'not_found' => 'Respuesta no encontrada.',
    ],

    // User
    'user' => [
        'settings_updated' => 'Configuración actualizada con éxito.',
        'password_incorrect' => 'Contraseña incorrecta.',
        'must_transfer_organization' => 'Debes transferir o eliminar tu organización antes de eliminar tu cuenta.',
        'account_deleted' => 'Cuenta eliminada con éxito.',
    ],

    // Locations
    'locations' => [
        'limit_reached' => 'Has alcanzado el límite de establecimientos para tu plan.',
        'created' => 'Establecimiento creado con éxito.',
        'not_found' => 'Establecimiento no encontrado.',
        'updated' => 'Establecimiento actualizado con éxito.',
        'cannot_delete_last' => 'No puedes eliminar tu único establecimiento.',
        'deleted' => 'Establecimiento eliminado con éxito.',
        'not_accessible' => 'Establecimiento no encontrado o no accesible.',
    ],

    // Response Profile
    'response_profile' => [
        'saved' => 'Perfil de respuesta guardado con éxito.',
        'reset' => 'Perfil de respuesta restablecido a los valores predeterminados.',
    ],
];
