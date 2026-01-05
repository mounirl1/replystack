@extends('legal.layouts.legal')

@section('title', 'Informativa sulla Privacy')
@section('link_legal', 'Note Legali')
@section('link_terms', 'Termini di Utilizzo')
@section('link_sales', 'Condizioni di Vendita')
@section('link_privacy', 'Informativa sulla Privacy')
@section('link_cookies', 'Informativa sui Cookie')

@section('content')
<h1>Informativa sulla Privacy</h1>
<p class="last-updated">{{ $translations['lastUpdated'] }}: {{ $lastUpdatedDate }}</p>

<div class="highlight-box">
    <strong>Il Nostro Impegno:</strong> In ReplyStack, ci impegniamo a proteggere la tua privacy e i tuoi dati personali. Questa informativa spiega come raccogliamo, utilizziamo e proteggiamo le tue informazioni in conformità con il GDPR (UE), CCPA (California), LGPD (Brasile) e la Legge marocchina 09-08.
</div>

<h2>1. Titolare del Trattamento</h2>
<p>Il titolare del trattamento dei tuoi dati personali è:</p>
<ul>
    <li><strong>Azienda:</strong> {{ $companyName }}</li>
    <li><strong>Forma Giuridica:</strong> {{ $companyForm }} (Diritto Marocchino)</li>
    <li><strong>ICE:</strong> {{ $companyId }}</li>
    <li><strong>Indirizzo:</strong> {{ $companyAddress }}</li>
    <li><strong>Email:</strong> <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
    <li><strong>Rappresentante:</strong> {{ $directorName }}, {{ $directorTitle }}</li>
</ul>

<h2>2. Ambito di Applicazione</h2>
<p>Questa Informativa sulla Privacy si applica a:</p>
<ul>
    <li>Il sito web e l'applicazione web ReplyStack</li>
    <li>La dashboard di ReplyStack</li>
    <li>L'estensione browser ReplyStack per Chrome e Firefox</li>
    <li>Tutti i servizi e le comunicazioni correlati</li>
</ul>

<h2>3. Dati che Raccogliamo</h2>

<h3>3.1 Informazioni sull'Account</h3>
<ul>
    <li>Indirizzo email</li>
    <li>Nome (opzionale)</li>
    <li>Password (memorizzata come hash sicuro, mai in chiaro)</li>
    <li>Piano e stato dell'abbonamento</li>
</ul>

<h3>3.2 Dati del Profilo Aziendale</h3>
<ul>
    <li>Nome dell'attività</li>
    <li>Settore di attività</li>
    <li>Indirizzo (opzionale)</li>
    <li>Preferenze di risposta (tono, lingua, firma)</li>
</ul>

<h3>3.3 Dati delle Recensioni dei Clienti</h3>
<ul>
    <li>Contenuto delle recensioni, autori, valutazioni e date dalle piattaforme collegate</li>
    <li>Risposte generate dall'IA</li>
    <li>Cronologia delle risposte e analisi</li>
</ul>

<h3>3.4 OAuth e Connessioni alle Piattaforme</h3>
<ul>
    <li>Token OAuth per Google Business Profile e Facebook (crittografati a riposo)</li>
    <li>Identificatori di piattaforma per gli account collegati</li>
</ul>

<h3>3.5 Dati di Utilizzo</h3>
<ul>
    <li>File di log (indirizzo IP, tipo di browser, orari di accesso)</li>
    <li>Statistiche di utilizzo delle funzionalità</li>
    <li>Preferenze e impostazioni</li>
</ul>

<h3>3.6 Informazioni di Pagamento</h3>
<ul>
    <li>Le informazioni di fatturazione sono elaborate dal nostro fornitore di pagamenti (Lemon Squeezy)</li>
    <li>NON memorizziamo numeri di carta di credito o coordinate bancarie</li>
</ul>

<h3>3.7 Dati dell'Estensione Browser</h3>
<ul>
    <li>Dati delle recensioni dalle piattaforme supportate (Google Business, TripAdvisor, ecc.)</li>
    <li>L'estensione funziona solo sulle pagine delle piattaforme di recensioni supportate</li>
    <li>Non tracciamo la tua attività di navigazione generale</li>
</ul>

