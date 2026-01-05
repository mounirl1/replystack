@extends('legal.layouts.legal')

@section('title', 'Condizioni di Vendita')
@section('link_legal', 'Note Legali')
@section('link_terms', 'Termini di Utilizzo')
@section('link_sales', 'Condizioni di Vendita')
@section('link_privacy', 'Informativa sulla Privacy')
@section('link_cookies', 'Informativa sui Cookie')

@section('content')
<h1>Condizioni Generali di Vendita</h1>
<p class="last-updated">{{ $translations['lastUpdated'] }}: {{ $lastUpdatedDate }}</p>

<div class="highlight-box">
    <strong>Avviso:</strong> Queste Condizioni di Vendita regolano tutti gli acquisti di abbonamenti ai servizi ReplyStack. Sottoscrivendo un abbonamento, accetti queste condizioni.
</div>

<h2>1. Informazioni sul Venditore</h2>
<ul>
    <li><strong>Azienda:</strong> {{ $companyName }}</li>
    <li><strong>Forma Giuridica:</strong> {{ $companyForm }} (Diritto Marocchino)</li>
    <li><strong>ICE:</strong> {{ $companyId }}</li>
    <li><strong>Indirizzo:</strong> {{ $companyAddress }}</li>
    <li><strong>Email:</strong> <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
    <li><strong>Rappresentante:</strong> {{ $directorName }}, {{ $directorTitle }}</li>
</ul>

<h2>2. Ambito di Applicazione</h2>
<p>Queste Condizioni di Vendita si applicano a tutti gli acquisti di abbonamenti effettuati tramite la piattaforma ReplyStack (replystack.io). Completando un acquisto, stipuli un contratto vincolante con {{ $companyName }}.</p>

<h2>3. Prodotti e Servizi</h2>

<h3>3.1 Descrizione del Servizio</h3>
<p>ReplyStack offre piani di abbonamento per la generazione di risposte alle recensioni assistita dall'IA:</p>
<ul>
    <li><strong>Piano Gratuito:</strong> Risposte giornaliere limitate, funzionalità di base</li>
    <li><strong>Piano Starter:</strong> Quota mensile di risposte, accesso alla dashboard</li>
    <li><strong>Piano Pro:</strong> Risposte illimitate, funzionalità avanzate, analisi</li>
    <li><strong>Piano Business:</strong> Supporto multi-sede, funzionalità team, supporto prioritario</li>
    <li><strong>Piano Enterprise:</strong> Soluzioni personalizzate, supporto dedicato, accesso API</li>
</ul>

<h3>3.2 Disponibilità del Servizio</h3>
<p>Il nostro servizio è disponibile in tutto il mondo. Alcune funzionalità potrebbero variare a seconda della regione a causa di vincoli normativi o tecnici.</p>

<h2>4. Prezzi</h2>

<h3>4.1 Informazioni sui Prezzi</h3>
<p>Tutti i prezzi sono visualizzati in Euro (EUR) e sono al netto delle imposte applicabili salvo diversa indicazione. I prezzi attuali sono disponibili sul nostro sito web su replystack.io/pricing.</p>

<h3>4.2 Modifiche dei Prezzi</h3>
<p>Ci riserviamo il diritto di modificare i nostri prezzi in qualsiasi momento. Le modifiche dei prezzi:</p>
<ul>
    <li>Saranno annunciate con almeno 30 giorni di anticipo</li>
    <li>Non influenzeranno gli abbonamenti attivi fino al rinnovo</li>
    <li>Saranno comunicate via email ai clienti esistenti</li>
</ul>

<h2>5. Pagamento</h2>

<h3>5.1 Metodi di Pagamento</h3>
<p>I pagamenti sono elaborati tramite il nostro fornitore di pagamenti, Lemon Squeezy. I metodi di pagamento accettati includono:</p>
<ul>
    <li>Carte di credito e debito (Visa, Mastercard, American Express)</li>
    <li>PayPal (dove disponibile)</li>
    <li>Altri metodi supportati dal nostro fornitore di pagamenti</li>
</ul>

