@extends('legal.layouts.legal')

@section('title', 'Aviso Legal')
@section('link_legal', 'Aviso Legal')
@section('link_terms', 'Condiciones de Uso')
@section('link_sales', 'Condiciones de Venta')
@section('link_privacy', 'Política de Privacidad')
@section('link_cookies', 'Política de Cookies')

@section('content')
<h1>Aviso Legal</h1>
<p class="last-updated">{{ $translations['lastUpdated'] }}: {{ $lastUpdatedDate }}</p>

<h2>1. Editor del Sitio Web</h2>
<p>Este sitio web es publicado por:</p>
<ul>
    <li><strong>Razón Social:</strong> {{ $companyName }}</li>
    <li><strong>Nombre Comercial:</strong> {{ $commercialName }}</li>
    <li><strong>Forma Jurídica:</strong> {{ $companyForm }} (Sociedad Anónima bajo la Ley Marroquí)</li>
    <li><strong>ICE (Identifiant Commun de l'Entreprise):</strong> {{ $companyId }}</li>
    <li><strong>Domicilio Social:</strong> {{ $companyAddress }}</li>
    <li><strong>Email:</strong> <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
</ul>

<h2>2. Director de Publicación</h2>
<p>El Director de Publicación responsable del contenido de este sitio web es:</p>
<ul>
    <li><strong>Nombre:</strong> {{ $directorName }}</li>
    <li><strong>Cargo:</strong> {{ $directorTitle }}</li>
    <li><strong>Contacto:</strong> <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
</ul>

<h2>3. Alojamiento</h2>
<p>Este sitio web está alojado por:</p>

<h3>3.1 API (Backend)</h3>
<ul>
    <li><strong>Proveedor:</strong> Railway Corporation</li>
    <li><strong>Dirección:</strong> 548 Market St, PMB 65883, San Francisco, CA 94104, USA</li>
    <li><strong>Sitio web:</strong> <a href="https://railway.app" target="_blank">railway.app</a></li>
</ul>

<h3>3.2 Aplicación Web (Frontend)</h3>
<ul>
    <li><strong>Proveedor:</strong> Vercel Inc.</li>
    <li><strong>Dirección:</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</li>
    <li><strong>Sitio web:</strong> <a href="https://vercel.com" target="_blank">vercel.com</a></li>
</ul>

<h2>4. Propiedad Intelectual</h2>

<h3>4.1 Marcas</h3>
<p>ReplyStack® y el logotipo de ReplyStack son marcas registradas de {{ $companyName }}. Queda prohibida cualquier reproducción, imitación o uso no autorizado de estas marcas.</p>

<h3>4.2 Contenido del Sitio Web</h3>
<p>Todo el contenido de este sitio web (textos, imágenes, gráficos, logotipos, iconos, sonidos, software, etc.) es propiedad exclusiva de {{ $companyName }} o de sus socios y está protegido por las leyes de propiedad intelectual.</p>
<p>Queda prohibida cualquier reproducción, representación, modificación, publicación o adaptación de la totalidad o parte de los elementos del sitio sin autorización previa por escrito de {{ $companyName }}.</p>

<h3>4.3 Software</h3>
<p>La plataforma ReplyStack, incluyendo la aplicación web y la extensión del navegador, es software propietario. El código fuente, los algoritmos y la tecnología subyacente están protegidos por derechos de propiedad intelectual.</p>

<h2>5. Contenido Generado por el Usuario</h2>
<p>Los usuarios pueden generar contenido a través del Servicio (como respuestas generadas por IA). Los usuarios conservan los derechos sobre su contenido original pero otorgan a {{ $companyName }} una licencia para procesar dicho contenido con fines de prestación del servicio, según se describe en nuestras Condiciones de Uso.</p>

<h2>6. Limitación de Responsabilidad</h2>

<h3>6.1 Información del Sitio Web</h3>
<p>{{ $companyName }} se esfuerza por garantizar que la información disponible en este sitio web sea precisa y esté actualizada. Sin embargo, no podemos garantizar la exactitud, integridad o actualidad de la información proporcionada. Nos reservamos el derecho de modificar el contenido en cualquier momento sin previo aviso.</p>

<h3>6.2 Enlaces Externos</h3>
<p>Este sitio web puede contener enlaces a sitios web de terceros. {{ $companyName }} no tiene control sobre el contenido de estos sitios externos y declina toda responsabilidad por su contenido, incluyendo cualquier producto, servicio o información que puedan ofrecer.</p>

<h3>6.3 Contenido Generado por IA</h3>
<p>Las respuestas generadas por la inteligencia artificial de ReplyStack son únicamente sugerencias. Los usuarios son los únicos responsables de revisar y aprobar cualquier contenido antes de su publicación. {{ $companyName }} no es responsable de las consecuencias de publicar contenido generado por IA.</p>

<h2>7. Ley Aplicable</h2>
<p>Este sitio web y su contenido se rigen por las leyes del Reino de Marruecos. Cualquier disputa relacionada con el uso de este sitio web estará sujeta a la jurisdicción exclusiva de los tribunales de Marrakech, Marruecos.</p>

<h2>8. Protección de Datos</h2>
<p>Los datos personales recopilados a través de este sitio web se procesan de acuerdo con las leyes de protección de datos aplicables, incluyendo:</p>
<ul>
    <li>La Ley marroquí 09-08 relativa a la protección de las personas físicas en lo que respecta al tratamiento de datos personales</li>
    <li>El Reglamento General de Protección de Datos (RGPD) de la UE para usuarios europeos</li>
    <li>La Ley de Privacidad del Consumidor de California (CCPA) para residentes de California</li>
    <li>La Ley General de Protección de Datos (LGPD) de Brasil para usuarios brasileños</li>
</ul>
<p>Para más información, consulte nuestra <a href="/privacy?lang=es">Política de Privacidad</a>.</p>

<h2>9. Accesibilidad</h2>
<p>Nos esforzamos por hacer nuestro sitio web accesible para todos los usuarios. Si encuentra algún problema de accesibilidad, por favor contáctenos en <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a>.</p>

<h2>10. Créditos</h2>
<p>Diseño y desarrollo del sitio web: {{ $companyName }}</p>

<h2>11. Contacto</h2>
<p>Para cualquier pregunta sobre este aviso legal:</p>
<ul>
    <li><strong>Email:</strong> <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
    <li><strong>Dirección:</strong> {{ $companyName }}, {{ $companyAddress }}</li>
</ul>
@endsection
