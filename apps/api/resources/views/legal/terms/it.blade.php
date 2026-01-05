@extends('legal.layouts.legal')

@section('title', 'Termini di Utilizzo')
@section('link_legal', 'Note Legali')
@section('link_terms', 'Termini di Utilizzo')
@section('link_sales', 'Condizioni di Vendita')
@section('link_privacy', 'Informativa sulla Privacy')
@section('link_cookies', 'Informativa sui Cookie')

@section('content')
<h1>Termini di Utilizzo</h1>
<p class="last-updated">{{ $translations['lastUpdated'] }}: {{ $lastUpdatedDate }}</p>

<div class="highlight-box">
    <strong>Importante:</strong> Utilizzando ReplyStack, accetti questi Termini di Utilizzo. Ti preghiamo di leggerli attentamente prima di utilizzare i nostri servizi.
</div>

<h2>1. Definizioni</h2>
<ul>
    <li><strong>"ReplyStack"</strong>, <strong>"noi"</strong>, <strong>"ci"</strong>, <strong>"nostro"</strong>: {{ $companyName }}, una {{ $companyForm }} registrata secondo il diritto marocchino, ICE {{ $companyId }}.</li>
    <li><strong>"Servizio"</strong>: La piattaforma ReplyStack inclusa l'applicazione web, la dashboard, l'estensione browser e tutte le funzionalità correlate.</li>
    <li><strong>"Utente"</strong>, <strong>"tu"</strong>, <strong>"tuo"</strong>: Qualsiasi persona fisica o giuridica che utilizza il Servizio.</li>
    <li><strong>"Contenuto"</strong>: Tutti i testi, dati, informazioni, recensioni, risposte e materiali caricati, generati o elaborati attraverso il Servizio.</li>
    <li><strong>"Contenuto Generato dall'IA"</strong>: Le risposte e i testi generati dal sistema di intelligenza artificiale integrato in ReplyStack.</li>
</ul>

<h2>2. Accettazione dei Termini</h2>
<p>Creando un account, installando l'estensione browser o utilizzando qualsiasi parte del Servizio, riconosci di aver letto, compreso e accettato di essere vincolato da questi Termini di Utilizzo.</p>
<p>Se non accetti questi termini, non devi utilizzare il Servizio.</p>

<h2>3. Descrizione del Servizio</h2>
<p>ReplyStack fornisce:</p>
<ul>
    <li>Generazione di risposte alle recensioni dei clienti assistita dall'IA</li>
    <li>Un'estensione browser per Chrome e Firefox per generare risposte direttamente sulle piattaforme di recensioni</li>
    <li>Una dashboard web per gestire le risposte, visualizzare le analisi e configurare le preferenze</li>
    <li>Integrazione con piattaforme di recensioni di terze parti (Google Business, TripAdvisor, ecc.)</li>
</ul>

<h2>4. Registrazione dell'Account</h2>

<h3>4.1 Idoneità</h3>
<p>Devi avere almeno 18 anni e avere la capacità legale di stipulare contratti per utilizzare il Servizio. Utilizzando ReplyStack, dichiari e garantisci di soddisfare questi requisiti.</p>

<h3>4.2 Informazioni dell'Account</h3>
<p>Ti impegni a:</p>
<ul>
    <li>Fornire informazioni accurate, attuali e complete durante la registrazione</li>
    <li>Mantenere e aggiornare tempestivamente le informazioni del tuo account</li>
    <li>Mantenere la tua password sicura e confidenziale</li>
    <li>Notificarci immediatamente qualsiasi uso non autorizzato del tuo account</li>
</ul>

<h3>4.3 Responsabilità dell'Account</h3>
<p>Sei responsabile di tutte le attività che si verificano sotto il tuo account. Non siamo responsabili di perdite o danni derivanti dall'uso non autorizzato del tuo account.</p>

<h2>5. Uso Accettabile</h2>

<h3>5.1 Usi Consentiti</h3>
<p>Puoi utilizzare il Servizio per:</p>
<ul>
    <li>Generare risposte assistite dall'IA a recensioni legittime dei clienti per la tua attività</li>
    <li>Gestire e monitorare le risposte alle recensioni</li>
    <li>Accedere alle analisi e agli approfondimenti sulla gestione delle tue recensioni</li>
</ul>

