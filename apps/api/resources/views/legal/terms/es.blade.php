@extends('legal.layouts.legal')

@section('title', 'Condiciones de Uso')
@section('link_legal', 'Aviso Legal')
@section('link_terms', 'Condiciones de Uso')
@section('link_sales', 'Condiciones de Venta')
@section('link_privacy', 'Política de Privacidad')
@section('link_cookies', 'Política de Cookies')

@section('content')
<h1>Condiciones de Uso</h1>
<p class="last-updated">{{ $translations['lastUpdated'] }}: {{ $lastUpdatedDate }}</p>

<div class="highlight-box">
    <strong>Importante:</strong> Al usar ReplyStack, acepta estas Condiciones de Uso. Por favor, léalas atentamente antes de usar nuestros servicios.
</div>

<h2>1. Definiciones</h2>
<ul>
    <li><strong>"ReplyStack"</strong>, <strong>"nosotros"</strong>, <strong>"nos"</strong>, <strong>"nuestro"</strong>: {{ $companyName }}, una {{ $companyForm }} registrada bajo la ley marroquí, ICE {{ $companyId }}.</li>
    <li><strong>"Servicio"</strong>: La plataforma ReplyStack incluyendo la aplicación web, el panel de control, la extensión del navegador y todas las funcionalidades relacionadas.</li>
    <li><strong>"Usuario"</strong>, <strong>"usted"</strong>, <strong>"su"</strong>: Cualquier persona física o jurídica que utilice el Servicio.</li>
    <li><strong>"Contenido"</strong>: Todo texto, dato, información, reseña, respuesta y material cargado, generado o procesado a través del Servicio.</li>
    <li><strong>"Contenido Generado por IA"</strong>: Las respuestas y textos generados por el sistema de inteligencia artificial integrado en ReplyStack.</li>
</ul>

<h2>2. Aceptación de las Condiciones</h2>
<p>Al crear una cuenta, instalar la extensión del navegador o usar cualquier parte del Servicio, reconoce que ha leído, entendido y acepta quedar vinculado por estas Condiciones de Uso.</p>
<p>Si no acepta estas condiciones, no debe usar el Servicio.</p>

<h2>3. Descripción del Servicio</h2>
<p>ReplyStack proporciona:</p>
<ul>
    <li>Generación de respuestas a reseñas de clientes asistida por IA</li>
    <li>Una extensión de navegador para Chrome y Firefox para generar respuestas directamente en las plataformas de reseñas</li>
    <li>Un panel web para gestionar respuestas, ver análisis y configurar preferencias</li>
    <li>Integración con plataformas de reseñas de terceros (Google Business, TripAdvisor, etc.)</li>
</ul>

<h2>4. Registro de Cuenta</h2>

<h3>4.1 Elegibilidad</h3>
<p>Debe tener al menos 18 años y tener la capacidad legal para celebrar contratos para usar el Servicio. Al usar ReplyStack, declara y garantiza que cumple estos requisitos.</p>

<h3>4.2 Información de la Cuenta</h3>
<p>Usted se compromete a:</p>
<ul>
    <li>Proporcionar información precisa, actual y completa durante el registro</li>
    <li>Mantener y actualizar prontamente la información de su cuenta</li>
    <li>Mantener su contraseña segura y confidencial</li>
    <li>Notificarnos inmediatamente de cualquier uso no autorizado de su cuenta</li>
</ul>

<h3>4.3 Responsabilidad de la Cuenta</h3>
<p>Usted es responsable de todas las actividades que ocurran bajo su cuenta. No somos responsables de ninguna pérdida o daño derivado del uso no autorizado de su cuenta.</p>

<h2>5. Uso Aceptable</h2>

<h3>5.1 Usos Permitidos</h3>
<p>Puede usar el Servicio para:</p>
<ul>
    <li>Generar respuestas asistidas por IA a reseñas legítimas de clientes de su negocio</li>
    <li>Gestionar y hacer seguimiento de las respuestas a reseñas</li>
    <li>Acceder a análisis e información sobre su gestión de reseñas</li>
</ul>

