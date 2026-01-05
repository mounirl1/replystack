@extends('legal.layouts.legal')

@section('title', 'Informativa sui Cookie')
@section('link_legal', 'Note Legali')
@section('link_terms', 'Termini di Utilizzo')
@section('link_sales', 'Condizioni di Vendita')
@section('link_privacy', 'Informativa sulla Privacy')
@section('link_cookies', 'Informativa sui Cookie')

@section('content')
<h1>Informativa sui Cookie</h1>
<p class="last-updated">{{ $translations['lastUpdated'] }}: {{ $lastUpdatedDate }}</p>

<div class="highlight-box">
    <strong>Riepilogo:</strong> ReplyStack utilizza solo cookie essenziali necessari per il funzionamento del servizio. Non utilizziamo cookie pubblicitari o di tracciamento.
</div>

<h2>1. Cosa sono i Cookie?</h2>
<p>I cookie sono piccoli file di testo che vengono memorizzati sul tuo dispositivo (computer, tablet o smartphone) quando visiti un sito web. Aiutano il sito a ricordare le tue azioni e preferenze nel tempo.</p>

<h2>2. La Nostra Politica sui Cookie</h2>
<p>ReplyStack si impegna a rispettare la tua privacy. Utilizziamo un approccio minimalista ai cookie:</p>
<ul>
    <li>Utilizziamo solo <strong>cookie strettamente necessari</strong> per il funzionamento del servizio</li>
    <li><strong>Non</strong> utilizziamo cookie pubblicitari o di marketing</li>
    <li><strong>Non</strong> utilizziamo cookie di tracciamento di terze parti</li>
    <li><strong>Non</strong> vendiamo i dati raccolti tramite cookie</li>
</ul>

<h2>3. Cookie che Utilizziamo</h2>

<h3>3.1 Cookie Essenziali</h3>
<p>Questi cookie sono necessari per il funzionamento del sito web e non possono essere disattivati.</p>

<table>
    <thead>
        <tr>
            <th>Nome del Cookie</th>
            <th>Finalità</th>
            <th>Durata</th>
            <th>Tipo</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>session</td>
            <td>Mantiene la tua sessione di accesso e la sicurezza</td>
            <td>Sessione / 2 ore</td>
            <td>Prima parte</td>
        </tr>
        <tr>
            <td>XSRF-TOKEN</td>
            <td>Protegge contro attacchi di falsificazione delle richieste cross-site</td>
            <td>Sessione / 2 ore</td>
            <td>Prima parte</td>
        </tr>
        <tr>
            <td>remember_token</td>
            <td>Mantiene il tuo accesso se scegli "Ricordami"</td>
            <td>30 giorni</td>
            <td>Prima parte</td>
        </tr>
    </tbody>
</table>

<h3>3.2 Cookie Funzionali</h3>
<p>Questi cookie abilitano funzionalità personalizzate.</p>

<table>
    <thead>
        <tr>
            <th>Nome del Cookie</th>
            <th>Finalità</th>
            <th>Durata</th>
            <th>Tipo</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>locale</td>
            <td>Ricorda la tua preferenza di lingua</td>
            <td>1 anno</td>
            <td>Prima parte</td>
        </tr>
        <tr>
            <td>theme</td>
            <td>Ricorda la tua preferenza di tema (chiaro/scuro)</td>
            <td>1 anno</td>
            <td>Prima parte</td>
        </tr>
    </tbody>
</table>

<h3>3.3 Estensione Browser</h3>
<p>L'estensione browser ReplyStack utilizza lo storage locale (non cookie) per:</p>
<ul>
    <li>Memorizzare il tuo token di autenticazione in modo sicuro</li>
    <li>Memorizzare nella cache le tue preferenze per un accesso più veloce</li>
    <li>Ricordare le tue ultime impostazioni utilizzate</li>
</ul>
<p>Questi dati sono memorizzati localmente nel tuo browser e non sono condivisi con terze parti.</p>

<h2>4. Cookie che NON Utilizziamo</h2>

