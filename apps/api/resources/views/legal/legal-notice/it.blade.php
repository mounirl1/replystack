@extends('legal.layouts.legal')

@section('title', 'Note Legali')
@section('link_legal', 'Note Legali')
@section('link_terms', 'Termini di Utilizzo')
@section('link_sales', 'Condizioni di Vendita')
@section('link_privacy', 'Informativa sulla Privacy')
@section('link_cookies', 'Informativa sui Cookie')

@section('content')
<h1>Note Legali</h1>
<p class="last-updated">{{ $translations['lastUpdated'] }}: {{ $lastUpdatedDate }}</p>

<h2>1. Editore del Sito Web</h2>
<p>Questo sito web è pubblicato da:</p>
<ul>
    <li><strong>Ragione Sociale:</strong> {{ $companyName }}</li>
    <li><strong>Nome Commerciale:</strong> {{ $commercialName }}</li>
    <li><strong>Forma Giuridica:</strong> {{ $companyForm }} (Società per Azioni secondo il diritto marocchino)</li>
    <li><strong>ICE (Identifiant Commun de l'Entreprise):</strong> {{ $companyId }}</li>
    <li><strong>Sede Legale:</strong> {{ $companyAddress }}</li>
    <li><strong>Email:</strong> <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
</ul>

<h2>2. Direttore Responsabile</h2>
<p>Il Direttore Responsabile del contenuto di questo sito web è:</p>
<ul>
    <li><strong>Nome:</strong> {{ $directorName }}</li>
    <li><strong>Posizione:</strong> {{ $directorTitle }}</li>
    <li><strong>Contatto:</strong> <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
</ul>

<h2>3. Hosting</h2>
<p>Questo sito web è ospitato da:</p>

<h3>3.1 API (Backend)</h3>
<ul>
    <li><strong>Provider:</strong> Railway Corporation</li>
    <li><strong>Indirizzo:</strong> 548 Market St, PMB 65883, San Francisco, CA 94104, USA</li>
    <li><strong>Sito web:</strong> <a href="https://railway.app" target="_blank">railway.app</a></li>
</ul>

<h3>3.2 Applicazione Web (Frontend)</h3>
<ul>
    <li><strong>Provider:</strong> Vercel Inc.</li>
    <li><strong>Indirizzo:</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</li>
    <li><strong>Sito web:</strong> <a href="https://vercel.com" target="_blank">vercel.com</a></li>
</ul>

<h2>4. Proprietà Intellettuale</h2>

<h3>4.1 Marchi</h3>
<p>ReplyStack® e il logo ReplyStack sono marchi registrati di {{ $companyName }}. È vietata qualsiasi riproduzione, imitazione o uso non autorizzato di questi marchi.</p>

<h3>4.2 Contenuto del Sito Web</h3>
<p>Tutto il contenuto di questo sito web (testi, immagini, grafici, loghi, icone, suoni, software, ecc.) è di proprietà esclusiva di {{ $companyName }} o dei suoi partner ed è protetto dalle leggi sulla proprietà intellettuale.</p>
<p>È vietata qualsiasi riproduzione, rappresentazione, modifica, pubblicazione o adattamento di tutto o parte degli elementi del sito senza previa autorizzazione scritta di {{ $companyName }}.</p>

<h3>4.3 Software</h3>
<p>La piattaforma ReplyStack, inclusa l'applicazione web e l'estensione browser, è software proprietario. Il codice sorgente, gli algoritmi e la tecnologia sottostante sono protetti dai diritti di proprietà intellettuale.</p>

<h2>5. Contenuto Generato dagli Utenti</h2>
<p>Gli utenti possono generare contenuti attraverso il Servizio (come risposte generate dall'IA). Gli utenti mantengono i diritti sui loro contenuti originali ma concedono a {{ $companyName }} una licenza per elaborare tali contenuti ai fini della fornitura del servizio, come descritto nei nostri Termini di Utilizzo.</p>

<h2>6. Limitazione di Responsabilità</h2>

<h3>6.1 Informazioni del Sito Web</h3>
<p>{{ $companyName }} si impegna a garantire che le informazioni disponibili su questo sito web siano accurate e aggiornate. Tuttavia, non possiamo garantire l'accuratezza, la completezza o l'attualità delle informazioni fornite. Ci riserviamo il diritto di modificare il contenuto in qualsiasi momento senza preavviso.</p>

<h3>6.2 Link Esterni</h3>
<p>Questo sito web può contenere link a siti web di terze parti. {{ $companyName }} non ha alcun controllo sul contenuto di questi siti esterni e declina ogni responsabilità per il loro contenuto, inclusi eventuali prodotti, servizi o informazioni che possono offrire.</p>

<h3>6.3 Contenuto Generato dall'IA</h3>
<p>Le risposte generate dall'intelligenza artificiale di ReplyStack sono solo suggerimenti. Gli utenti sono gli unici responsabili della revisione e approvazione di qualsiasi contenuto prima della pubblicazione. {{ $companyName }} non è responsabile delle conseguenze della pubblicazione di contenuti generati dall'IA.</p>

<h2>7. Legge Applicabile</h2>
<p>Questo sito web e il suo contenuto sono regolati dalle leggi del Regno del Marocco. Qualsiasi controversia relativa all'uso di questo sito web sarà soggetta alla giurisdizione esclusiva dei tribunali di Marrakech, Marocco.</p>

<h2>8. Protezione dei Dati</h2>
<p>I dati personali raccolti attraverso questo sito web sono trattati in conformità con le leggi applicabili sulla protezione dei dati, tra cui:</p>
<ul>
    <li>La Legge marocchina 09-08 sulla protezione delle persone fisiche rispetto al trattamento dei dati personali</li>
    <li>Il Regolamento Generale sulla Protezione dei Dati (GDPR) dell'UE per gli utenti europei</li>
    <li>Il California Consumer Privacy Act (CCPA) per i residenti della California</li>
    <li>La Lei Geral de Proteção de Dados (LGPD) del Brasile per gli utenti brasiliani</li>
</ul>
<p>Per maggiori informazioni, consulta la nostra <a href="/privacy?lang=it">Informativa sulla Privacy</a>.</p>

<h2>9. Accessibilità</h2>
<p>Ci impegniamo a rendere il nostro sito web accessibile a tutti gli utenti. Se riscontri problemi di accessibilità, contattaci all'indirizzo <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a>.</p>

<h2>10. Crediti</h2>
<p>Design e sviluppo del sito web: {{ $companyName }}</p>

<h2>11. Contatti</h2>
<p>Per qualsiasi domanda riguardante queste note legali:</p>
<ul>
    <li><strong>Email:</strong> <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
    <li><strong>Indirizzo:</strong> {{ $companyName }}, {{ $companyAddress }}</li>
</ul>
@endsection
