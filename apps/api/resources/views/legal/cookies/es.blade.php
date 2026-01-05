@extends('legal.layouts.legal')

@section('title', 'Política de Cookies')
@section('link_legal', 'Aviso Legal')
@section('link_terms', 'Condiciones de Uso')
@section('link_sales', 'Condiciones de Venta')
@section('link_privacy', 'Política de Privacidad')
@section('link_cookies', 'Política de Cookies')

@section('content')
<h1>Política de Cookies</h1>
<p class="last-updated">{{ $translations['lastUpdated'] }}: {{ $lastUpdatedDate }}</p>

<div class="highlight-box">
    <strong>Resumen:</strong> ReplyStack utiliza únicamente cookies esenciales necesarias para que el servicio funcione. No utilizamos cookies publicitarias ni de seguimiento.
</div>

<h2>1. ¿Qué son las Cookies?</h2>
<p>Las cookies son pequeños archivos de texto que se almacenan en su dispositivo (ordenador, tableta o smartphone) cuando visita un sitio web. Ayudan al sitio web a recordar sus acciones y preferencias a lo largo del tiempo.</p>

<h2>2. Nuestra Política de Cookies</h2>
<p>ReplyStack está comprometido con respetar su privacidad. Utilizamos un enfoque minimalista de cookies:</p>
<ul>
    <li>Solo utilizamos <strong>cookies estrictamente necesarias</strong> para que el servicio funcione</li>
    <li><strong>No</strong> utilizamos cookies publicitarias ni de marketing</li>
    <li><strong>No</strong> utilizamos cookies de seguimiento de terceros</li>
    <li><strong>No</strong> vendemos los datos recopilados a través de cookies</li>
</ul>

<h2>3. Cookies que Utilizamos</h2>

<h3>3.1 Cookies Esenciales</h3>
<p>Estas cookies son necesarias para que el sitio web funcione y no pueden ser desactivadas.</p>

<table>
    <thead>
        <tr>
            <th>Nombre de la Cookie</th>
            <th>Finalidad</th>
            <th>Duración</th>
            <th>Tipo</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>session</td>
            <td>Mantiene su sesión de inicio de sesión y seguridad</td>
            <td>Sesión / 2 horas</td>
            <td>Primera parte</td>
        </tr>
        <tr>
            <td>XSRF-TOKEN</td>
            <td>Protege contra ataques de falsificación de solicitudes entre sitios</td>
            <td>Sesión / 2 horas</td>
            <td>Primera parte</td>
        </tr>
        <tr>
            <td>remember_token</td>
            <td>Mantiene su sesión iniciada si elige "Recordarme"</td>
            <td>30 días</td>
            <td>Primera parte</td>
        </tr>
    </tbody>
</table>

<h3>3.2 Cookies Funcionales</h3>
<p>Estas cookies permiten funcionalidades personalizadas.</p>

<table>
    <thead>
        <tr>
            <th>Nombre de la Cookie</th>
            <th>Finalidad</th>
            <th>Duración</th>
            <th>Tipo</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>locale</td>
            <td>Recuerda su preferencia de idioma</td>
            <td>1 año</td>
            <td>Primera parte</td>
        </tr>
        <tr>
            <td>theme</td>
            <td>Recuerda su preferencia de tema de visualización (claro/oscuro)</td>
            <td>1 año</td>
            <td>Primera parte</td>
        </tr>
    </tbody>
</table>

<h3>3.3 Extensión del Navegador</h3>
<p>La extensión del navegador ReplyStack utiliza almacenamiento local (no cookies) para:</p>
<ul>
    <li>Almacenar su token de autenticación de forma segura</li>
    <li>Almacenar en caché sus preferencias para un acceso más rápido</li>
    <li>Recordar su última configuración utilizada</li>
</ul>
<p>Estos datos se almacenan localmente en su navegador y no se comparten con terceros.</p>

<h2>4. Cookies que NO Utilizamos</h2>