<h3>5.2 Usos Prohibidos</h3>
<p>Usted se compromete a NO:</p>
<ul>
    <li>Usar el Servicio para fines ilegales o en violación de cualquier ley</li>
    <li>Generar respuestas difamatorias, abusivas, acosadoras o discriminatorias</li>
    <li>Usar el Servicio para engañar a los consumidores o publicar reseñas falsas</li>
    <li>Intentar realizar ingeniería inversa, descompilar o desensamblar el Servicio</li>
    <li>Usar sistemas automatizados (bots, scrapers) para acceder al Servicio más allá del uso normal</li>
    <li>Compartir sus credenciales de cuenta con terceros</li>
    <li>Revender, redistribuir o sublicenciar el acceso al Servicio</li>
    <li>Interferir con o interrumpir el Servicio o los servidores</li>
    <li>Eludir cualquier límite de uso o cuotas</li>
    <li>Usar el Servicio para competir con ReplyStack</li>
</ul>

<h2>6. Contenido Generado por IA</h2>

<h3>6.1 Naturaleza de las Respuestas IA</h3>
<p>Las respuestas generadas por ReplyStack son producidas por inteligencia artificial. Aunque buscamos la precisión y calidad:</p>
<ul>
    <li>El contenido generado por IA puede contener errores o inexactitudes</li>
    <li>Las respuestas son sugerencias y deben ser revisadas antes de su publicación</li>
    <li>Usted es el único responsable de revisar y aprobar cualquier contenido antes de su publicación</li>
</ul>

<h3>6.2 Responsabilidad del Usuario</h3>
<p>Usted reconoce y acepta que:</p>
<ul>
    <li>Revisará todas las respuestas generadas por IA antes de publicarlas</li>
    <li>Es responsable de la precisión e idoneidad de las respuestas publicadas</li>
    <li>ReplyStack no es responsable de las consecuencias derivadas de las respuestas publicadas</li>
    <li>No responsabilizará a ReplyStack por daños resultantes del contenido generado por IA</li>
</ul>

<h2>7. Propiedad Intelectual</h2>

<h3>7.1 Propiedad de ReplyStack</h3>
<p>El Servicio, incluyendo su diseño, funcionalidades, código y toda la propiedad intelectual relacionada, es propiedad de {{ $companyName }}. Se le concede una licencia limitada, no exclusiva e intransferible para usar el Servicio de acuerdo con estas Condiciones.</p>

<h3>7.2 Su Contenido</h3>
<p>Usted conserva la propiedad de su contenido original. Al usar el Servicio, nos concede una licencia limitada para procesar su contenido únicamente para proporcionar el Servicio.</p>

<h3>7.3 Respuestas Generadas por IA</h3>
<p>Puede usar las respuestas generadas por IA para los fines de su negocio. No reclamamos la propiedad del contenido generado por IA creado para su uso.</p>

<h2>8. Servicios de Terceros</h2>

<h3>8.1 Integración de Plataformas</h3>
<p>El Servicio se integra con plataformas de terceros (Google, Facebook, TripAdvisor, etc.). Su uso de estas integraciones también está sujeto a los términos de servicio de esas plataformas.</p>

<h3>8.2 Sin Respaldo</h3>
<p>La integración con servicios de terceros no constituye un respaldo por parte de ReplyStack. No somos responsables de la disponibilidad, precisión o políticas de los servicios de terceros.</p>

<h2>9. Disponibilidad del Servicio</h2>

<h3>9.1 Tiempo de Actividad</h3>
<p>Nos esforzamos por mantener una alta disponibilidad del Servicio pero no garantizamos acceso ininterrumpido. El Servicio puede estar temporalmente no disponible debido a:</p>
<ul>
    <li>Mantenimiento programado (proporcionaremos aviso previo cuando sea posible)</li>
    <li>Mantenimiento de emergencia o actualizaciones</li>
    <li>Factores fuera de nuestro control (cortes de internet, problemas de servicios de terceros)</li>
</ul>

<h3>9.2 Modificaciones</h3>
<p>Nos reservamos el derecho de modificar, suspender o descontinuar cualquier parte del Servicio en cualquier momento. Proporcionaremos un aviso razonable para cambios importantes.</p>

<h2>10. Limitación de Responsabilidad</h2>

