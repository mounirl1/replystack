@extends('legal.layouts.legal')

@section('title', 'Política de Privacidad')
@section('link_legal', 'Aviso Legal')
@section('link_terms', 'Condiciones de Uso')
@section('link_sales', 'Condiciones de Venta')
@section('link_privacy', 'Política de Privacidad')
@section('link_cookies', 'Política de Cookies')

@section('content')
<h1>Política de Privacidad</h1>
<p class="last-updated">{{ $translations['lastUpdated'] }}: {{ $lastUpdatedDate }}</p>

<div class="highlight-box">
    <strong>Nuestro Compromiso:</strong> En ReplyStack, estamos comprometidos con la protección de su privacidad y datos personales. Esta política explica cómo recopilamos, usamos y protegemos su información de conformidad con el RGPD (UE), CCPA (California), LGPD (Brasil) y la Ley marroquí 09-08.
</div>

<h2>1. Responsable del Tratamiento</h2>
<p>El responsable del tratamiento de sus datos personales es:</p>
<ul>
    <li><strong>Empresa:</strong> {{ $companyName }}</li>
    <li><strong>Forma Jurídica:</strong> {{ $companyForm }} (Derecho Marroquí)</li>
    <li><strong>ICE:</strong> {{ $companyId }}</li>
    <li><strong>Dirección:</strong> {{ $companyAddress }}</li>
    <li><strong>Email:</strong> <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
    <li><strong>Representante:</strong> {{ $directorName }}, {{ $directorTitle }}</li>
</ul>

<h2>2. Ámbito de Aplicación</h2>
<p>Esta Política de Privacidad se aplica a:</p>
<ul>
    <li>El sitio web y la aplicación web de ReplyStack</li>
    <li>El panel de control de ReplyStack</li>
    <li>La extensión de navegador ReplyStack para Chrome y Firefox</li>
    <li>Todos los servicios y comunicaciones relacionados</li>
</ul>

<h2>3. Datos que Recopilamos</h2>

<h3>3.1 Información de Cuenta</h3>
<ul>
    <li>Dirección de correo electrónico</li>
    <li>Nombre (opcional)</li>
    <li>Contraseña (almacenada como hash seguro, nunca en texto plano)</li>
    <li>Plan y estado de suscripción</li>
</ul>

<h3>3.2 Datos del Perfil Empresarial</h3>
<ul>
    <li>Nombre del establecimiento</li>
    <li>Sector de actividad</li>
    <li>Dirección (opcional)</li>
    <li>Preferencias de respuesta (tono, idioma, firma)</li>
</ul>

<h3>3.3 Datos de Reseñas de Clientes</h3>
<ul>
    <li>Contenido de reseñas, autores, calificaciones y fechas de las plataformas conectadas</li>
    <li>Respuestas generadas por IA</li>
    <li>Historial de respuestas y análisis</li>
</ul>

<h3>3.4 OAuth y Conexiones de Plataformas</h3>
<ul>
    <li>Tokens OAuth para Google Business Profile y Facebook (cifrados en reposo)</li>
    <li>Identificadores de plataforma para cuentas conectadas</li>
</ul>

<h3>3.5 Datos de Uso</h3>
<ul>
    <li>Archivos de registro (dirección IP, tipo de navegador, horarios de acceso)</li>
    <li>Estadísticas de uso de funcionalidades</li>
    <li>Preferencias y configuraciones</li>
</ul>

<h3>3.6 Información de Pago</h3>
<ul>
    <li>La información de facturación es procesada por nuestro proveedor de pagos (Lemon Squeezy)</li>
    <li>NO almacenamos números de tarjeta de crédito ni datos bancarios</li>
</ul>

<h3>3.7 Datos de la Extensión del Navegador</h3>
<ul>
    <li>Datos de reseñas de plataformas compatibles (Google Business, TripAdvisor, etc.)</li>
    <li>La extensión solo funciona en páginas de plataformas de reseñas compatibles</li>
    <li>No rastreamos su actividad de navegación general</li>
</ul>

