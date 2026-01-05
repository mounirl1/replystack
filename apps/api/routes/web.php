<?php

use App\Http\Controllers\LegalController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => 'ReplyStack API',
        'version' => '1.0.0',
        'documentation' => '/api',
    ]);
});

// Legal pages (auto-detect language via ?lang=xx or Accept-Language header)
Route::get('/privacy', [LegalController::class, 'privacy'])->name('legal.privacy');
Route::get('/terms', [LegalController::class, 'terms'])->name('legal.terms');
Route::get('/sales', [LegalController::class, 'sales'])->name('legal.sales');
Route::get('/cookies', [LegalController::class, 'cookies'])->name('legal.cookies');
Route::get('/legal', [LegalController::class, 'legalNotice'])->name('legal.notice');