<div class="warning-box">
    <p><strong>Importante:</strong> En la máxima medida permitida por la ley:</p>
    <ul>
        <li>El Servicio se proporciona "TAL CUAL" y "SEGÚN DISPONIBILIDAD" sin garantías de ningún tipo</li>
        <li>Renunciamos a todas las garantías implícitas, incluyendo comerciabilidad e idoneidad para un propósito particular</li>
        <li>No somos responsables de daños indirectos, incidentales, especiales, consecuentes o punitivos</li>
        <li>Nuestra responsabilidad total no excederá la cantidad que nos haya pagado en los 12 meses anteriores a la reclamación</li>
    </ul>
</div>

<h2>11. Indemnización</h2>
<p>Usted acepta indemnizar, defender y mantener indemne a ReplyStack, sus directivos, administradores, empleados y agentes de cualquier reclamación, daño, pérdida, responsabilidad y gasto (incluyendo honorarios legales) derivados de:</p>
<ul>
    <li>Su uso del Servicio</li>
    <li>Su violación de estas Condiciones</li>
    <li>Su violación de derechos de terceros</li>
    <li>El contenido que publique usando el Servicio</li>
</ul>

<h2>12. Terminación</h2>

<h3>12.1 Terminación por Usted</h3>
<p>Puede terminar su cuenta en cualquier momento contactándonos o usando la configuración de la cuenta. Tras la terminación, su derecho a usar el Servicio cesará inmediatamente.</p>

<h3>12.2 Terminación por Nosotros</h3>
<p>Podemos suspender o terminar su cuenta si:</p>
<ul>
    <li>Viola estas Condiciones de Uso</li>
    <li>Su uso presenta un riesgo de seguridad</li>
    <li>No paga las tarifas aplicables</li>
    <li>Lo requiere la ley o un proceso legal</li>
</ul>

<h3>12.3 Efecto de la Terminación</h3>
<p>Tras la terminación, todas las licencias concedidas a usted terminarán y deberá dejar de usar el Servicio. Podemos eliminar sus datos de acuerdo con nuestra Política de Privacidad.</p>

<h2>13. Ley Aplicable y Disputas</h2>
<p>Estas Condiciones se rigen por las leyes del Reino de Marruecos. Cualquier disputa derivada de estas Condiciones o de su uso del Servicio estará sujeta a la jurisdicción exclusiva de los tribunales de Marrakech, Marruecos.</p>

<h2>14. Cambios en las Condiciones</h2>
<p>Podemos actualizar estas Condiciones de vez en cuando. Nosotros:</p>
<ul>
    <li>Le notificaremos los cambios importantes por correo electrónico</li>
    <li>Proporcionaremos al menos 30 días de aviso antes de que los cambios entren en vigor</li>
    <li>Actualizaremos la fecha de "Última actualización" en la parte superior de esta página</li>
</ul>
<p>El uso continuado del Servicio después de que los cambios entren en vigor constituye la aceptación de las nuevas Condiciones.</p>

<h2>15. Disposiciones Varias</h2>

<h3>15.1 Acuerdo Completo</h3>
<p>Estas Condiciones, junto con nuestra Política de Privacidad y Condiciones de Venta, constituyen el acuerdo completo entre usted y ReplyStack.</p>

<h3>15.2 Divisibilidad</h3>
<p>Si alguna disposición de estas Condiciones resulta inválida o inaplicable, las disposiciones restantes continuarán en pleno vigor y efecto.</p>

<h3>15.3 Renuncia</h3>
<p>Nuestra falta de ejercer cualquier derecho o disposición de estas Condiciones no constituye una renuncia a dicho derecho o disposición.</p>

<h3>15.4 Cesión</h3>
<p>No puede ceder o transferir estas Condiciones sin nuestro consentimiento previo por escrito. Podemos ceder nuestros derechos y obligaciones sin restricción.</p>

<h2>16. Contacto</h2>
<p>Para preguntas sobre estas Condiciones de Uso:</p>
<ul>
    <li><strong>Email:</strong> <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
    <li><strong>Dirección:</strong> {{ $companyName }}, {{ $companyAddress }}</li>
</ul>
@endsection