<h2>4. Cómo Usamos Sus Datos</h2>
<table>
    <thead>
        <tr>
            <th>Finalidad</th>
            <th>Base Legal</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Prestación del servicio ReplyStack (generación de respuestas IA, agregación de reseñas)</td>
            <td>Ejecución del contrato</td>
        </tr>
        <tr>
            <td>Gestión de su cuenta de usuario</td>
            <td>Ejecución del contrato</td>
        </tr>
        <tr>
            <td>Procesamiento de pagos y facturación</td>
            <td>Ejecución del contrato / Obligación legal</td>
        </tr>
        <tr>
            <td>Envío de correos transaccionales (cuenta, facturación, seguridad)</td>
            <td>Ejecución del contrato</td>
        </tr>
        <tr>
            <td>Mejora de nuestros servicios mediante análisis</td>
            <td>Interés legítimo</td>
        </tr>
        <tr>
            <td>Seguridad y prevención del fraude</td>
            <td>Interés legítimo / Obligación legal</td>
        </tr>
        <tr>
            <td>Comunicaciones de marketing</td>
            <td>Consentimiento (opt-in)</td>
        </tr>
    </tbody>
</table>

<h2>5. Destinatarios y Encargados del Tratamiento</h2>
<p>Compartimos sus datos con los siguientes proveedores de servicios:</p>
<table>
    <thead>
        <tr>
            <th>Destinatario</th>
            <th>Finalidad</th>
            <th>Ubicación</th>
            <th>Garantías</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Anthropic, PBC</td>
            <td>Generación de respuestas IA</td>
            <td>EE.UU.</td>
            <td>DPF, CCT</td>
        </tr>
        <tr>
            <td>Railway, Inc.</td>
            <td>Alojamiento de API</td>
            <td>EE.UU.</td>
            <td>DPF, CCT</td>
        </tr>
        <tr>
            <td>Vercel Inc.</td>
            <td>Alojamiento de Frontend</td>
            <td>EE.UU.</td>
            <td>DPF, CCT</td>
        </tr>
        <tr>
            <td>Lemon Squeezy, LLC</td>
            <td>Procesamiento de pagos</td>
            <td>EE.UU.</td>
            <td>DPF, CCT, PCI-DSS</td>
        </tr>
        <tr>
            <td>Google LLC</td>
            <td>OAuth (si está conectado)</td>
            <td>EE.UU.</td>
            <td>DPF, CCT</td>
        </tr>
        <tr>
            <td>Meta Platforms, Inc.</td>
            <td>OAuth (si está conectado)</td>
            <td>EE.UU.</td>
            <td>DPF, CCT</td>
        </tr>
    </tbody>
</table>
<p><small>DPF = Marco de Privacidad de Datos UE-EE.UU.; CCT = Cláusulas Contractuales Tipo</small></p>

<h2>6. Transferencias Internacionales de Datos</h2>
<p>Sus datos pueden ser transferidos y procesados en Estados Unidos. Garantizamos una protección adecuada mediante:</p>
<ul>
    <li>Certificación del Marco de Privacidad de Datos UE-EE.UU. de nuestros encargados</li>
    <li>Cláusulas Contractuales Tipo (CCT) aprobadas por la Comisión Europea</li>
    <li>Su consentimiento explícito a estas transferencias al crear su cuenta</li>
</ul>

<h2>7. Conservación de Datos</h2>
<table>
    <thead>
        <tr>
            <th>Tipo de Datos</th>
            <th>Período de Conservación</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Datos de cuenta</td>
            <td>Duración de la suscripción + 3 años</td>
        </tr>
        <tr>
            <td>Reseñas y respuestas</td>
            <td>Duración de la suscripción + 1 año</td>
        </tr>
        <tr>
            <td>Tokens OAuth</td>
            <td>Hasta desconexión o expiración</td>
        </tr>
        <tr>
            <td>Registros del servidor</td>
            <td>12 meses</td>
        </tr>
        <tr>
            <td>Documentos de facturación</td>
            <td>10 años (obligación legal)</td>
        </tr>
    </tbody>
</table>

<h2>8. Sus Derechos de Privacidad</h2>

<h3>8.1 Derechos para Todos los Usuarios</h3>
<ul>
    <li><strong>Derecho de acceso:</strong> Solicitar una copia de sus datos personales</li>
    <li><strong>Derecho de rectificación:</strong> Corregir datos inexactos o incompletos</li>
    <li><strong>Derecho de supresión:</strong> Solicitar la eliminación de sus datos ("derecho al olvido")</li>
    <li><strong>Derecho a la portabilidad:</strong> Recibir sus datos en un formato estructurado</li>
    <li><strong>Derecho de oposición:</strong> Oponerse a determinados tratamientos</li>
    <li><strong>Derecho a retirar el consentimiento:</strong> Retirar su consentimiento en cualquier momento</li>
</ul>