<h3>5.2 Elaborazione dei Pagamenti</h3>
<p>Tutte le informazioni di pagamento sono elaborate in modo sicuro da Lemon Squeezy. Non memorizziamo i dettagli della tua carta di credito. Lemon Squeezy è conforme PCI-DSS.</p>

<h3>5.3 Ciclo di Fatturazione</h3>
<ul>
    <li><strong>Abbonamenti mensili:</strong> Fatturati lo stesso giorno ogni mese</li>
    <li><strong>Abbonamenti annuali:</strong> Fatturati una volta all'anno con lo sconto applicabile</li>
</ul>

<h3>5.4 Pagamenti Non Riusciti</h3>
<p>Se un pagamento non riesce:</p>
<ul>
    <li>Tenteremo di elaborare nuovamente il pagamento entro 3 giorni lavorativi</li>
    <li>Sarai notificato via email del pagamento non riuscito</li>
    <li>Se il pagamento non può essere elaborato dopo 3 tentativi, il tuo abbonamento potrebbe essere sospeso</li>
</ul>

<h2>6. Abbonamento e Rinnovo</h2>

<h3>6.1 Rinnovo Automatico</h3>
<p>Tutti gli abbonamenti si rinnovano automaticamente alla fine di ogni periodo di fatturazione salvo cancellazione. Abbonandoti, ci autorizzi ad addebitare il tuo metodo di pagamento per pagamenti ricorrenti.</p>

<h3>6.2 Cancellazione</h3>
<p>Puoi cancellare il tuo abbonamento in qualsiasi momento attraverso:</p>
<ul>
    <li>Le impostazioni del tuo account nella dashboard ReplyStack</li>
    <li>Contattando il nostro supporto a <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
</ul>
<p>La cancellazione ha effetto alla fine del periodo di fatturazione corrente. Manterrai l'accesso alle funzionalità a pagamento fino ad allora.</p>

<h3>6.3 Downgrade</h3>
<p>Puoi passare a un piano inferiore in qualsiasi momento. Il cambiamento avrà effetto all'inizio del tuo prossimo periodo di fatturazione.</p>

<h2>7. Diritto di Recesso (Periodo di Riflessione)</h2>

<div class="jurisdiction-notice">
    <h3>7.1 Per i Consumatori dell'UE/SEE</h3>
    <p>Ai sensi delle leggi europee sulla protezione dei consumatori, hai il diritto di recedere da questo contratto entro 14 giorni senza fornire alcuna motivazione.</p>
    <p>Il periodo di recesso scade 14 giorni dopo il giorno della conclusione del contratto.</p>
    <p>Per esercitare il diritto di recesso, devi informarci della tua decisione con una dichiarazione chiara (email a <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a>).</p>

    <h4>Eccezioni</h4>
    <p>Il diritto di recesso non si applica se:</p>
    <ul>
        <li>Hai espressamente acconsentito all'inizio del servizio durante il periodo di recesso</li>
        <li>Hai riconosciuto che perderai il tuo diritto di recesso una volta che il servizio sarà completamente eseguito</li>
        <li>Il servizio è stato completamente eseguito con il tuo previo consenso espresso</li>
    </ul>

    <h4>Effetti del Recesso</h4>
    <p>Se recedi da questo contratto, ti rimborseremo tutti i pagamenti ricevuti da te senza indebito ritardo e in ogni caso non oltre 14 giorni dal giorno in cui abbiamo ricevuto notifica del tuo recesso.</p>
</div>

<h3>7.2 Per Altre Giurisdizioni</h3>
<p>Per i clienti al di fuori dell'UE/SEE, le politiche di rimborso sono regolate dalla Sezione 8 di queste Condizioni.</p>

<h2>8. Politica di Rimborso</h2>

<h3>8.1 Politica Generale</h3>
<p>A causa della natura digitale dei nostri servizi:</p>
<ul>
    <li>I rimborsi generalmente non vengono forniti per periodi di abbonamento già iniziati</li>
    <li>Valutiamo le richieste di rimborso caso per caso per problemi tecnici o malfunzionamenti del servizio</li>
</ul>