<h2>4. Come Utilizziamo i Tuoi Dati</h2>
<table>
    <thead>
        <tr>
            <th>Finalità</th>
            <th>Base Giuridica</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Fornitura del servizio ReplyStack (generazione di risposte IA, aggregazione recensioni)</td>
            <td>Esecuzione del contratto</td>
        </tr>
        <tr>
            <td>Gestione del tuo account utente</td>
            <td>Esecuzione del contratto</td>
        </tr>
        <tr>
            <td>Elaborazione dei pagamenti e fatturazione</td>
            <td>Esecuzione del contratto / Obbligo legale</td>
        </tr>
        <tr>
            <td>Invio di email transazionali (account, fatturazione, sicurezza)</td>
            <td>Esecuzione del contratto</td>
        </tr>
        <tr>
            <td>Miglioramento dei nostri servizi tramite analisi</td>
            <td>Interesse legittimo</td>
        </tr>
        <tr>
            <td>Sicurezza e prevenzione delle frodi</td>
            <td>Interesse legittimo / Obbligo legale</td>
        </tr>
        <tr>
            <td>Comunicazioni di marketing</td>
            <td>Consenso (opt-in)</td>
        </tr>
    </tbody>
</table>

<h2>5. Destinatari e Responsabili del Trattamento</h2>
<p>Condividiamo i tuoi dati con i seguenti fornitori di servizi:</p>
<table>
    <thead>
        <tr>
            <th>Destinatario</th>
            <th>Finalità</th>
            <th>Ubicazione</th>
            <th>Garanzie</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Anthropic, PBC</td>
            <td>Generazione di risposte IA</td>
            <td>USA</td>
            <td>DPF, SCC</td>
        </tr>
        <tr>
            <td>Railway, Inc.</td>
            <td>Hosting API</td>
            <td>USA</td>
            <td>DPF, SCC</td>
        </tr>
        <tr>
            <td>Vercel Inc.</td>
            <td>Hosting Frontend</td>
            <td>USA</td>
            <td>DPF, SCC</td>
        </tr>
        <tr>
            <td>Lemon Squeezy, LLC</td>
            <td>Elaborazione pagamenti</td>
            <td>USA</td>
            <td>DPF, SCC, PCI-DSS</td>
        </tr>
        <tr>
            <td>Google LLC</td>
            <td>OAuth (se connesso)</td>
            <td>USA</td>
            <td>DPF, SCC</td>
        </tr>
        <tr>
            <td>Meta Platforms, Inc.</td>
            <td>OAuth (se connesso)</td>
            <td>USA</td>
            <td>DPF, SCC</td>
        </tr>
    </tbody>
</table>
<p><small>DPF = Data Privacy Framework UE-USA; SCC = Clausole Contrattuali Standard</small></p>

<h2>6. Trasferimenti Internazionali di Dati</h2>
<p>I tuoi dati potrebbero essere trasferiti ed elaborati negli Stati Uniti. Garantiamo una protezione adeguata tramite:</p>
<ul>
    <li>Certificazione Data Privacy Framework UE-USA dei nostri responsabili</li>
    <li>Clausole Contrattuali Standard (SCC) approvate dalla Commissione Europea</li>
    <li>Il tuo consenso esplicito a questi trasferimenti al momento della creazione dell'account</li>
</ul>

<h2>7. Conservazione dei Dati</h2>
<table>
    <thead>
        <tr>
            <th>Tipo di Dati</th>
            <th>Periodo di Conservazione</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Dati dell'account</td>
            <td>Durata dell'abbonamento + 3 anni</td>
        </tr>
        <tr>
            <td>Recensioni e risposte</td>
            <td>Durata dell'abbonamento + 1 anno</td>
        </tr>
        <tr>
            <td>Token OAuth</td>
            <td>Fino alla disconnessione o scadenza</td>
        </tr>
        <tr>
            <td>Log del server</td>
            <td>12 mesi</td>
        </tr>
        <tr>
            <td>Documenti di fatturazione</td>
            <td>10 anni (obbligo legale)</td>
        </tr>
    </tbody>
</table>

<h2>8. I Tuoi Diritti sulla Privacy</h2>

<h3>8.1 Diritti per Tutti gli Utenti</h3>
<ul>
    <li><strong>Diritto di accesso:</strong> Richiedere una copia dei tuoi dati personali</li>
    <li><strong>Diritto di rettifica:</strong> Correggere dati inesatti o incompleti</li>
    <li><strong>Diritto alla cancellazione:</strong> Richiedere la cancellazione dei tuoi dati ("diritto all'oblio")</li>
    <li><strong>Diritto alla portabilità:</strong> Ricevere i tuoi dati in un formato strutturato</li>
    <li><strong>Diritto di opposizione:</strong> Opporti a determinati trattamenti</li>
    <li><strong>Diritto di revoca del consenso:</strong> Revocare il consenso in qualsiasi momento</li>
</ul>