<h3>5.2 Usi Vietati</h3>
<p>Ti impegni a NON:</p>
<ul>
    <li>Utilizzare il Servizio per scopi illegali o in violazione di qualsiasi legge</li>
    <li>Generare risposte diffamatorie, abusive, moleste o discriminatorie</li>
    <li>Utilizzare il Servizio per ingannare i consumatori o pubblicare recensioni false</li>
    <li>Tentare di decompilare, disassemblare o fare reverse engineering del Servizio</li>
    <li>Utilizzare sistemi automatizzati (bot, scraper) per accedere al Servizio oltre l'uso normale</li>
    <li>Condividere le credenziali del tuo account con terzi</li>
    <li>Rivendere, ridistribuire o sublicenziare l'accesso al Servizio</li>
    <li>Interferire con o interrompere il Servizio o i server</li>
    <li>Aggirare qualsiasi limite di utilizzo o quota</li>
    <li>Utilizzare il Servizio per competere con ReplyStack</li>
</ul>

<h2>6. Contenuto Generato dall'IA</h2>

<h3>6.1 Natura delle Risposte IA</h3>
<p>Le risposte generate da ReplyStack sono prodotte dall'intelligenza artificiale. Sebbene miriamo all'accuratezza e alla qualità:</p>
<ul>
    <li>Il contenuto generato dall'IA può contenere errori o inesattezze</li>
    <li>Le risposte sono suggerimenti e devono essere riviste prima della pubblicazione</li>
    <li>Sei l'unico responsabile della revisione e approvazione di qualsiasi contenuto prima della pubblicazione</li>
</ul>

<h3>6.2 Responsabilità dell'Utente</h3>
<p>Riconosci e accetti che:</p>
<ul>
    <li>Rivedrai tutte le risposte generate dall'IA prima di pubblicarle</li>
    <li>Sei responsabile dell'accuratezza e dell'appropriatezza delle risposte pubblicate</li>
    <li>ReplyStack non è responsabile delle conseguenze derivanti dalle risposte pubblicate</li>
    <li>Non riterrai ReplyStack responsabile per danni derivanti dal contenuto generato dall'IA</li>
</ul>

<h2>7. Proprietà Intellettuale</h2>

<h3>7.1 Proprietà di ReplyStack</h3>
<p>Il Servizio, inclusi il suo design, le funzionalità, il codice e tutta la proprietà intellettuale correlata, è di proprietà di {{ $companyName }}. Ti viene concessa una licenza limitata, non esclusiva e non trasferibile per utilizzare il Servizio in conformità con questi Termini.</p>

<h3>7.2 Il Tuo Contenuto</h3>
<p>Mantieni la proprietà del tuo contenuto originale. Utilizzando il Servizio, ci concedi una licenza limitata per elaborare il tuo contenuto esclusivamente per fornire il Servizio.</p>

<h3>7.3 Risposte Generate dall'IA</h3>
<p>Puoi utilizzare le risposte generate dall'IA per le finalità della tua attività. Non rivendichiamo la proprietà del contenuto generato dall'IA creato per il tuo utilizzo.</p>

<h2>8. Servizi di Terze Parti</h2>

<h3>8.1 Integrazione delle Piattaforme</h3>
<p>Il Servizio si integra con piattaforme di terze parti (Google, Facebook, TripAdvisor, ecc.). Il tuo utilizzo di queste integrazioni è anche soggetto ai termini di servizio di tali piattaforme.</p>

<h3>8.2 Nessuna Approvazione</h3>
<p>L'integrazione con servizi di terze parti non costituisce un'approvazione da parte di ReplyStack. Non siamo responsabili della disponibilità, accuratezza o delle politiche dei servizi di terze parti.</p>

<h2>9. Disponibilità del Servizio</h2>

<h3>9.1 Uptime</h3>
<p>Ci impegniamo a mantenere un'alta disponibilità del Servizio ma non garantiamo un accesso ininterrotto. Il Servizio potrebbe essere temporaneamente non disponibile a causa di:</p>
<ul>
    <li>Manutenzione programmata (forniremo un preavviso quando possibile)</li>
    <li>Manutenzione di emergenza o aggiornamenti</li>
    <li>Fattori al di fuori del nostro controllo (interruzioni di internet, problemi di servizi di terze parti)</li>
</ul>

<h3>9.2 Modifiche</h3>
<p>Ci riserviamo il diritto di modificare, sospendere o interrompere qualsiasi parte del Servizio in qualsiasi momento. Forniremo un ragionevole preavviso per modifiche sostanziali.</p>