<h3>8.2 Richiedere un Rimborso</h3>
<p>Per richiedere un rimborso:</p>
<ol>
    <li>Contattaci a <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
    <li>Includi l'email del tuo account e il motivo della richiesta</li>
    <li>Risponderemo entro 5 giorni lavorativi</li>
</ol>

<h3>8.3 Rimborsi Approvati</h3>
<p>Se un rimborso viene approvato:</p>
<ul>
    <li>Il rimborso sarà elaborato sul tuo metodo di pagamento originale</li>
    <li>Il tempo di elaborazione è tipicamente di 5-10 giorni lavorativi</li>
    <li>Il tuo abbonamento sarà cancellato</li>
</ul>

<h2>9. Imposte</h2>

<h3>9.1 IVA e Imposte sulle Vendite</h3>
<p>I prezzi possono essere soggetti all'Imposta sul Valore Aggiunto (IVA) o altre imposte applicabili a seconda della tua posizione. Il nostro fornitore di pagamenti calcolerà e applicherà l'aliquota fiscale corretta in base al tuo indirizzo di fatturazione.</p>

<h3>9.2 Fatture</h3>
<p>Le fatture vengono generate automaticamente e inviate al tuo indirizzo email registrato dopo ogni pagamento. Puoi anche scaricare le fatture dalla tua dashboard.</p>

<h2>10. Livello di Servizio</h2>

<h3>10.1 Disponibilità</h3>
<p>Puntiamo a un uptime del 99,9% per i nostri servizi. La manutenzione programmata sarà annunciata in anticipo quando possibile.</p>

<h3>10.2 Supporto</h3>
<table>
    <thead>
        <tr>
            <th>Piano</th>
            <th>Livello di Supporto</th>
            <th>Tempo di Risposta</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Gratuito</td>
            <td>Supporto via email</td>
            <td>72 ore</td>
        </tr>
        <tr>
            <td>Starter</td>
            <td>Supporto via email</td>
            <td>48 ore</td>
        </tr>
        <tr>
            <td>Pro</td>
            <td>Supporto email prioritario</td>
            <td>24 ore</td>
        </tr>
        <tr>
            <td>Business</td>
            <td>Supporto prioritario</td>
            <td>12 ore</td>
        </tr>
        <tr>
            <td>Enterprise</td>
            <td>Supporto dedicato</td>
            <td>4 ore</td>
        </tr>
    </tbody>
</table>

<h2>11. Limitazione di Responsabilità</h2>
<p>La nostra responsabilità per qualsiasi reclamo derivante dal servizio di abbonamento è limitata all'importo che ci hai pagato nei 12 mesi precedenti il reclamo. Non siamo responsabili per danni indiretti, incidentali o consequenziali.</p>

<h2>12. Risoluzione delle Controversie</h2>

<h3>12.1 Contattaci Prima</h3>
<p>Se hai un reclamo o una controversia, contattaci prima a <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a>. Lavoreremo per risolvere il problema entro 30 giorni.</p>

<h3>12.2 Risoluzione delle Controversie Online (UE)</h3>
<p>Per i consumatori dell'UE: La Commissione Europea fornisce una piattaforma per la risoluzione delle controversie online su <a href="https://ec.europa.eu/consumers/odr" target="_blank">https://ec.europa.eu/consumers/odr</a></p>

<h3>12.3 Legge Applicabile</h3>
<p>Queste Condizioni di Vendita sono regolate dalle leggi del Regno del Marocco. Le controversie saranno soggette alla giurisdizione esclusiva dei tribunali di Marrakech, Marocco, salvo dove le leggi obbligatorie sulla protezione dei consumatori dispongano diversamente.</p>

<h2>13. Modifiche alle Condizioni</h2>
<p>Potremmo aggiornare queste Condizioni di Vendita. Le modifiche saranno annunciate con 30 giorni di anticipo e non influenzeranno gli abbonamenti esistenti fino al rinnovo.</p>

<h2>14. Contatti</h2>
<p>Per domande su acquisti, fatturazione o queste Condizioni di Vendita:</p>
<ul>
    <li><strong>Email:</strong> <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
    <li><strong>Indirizzo:</strong> {{ $companyName }}, {{ $companyAddress }}</li>
</ul>
@endsection