<p>Para ser claros, ReplyStack <strong>no</strong> utiliza:</p>
<ul>
    <li><strong>Cookies publicitarias:</strong> No mostramos anuncios y no le rastreamos con fines publicitarios</li>
    <li><strong>Cookies de análisis:</strong> No utilizamos Google Analytics ni herramientas de análisis similares de terceros</li>
    <li><strong>Cookies de redes sociales:</strong> No incorporamos seguimiento de redes sociales</li>
    <li><strong>Cookies de seguimiento de terceros:</strong> No permitimos que terceros coloquen cookies en nuestro sitio</li>
</ul>

<h2>5. Servicios de Terceros</h2>

<p>Cuando utiliza ciertas funcionalidades, puede interactuar con servicios de terceros que tienen sus propias políticas de cookies:</p>

<table>
    <thead>
        <tr>
            <th>Servicio</th>
            <th>Finalidad</th>
            <th>Su Política de Cookies</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Lemon Squeezy</td>
            <td>Procesamiento de pagos</td>
            <td><a href="https://www.lemonsqueezy.com/privacy" target="_blank">Ver Política</a></td>
        </tr>
        <tr>
            <td>Google OAuth</td>
            <td>Inicio de sesión con Google (opcional)</td>
            <td><a href="https://policies.google.com/privacy" target="_blank">Ver Política</a></td>
        </tr>
    </tbody>
</table>

<p>Estas cookies de terceros solo se establecen cuando utiliza explícitamente estos servicios (por ejemplo, durante el pago o el inicio de sesión OAuth).</p>

<h2>6. Gestión de Cookies</h2>

<h3>6.1 Configuración del Navegador</h3>
<p>Puede controlar las cookies a través de la configuración de su navegador:</p>
<ul>
    <li><strong>Chrome:</strong> Configuración → Privacidad y seguridad → Cookies</li>
    <li><strong>Firefox:</strong> Configuración → Privacidad y seguridad → Cookies</li>
    <li><strong>Safari:</strong> Preferencias → Privacidad → Cookies</li>
    <li><strong>Edge:</strong> Configuración → Cookies y permisos del sitio</li>
</ul>

<h3>6.2 Impacto de Desactivar las Cookies</h3>
<p>Si desactiva las cookies esenciales:</p>
<ul>
    <li>No podrá iniciar sesión en su cuenta</li>
    <li>Las funciones de seguridad de sesión no funcionarán</li>
    <li>El servicio podría no funcionar correctamente</li>
</ul>

<h2>7. Consentimiento de Cookies</h2>
<p>Según el RGPD y regulaciones similares, las cookies estrictamente necesarias no requieren consentimiento ya que son esenciales para que el servicio funcione. Dado que ReplyStack solo utiliza cookies esenciales:</p>
<ul>
    <li>No mostramos un banner de consentimiento de cookies para nuestras cookies esenciales</li>
    <li>Al usar nuestro servicio, reconoce el uso de estas cookies necesarias</li>
    <li>Siempre puede gestionar las cookies a través de la configuración de su navegador</li>
</ul>

<h2>8. Protección de Datos</h2>
<p>Los datos de las cookies se procesan de acuerdo con nuestra <a href="/privacy?lang=es">Política de Privacidad</a>. Garantizamos:</p>
<ul>
    <li>Todas las cookies se transmiten a través de HTTPS (cifradas)</li>
    <li>Las cookies de sesión utilizan las banderas secure y httpOnly</li>
    <li>Los datos de las cookies no se comparten con terceros con fines de marketing</li>
</ul>

<h2>9. Cambios en esta Política</h2>
<p>Podemos actualizar esta Política de Cookies de vez en cuando. Los cambios se publicarán en esta página con una fecha de revisión actualizada. Le notificaremos de cualquier cambio importante por correo electrónico.</p>

<h2>10. Contacto</h2>
<p>Si tiene preguntas sobre nuestro uso de cookies:</p>
<ul>
    <li><strong>Email:</strong> <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
    <li><strong>Dirección:</strong> {{ $companyName }}, {{ $companyAddress }}</li>
</ul>
@endsection