<div class="jurisdiction-notice">
    <h3>8.2 Derechos Adicionales para Residentes de la UE/EEE (RGPD)</h3>
    <ul>
        <li>Derecho a presentar una reclamación ante su Autoridad de Protección de Datos local</li>
        <li>Derecho a la limitación del tratamiento</li>
        <li>Derecho a no ser objeto de decisiones automatizadas</li>
    </ul>
</div>

<div class="jurisdiction-notice">
    <h3>8.3 Derechos Adicionales para Residentes de California (CCPA)</h3>
    <ul>
        <li>Derecho a saber qué información personal se recopila, usa y comparte</li>
        <li>Derecho a eliminar información personal</li>
        <li>Derecho a optar por no participar en la venta de información personal (Nota: NO vendemos datos personales)</li>
        <li>Derecho a la no discriminación por ejercer sus derechos</li>
    </ul>
</div>

<div class="jurisdiction-notice">
    <h3>8.4 Derechos Adicionales para Residentes de Brasil (LGPD)</h3>
    <ul>
        <li>Derecho a información sobre el intercambio de datos con terceros</li>
        <li>Derecho a la anonimización, bloqueo o eliminación de datos excesivos</li>
        <li>Derecho a revocar el consentimiento</li>
    </ul>
</div>

<h3>8.5 Cómo Ejercer Sus Derechos</h3>
<p>Para ejercer cualquiera de estos derechos, contáctenos en: <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></p>
<p>Responderemos dentro de los 30 días siguientes a la recepción de su solicitud.</p>

<h2>9. Cookies</h2>
<p>Usamos cookies esenciales para autenticación y seguridad. Para información detallada, consulte nuestra <a href="/cookies?lang=es">Política de Cookies</a>.</p>

<h2>10. Medidas de Seguridad</h2>
<p>Implementamos medidas técnicas y organizativas apropiadas para proteger sus datos:</p>
<ul>
    <li>Cifrado de datos sensibles en reposo (AES-256)</li>
    <li>Cifrado HTTPS para todos los datos en tránsito</li>
    <li>Tokens OAuth cifrados en reposo</li>
    <li>Contraseñas hasheadas usando bcrypt</li>
    <li>Auditorías de seguridad regulares</li>
    <li>Controles de acceso y registro</li>
    <li>Formación de empleados en protección de datos</li>
</ul>

<h2>11. Privacidad de la Extensión del Navegador</h2>
<p>La extensión de navegador ReplyStack:</p>
<ul>
    <li>Solo se activa en plataformas de reseñas compatibles (Google Business, TripAdvisor, etc.)</li>
    <li>NO rastrea su actividad de navegación general</li>
    <li>NO recopila datos de páginas fuera de las plataformas compatibles</li>
    <li>Requiere permisos solo para funcionalidad (almacenamiento, pestaña activa en sitios de reseñas)</li>
    <li>Procesa datos de reseñas localmente antes de sincronizar con su cuenta</li>
</ul>

<h2>12. Privacidad de Menores</h2>
<p>ReplyStack no está destinado a usuarios menores de 18 años. No recopilamos conscientemente datos personales de niños. Si cree que hemos recopilado datos de un menor, contáctenos inmediatamente.</p>

<h2>13. Cambios en Esta Política</h2>
<p>Podemos actualizar esta Política de Privacidad periódicamente. Nosotros:</p>
<ul>
    <li>Le notificaremos por correo electrónico sobre cambios importantes</li>
    <li>Proporcionaremos un aviso de 30 días antes de que los cambios entren en vigor</li>
    <li>Actualizaremos la fecha de "Última actualización" en la parte superior de esta página</li>
</ul>

<h2>14. Contacto y Reclamaciones</h2>
<p>Para preguntas o reclamaciones sobre esta política o nuestras prácticas de datos:</p>
<ul>
    <li><strong>Email:</strong> <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
    <li><strong>Dirección:</strong> {{ $companyName }}, {{ $companyAddress }}</li>
</ul>

<p>También puede contactar a la autoridad supervisora correspondiente:</p>
<ul>
    <li><strong>UE:</strong> Su Autoridad de Protección de Datos local</li>
    <li><strong>Marruecos:</strong> CNDP (Commission Nationale de contrôle de la protection des Données à caractère personnel)</li>
    <li><strong>California:</strong> Fiscal General de California</li>
    <li><strong>Brasil:</strong> ANPD (Autoridade Nacional de Proteção de Dados)</li>
</ul>
@endsection
