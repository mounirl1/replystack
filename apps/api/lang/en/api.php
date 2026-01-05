<?php

return [
    // Authentication
    'auth' => [
        'registered' => 'Account created successfully.',
        'logged_in' => 'Login successful.',
        'logged_out' => 'Logout successful.',
        'all_devices_logged_out' => 'All devices have been logged out.',
    ],

    // Validation
    'validation' => [
        'failed' => 'Validation failed.',
    ],

    // Quota
    'quota' => [
        'exceeded' => 'You have reached your quota limit.',
    ],

    // Replies
    'replies' => [
        'generation_failed' => 'Failed to generate reply. Please try again.',
        'not_found' => 'Response not found.',
    ],

    // User
    'user' => [
        'settings_updated' => 'Settings updated successfully.',
        'password_incorrect' => 'Incorrect password.',
        'must_transfer_organization' => 'You must transfer or delete your organization before deleting your account.',
        'account_deleted' => 'Account deleted successfully.',
    ],

    // Locations
    'locations' => [
        'limit_reached' => 'You have reached the location limit for your plan.',
        'created' => 'Location created successfully.',
        'not_found' => 'Location not found.',
        'updated' => 'Location updated successfully.',
        'cannot_delete_last' => 'You cannot delete your only location.',
        'deleted' => 'Location deleted successfully.',
        'not_accessible' => 'Location not found or not accessible.',
    ],

    // Response Profile
    'response_profile' => [
        'saved' => 'Response profile saved successfully.',
        'reset' => 'Response profile reset to defaults.',
    ],
];