<div class="jurisdiction-notice">
    <h3>8.2 Diritti Aggiuntivi per i Residenti UE/SEE (GDPR)</h3>
    <ul>
        <li>Diritto di presentare reclamo all'Autorità Garante per la Protezione dei Dati locale</li>
        <li>Diritto alla limitazione del trattamento</li>
        <li>Diritto a non essere sottoposto a decisioni automatizzate</li>
    </ul>
</div>

<div class="jurisdiction-notice">
    <h3>8.3 Diritti Aggiuntivi per i Residenti della California (CCPA)</h3>
    <ul>
        <li>Diritto di sapere quali informazioni personali vengono raccolte, utilizzate e condivise</li>
        <li>Diritto alla cancellazione delle informazioni personali</li>
        <li>Diritto di rinunciare alla vendita di informazioni personali (Nota: NON vendiamo dati personali)</li>
        <li>Diritto alla non discriminazione per l'esercizio dei tuoi diritti</li>
    </ul>
</div>

<div class="jurisdiction-notice">
    <h3>8.4 Diritti Aggiuntivi per i Residenti del Brasile (LGPD)</h3>
    <ul>
        <li>Diritto all'informazione sulla condivisione dei dati con terzi</li>
        <li>Diritto all'anonimizzazione, blocco o cancellazione dei dati eccedenti</li>
        <li>Diritto alla revoca del consenso</li>
    </ul>
</div>

<h3>8.5 Come Esercitare i Tuoi Diritti</h3>
<p>Per esercitare uno qualsiasi di questi diritti, contattaci a: <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></p>
<p>Risponderemo entro 30 giorni dalla ricezione della tua richiesta.</p>

<h2>9. Cookie</h2>
<p>Utilizziamo cookie essenziali per l'autenticazione e la sicurezza. Per informazioni dettagliate, consulta la nostra <a href="/cookies?lang=it">Informativa sui Cookie</a>.</p>

<h2>10. Misure di Sicurezza</h2>
<p>Implementiamo misure tecniche e organizzative appropriate per proteggere i tuoi dati:</p>
<ul>
    <li>Crittografia dei dati sensibili a riposo (AES-256)</li>
    <li>Crittografia HTTPS per tutti i dati in transito</li>
    <li>Token OAuth crittografati a riposo</li>
    <li>Password hashate con bcrypt</li>
    <li>Audit di sicurezza regolari</li>
    <li>Controlli di accesso e logging</li>
    <li>Formazione dei dipendenti sulla protezione dei dati</li>
</ul>

<h2>11. Privacy dell'Estensione Browser</h2>
<p>L'estensione browser ReplyStack:</p>
<ul>
    <li>Si attiva solo sulle piattaforme di recensioni supportate (Google Business, TripAdvisor, ecc.)</li>
    <li>NON traccia la tua attività di navigazione generale</li>
    <li>NON raccoglie dati dalle pagine al di fuori delle piattaforme supportate</li>
    <li>Richiede permessi solo per le funzionalità (archiviazione, scheda attiva sui siti di recensioni)</li>
    <li>Elabora i dati delle recensioni localmente prima della sincronizzazione con il tuo account</li>
</ul>

<h2>12. Privacy dei Minori</h2>
<p>ReplyStack non è destinato a utenti di età inferiore ai 18 anni. Non raccogliamo consapevolmente dati personali di minori. Se ritieni che abbiamo raccolto dati di un minore, contattaci immediatamente.</p>

<h2>13. Modifiche a Questa Informativa</h2>
<p>Potremmo aggiornare questa Informativa sulla Privacy di tanto in tanto. Noi:</p>
<ul>
    <li>Ti notificheremo via email le modifiche sostanziali</li>
    <li>Forniremo un preavviso di 30 giorni prima dell'entrata in vigore delle modifiche</li>
    <li>Aggiorneremo la data di "Ultimo aggiornamento" in cima a questa pagina</li>
</ul>

<h2>14. Contatti e Reclami</h2>
<p>Per domande o reclami su questa informativa o sulle nostre pratiche relative ai dati:</p>
<ul>
    <li><strong>Email:</strong> <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
    <li><strong>Indirizzo:</strong> {{ $companyName }}, {{ $companyAddress }}</li>
</ul>

<p>Puoi anche contattare l'autorità di controllo competente:</p>
<ul>
    <li><strong>UE:</strong> La tua Autorità Garante per la Protezione dei Dati locale</li>
    <li><strong>Marocco:</strong> CNDP (Commission Nationale de contrôle de la protection des Données à caractère personnel)</li>
    <li><strong>California:</strong> Procuratore Generale della California</li>
    <li><strong>Brasile:</strong> ANPD (Autoridade Nacional de Proteção de Dados)</li>
</ul>
@endsection