<h2>10. Limitazione di Responsabilità</h2>

<div class="warning-box">
    <p><strong>Importante:</strong> Nella misura massima consentita dalla legge:</p>
    <ul>
        <li>Il Servizio è fornito "COSÌ COM'È" e "COME DISPONIBILE" senza garanzie di alcun tipo</li>
        <li>Decliniamo tutte le garanzie implicite, inclusa la commerciabilità e l'idoneità per uno scopo particolare</li>
        <li>Non siamo responsabili per danni indiretti, incidentali, speciali, consequenziali o punitivi</li>
        <li>La nostra responsabilità totale non supererà l'importo che ci hai pagato nei 12 mesi precedenti il reclamo</li>
    </ul>
</div>

<h2>11. Indennizzo</h2>
<p>Accetti di indennizzare, difendere e manlevare ReplyStack, i suoi dirigenti, amministratori, dipendenti e agenti da qualsiasi reclamo, danno, perdita, responsabilità e spesa (incluse le spese legali) derivanti da:</p>
<ul>
    <li>Il tuo utilizzo del Servizio</li>
    <li>La tua violazione di questi Termini</li>
    <li>La tua violazione di diritti di terzi</li>
    <li>Il contenuto che pubblichi utilizzando il Servizio</li>
</ul>

<h2>12. Risoluzione</h2>

<h3>12.1 Risoluzione da Parte Tua</h3>
<p>Puoi risolvere il tuo account in qualsiasi momento contattandoci o utilizzando le impostazioni dell'account. Alla risoluzione, il tuo diritto di utilizzare il Servizio cesserà immediatamente.</p>

<h3>12.2 Risoluzione da Parte Nostra</h3>
<p>Possiamo sospendere o risolvere il tuo account se:</p>
<ul>
    <li>Violi questi Termini di Utilizzo</li>
    <li>Il tuo utilizzo presenta un rischio per la sicurezza</li>
    <li>Non paghi le tariffe applicabili</li>
    <li>Richiesto dalla legge o da un procedimento legale</li>
</ul>

<h3>12.3 Effetto della Risoluzione</h3>
<p>Alla risoluzione, tutte le licenze a te concesse termineranno e dovrai cessare di utilizzare il Servizio. Potremmo eliminare i tuoi dati in conformità con la nostra Informativa sulla Privacy.</p>

<h2>13. Legge Applicabile e Controversie</h2>
<p>Questi Termini sono regolati dalle leggi del Regno del Marocco. Qualsiasi controversia derivante da questi Termini o dal tuo utilizzo del Servizio sarà soggetta alla giurisdizione esclusiva dei tribunali di Marrakech, Marocco.</p>

<h2>14. Modifiche ai Termini</h2>
<p>Potremmo aggiornare questi Termini di tanto in tanto. Noi:</p>
<ul>
    <li>Ti notificheremo le modifiche sostanziali via email</li>
    <li>Forniremo almeno 30 giorni di preavviso prima che le modifiche entrino in vigore</li>
    <li>Aggiorneremo la data di "Ultimo aggiornamento" in cima a questa pagina</li>
</ul>
<p>L'uso continuato del Servizio dopo l'entrata in vigore delle modifiche costituisce l'accettazione dei nuovi Termini.</p>

<h2>15. Disposizioni Varie</h2>

<h3>15.1 Accordo Completo</h3>
<p>Questi Termini, insieme alla nostra Informativa sulla Privacy e alle Condizioni di Vendita, costituiscono l'intero accordo tra te e ReplyStack.</p>

<h3>15.2 Separabilità</h3>
<p>Se una disposizione di questi Termini risulta invalida o inapplicabile, le restanti disposizioni continueranno ad avere pieno vigore ed effetto.</p>

<h3>15.3 Rinuncia</h3>
<p>La nostra mancata applicazione di qualsiasi diritto o disposizione di questi Termini non costituisce una rinuncia a tale diritto o disposizione.</p>

<h3>15.4 Cessione</h3>
<p>Non puoi cedere o trasferire questi Termini senza il nostro previo consenso scritto. Possiamo cedere i nostri diritti e obblighi senza restrizioni.</p>

<h2>16. Contatti</h2>
<p>Per domande su questi Termini di Utilizzo:</p>
<ul>
    <li><strong>Email:</strong> <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
    <li><strong>Indirizzo:</strong> {{ $companyName }}, {{ $companyAddress }}</li>
</ul>
@endsection