<p>Per essere chiari, ReplyStack <strong>non</strong> utilizza:</p>
<ul>
    <li><strong>Cookie pubblicitari:</strong> Non mostriamo annunci e non ti tracciamo a fini pubblicitari</li>
    <li><strong>Cookie di analisi:</strong> Non utilizziamo Google Analytics o strumenti di analisi simili di terze parti</li>
    <li><strong>Cookie dei social media:</strong> Non incorporiamo tracciamento dei social media</li>
    <li><strong>Cookie di tracciamento di terze parti:</strong> Non permettiamo a terze parti di inserire cookie sul nostro sito</li>
</ul>

<h2>5. Servizi di Terze Parti</h2>

<p>Quando utilizzi determinate funzionalità, potresti interagire con servizi di terze parti che hanno le proprie politiche sui cookie:</p>

<table>
    <thead>
        <tr>
            <th>Servizio</th>
            <th>Finalità</th>
            <th>La Loro Politica sui Cookie</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Lemon Squeezy</td>
            <td>Elaborazione dei pagamenti</td>
            <td><a href="https://www.lemonsqueezy.com/privacy" target="_blank">Vedi Politica</a></td>
        </tr>
        <tr>
            <td>Google OAuth</td>
            <td>Accesso con Google (opzionale)</td>
            <td><a href="https://policies.google.com/privacy" target="_blank">Vedi Politica</a></td>
        </tr>
    </tbody>
</table>

<p>Questi cookie di terze parti vengono impostati solo quando utilizzi esplicitamente questi servizi (ad esempio, durante il checkout o l'accesso OAuth).</p>

<h2>6. Gestione dei Cookie</h2>

<h3>6.1 Impostazioni del Browser</h3>
<p>Puoi controllare i cookie attraverso le impostazioni del tuo browser:</p>
<ul>
    <li><strong>Chrome:</strong> Impostazioni → Privacy e sicurezza → Cookie</li>
    <li><strong>Firefox:</strong> Impostazioni → Privacy e sicurezza → Cookie</li>
    <li><strong>Safari:</strong> Preferenze → Privacy → Cookie</li>
    <li><strong>Edge:</strong> Impostazioni → Cookie e autorizzazioni dei siti</li>
</ul>

<h3>6.2 Impatto della Disattivazione dei Cookie</h3>
<p>Se disattivi i cookie essenziali:</p>
<ul>
    <li>Non potrai accedere al tuo account</li>
    <li>Le funzionalità di sicurezza della sessione non funzioneranno</li>
    <li>Il servizio potrebbe non funzionare correttamente</li>
</ul>

<h2>7. Consenso ai Cookie</h2>
<p>Secondo il GDPR e normative simili, i cookie strettamente necessari non richiedono consenso in quanto essenziali per il funzionamento del servizio. Poiché ReplyStack utilizza solo cookie essenziali:</p>
<ul>
    <li>Non mostriamo un banner di consenso ai cookie per i nostri cookie essenziali</li>
    <li>Utilizzando il nostro servizio, riconosci l'utilizzo di questi cookie necessari</li>
    <li>Puoi sempre gestire i cookie attraverso le impostazioni del tuo browser</li>
</ul>

<h2>8. Protezione dei Dati</h2>
<p>I dati dei cookie sono trattati in conformità con la nostra <a href="/privacy?lang=it">Informativa sulla Privacy</a>. Garantiamo:</p>
<ul>
    <li>Tutti i cookie sono trasmessi tramite HTTPS (crittografati)</li>
    <li>I cookie di sessione utilizzano i flag secure e httpOnly</li>
    <li>I dati dei cookie non sono condivisi con terze parti a fini di marketing</li>
</ul>

<h2>9. Modifiche a Questa Informativa</h2>
<p>Potremmo aggiornare questa Informativa sui Cookie di tanto in tanto. Le modifiche saranno pubblicate su questa pagina con una data di revisione aggiornata. Ti notificheremo eventuali modifiche sostanziali via email.</p>

<h2>10. Contatti</h2>
<p>Se hai domande sul nostro utilizzo dei cookie:</p>
<ul>
    <li><strong>Email:</strong> <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
    <li><strong>Indirizzo:</strong> {{ $companyName }}, {{ $companyAddress }}</li>
</ul>
@endsection
