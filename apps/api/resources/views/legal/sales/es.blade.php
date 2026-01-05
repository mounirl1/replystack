@extends('legal.layouts.legal')

@section('title', 'Condiciones de Venta')
@section('link_legal', 'Aviso Legal')
@section('link_terms', 'Condiciones de Uso')
@section('link_sales', 'Condiciones de Venta')
@section('link_privacy', 'Política de Privacidad')
@section('link_cookies', 'Política de Cookies')

@section('content')
<h1>Condiciones Generales de Venta</h1>
<p class="last-updated">{{ $translations['lastUpdated'] }}: {{ $lastUpdatedDate }}</p>

<div class="highlight-box">
    <strong>Aviso:</strong> Estas Condiciones de Venta rigen todas las compras de suscripciones a los servicios de ReplyStack. Al suscribirse, acepta estas condiciones.
</div>

<h2>1. Información del Vendedor</h2>
<ul>
    <li><strong>Empresa:</strong> {{ $companyName }}</li>
    <li><strong>Forma Jurídica:</strong> {{ $companyForm }} (Derecho Marroquí)</li>
    <li><strong>ICE:</strong> {{ $companyId }}</li>
    <li><strong>Dirección:</strong> {{ $companyAddress }}</li>
    <li><strong>Email:</strong> <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
    <li><strong>Representante:</strong> {{ $directorName }}, {{ $directorTitle }}</li>
</ul>

<h2>2. Ámbito de Aplicación</h2>
<p>Estas Condiciones de Venta se aplican a todas las compras de suscripciones realizadas a través de la plataforma ReplyStack (replystack.io). Al completar una compra, celebra un contrato vinculante con {{ $companyName }}.</p>

<h2>3. Productos y Servicios</h2>

<h3>3.1 Descripción del Servicio</h3>
<p>ReplyStack ofrece planes de suscripción para la generación de respuestas a reseñas asistida por IA:</p>
<ul>
    <li><strong>Plan Gratuito:</strong> Respuestas diarias limitadas, funcionalidades básicas</li>
    <li><strong>Plan Starter:</strong> Cuota mensual de respuestas, acceso al panel de control</li>
    <li><strong>Plan Pro:</strong> Respuestas ilimitadas, funcionalidades avanzadas, análisis</li>
    <li><strong>Plan Business:</strong> Soporte multi-ubicación, funcionalidades de equipo, soporte prioritario</li>
    <li><strong>Plan Enterprise:</strong> Soluciones personalizadas, soporte dedicado, acceso API</li>
</ul>

<h3>3.2 Disponibilidad del Servicio</h3>
<p>Nuestro servicio está disponible en todo el mundo. Ciertas funcionalidades pueden variar según la región debido a restricciones regulatorias o técnicas.</p>

<h2>4. Precios</h2>

<h3>4.1 Información de Precios</h3>
<p>Todos los precios se muestran en Euros (EUR) y no incluyen impuestos aplicables salvo que se indique lo contrario. Los precios actuales están disponibles en nuestro sitio web en replystack.io/pricing.</p>

<h3>4.2 Cambios de Precios</h3>
<p>Nos reservamos el derecho de modificar nuestros precios en cualquier momento. Los cambios de precios:</p>
<ul>
    <li>Se anunciarán con al menos 30 días de antelación</li>
    <li>No afectarán a las suscripciones activas hasta su renovación</li>
    <li>Se comunicarán por correo electrónico a los clientes existentes</li>
</ul>

<h2>5. Pago</h2>

<h3>5.1 Métodos de Pago</h3>
<p>Los pagos se procesan a través de nuestro proveedor de pagos, Lemon Squeezy. Los métodos de pago aceptados incluyen:</p>
<ul>
    <li>Tarjetas de crédito y débito (Visa, Mastercard, American Express)</li>
    <li>PayPal (según disponibilidad)</li>
    <li>Otros métodos soportados por nuestro proveedor de pagos</li>
</ul>

<h3>5.2 Procesamiento de Pagos</h3>
<p>Toda la información de pago se procesa de forma segura por Lemon Squeezy. No almacenamos los detalles de su tarjeta de crédito. Lemon Squeezy cumple con PCI-DSS.</p>

<h3>5.3 Ciclo de Facturación</h3>
<ul>
    <li><strong>Suscripciones mensuales:</strong> Facturadas el mismo día cada mes</li>
    <li><strong>Suscripciones anuales:</strong> Facturadas una vez al año con el descuento aplicable</li>
</ul>

<h3>5.4 Pagos Fallidos</h3>
<p>Si un pago falla:</p>
<ul>
    <li>Intentaremos procesar el pago nuevamente dentro de 3 días hábiles</li>
    <li>Se le notificará por correo electrónico del pago fallido</li>
    <li>Si el pago no puede procesarse después de 3 intentos, su suscripción puede ser suspendida</li>
</ul>

<h2>6. Suscripción y Renovación</h2>

<h3>6.1 Renovación Automática</h3>
<p>Todas las suscripciones se renuevan automáticamente al final de cada período de facturación a menos que se cancelen. Al suscribirse, nos autoriza a cargar su método de pago para pagos recurrentes.</p>

<h3>6.2 Cancelación</h3>
<p>Puede cancelar su suscripción en cualquier momento a través de:</p>
<ul>
    <li>La configuración de su cuenta en el panel de control de ReplyStack</li>
    <li>Contactando a nuestro soporte en <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
</ul>
<p>La cancelación entra en vigor al final del período de facturación actual. Mantendrá el acceso a las funcionalidades de pago hasta entonces.</p>

<h3>6.3 Degradación</h3>
<p>Puede degradar a un plan inferior en cualquier momento. El cambio entrará en vigor al inicio de su próximo período de facturación.</p>

<h2>7. Derecho de Desistimiento (Período de Reflexión)</h2>

<div class="jurisdiction-notice">
    <h3>7.1 Para Consumidores de la UE/EEE</h3>
    <p>Según las leyes europeas de protección al consumidor, tiene derecho a desistir de este contrato en un plazo de 14 días sin dar ninguna razón.</p>
    <p>El período de desistimiento expira 14 días después del día de la celebración del contrato.</p>
    <p>Para ejercer el derecho de desistimiento, debe informarnos de su decisión mediante una declaración clara (correo electrónico a <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a>).</p>

    <h4>Excepciones</h4>
    <p>El derecho de desistimiento no se aplica si:</p>
    <ul>
        <li>Ha consentido expresamente que el servicio comience durante el período de desistimiento</li>
        <li>Ha reconocido que perderá su derecho de desistimiento una vez que el servicio se haya ejecutado completamente</li>
        <li>El servicio se ha ejecutado completamente con su consentimiento expreso previo</li>
    </ul>

    <h4>Efecto del Desistimiento</h4>
    <p>Si desiste de este contrato, le reembolsaremos todos los pagos recibidos de usted sin demora indebida y a más tardar 14 días desde el día en que recibimos notificación de su desistimiento.</p>
</div>

<h3>7.2 Para Otras Jurisdicciones</h3>
<p>Para clientes fuera de la UE/EEE, las políticas de reembolso se rigen por la Sección 8 de estas Condiciones.</p>

<h2>8. Política de Reembolso</h2>

<h3>8.1 Política General</h3>
<p>Debido a la naturaleza digital de nuestros servicios:</p>
<ul>
    <li>Los reembolsos generalmente no se proporcionan para períodos de suscripción que ya han comenzado</li>
    <li>Evaluamos las solicitudes de reembolso caso por caso para problemas técnicos o fallos del servicio</li>
</ul>

<h3>8.2 Solicitud de Reembolso</h3>
<p>Para solicitar un reembolso:</p>
<ol>
    <li>Contáctenos en <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
    <li>Incluya el correo de su cuenta y el motivo de la solicitud</li>
    <li>Responderemos dentro de 5 días hábiles</li>
</ol>

<h3>8.3 Reembolsos Aprobados</h3>
<p>Si se aprueba un reembolso:</p>
<ul>
    <li>El reembolso se procesará a su método de pago original</li>
    <li>El tiempo de procesamiento es típicamente de 5 a 10 días hábiles</li>
    <li>Su suscripción será cancelada</li>
</ul>

<h2>9. Impuestos</h2>

<h3>9.1 IVA e Impuestos de Venta</h3>
<p>Los precios pueden estar sujetos al Impuesto sobre el Valor Añadido (IVA) u otros impuestos aplicables dependiendo de su ubicación. Nuestro proveedor de pagos calculará y aplicará la tasa de impuesto correcta basada en su dirección de facturación.</p>

<h3>9.2 Facturas</h3>
<p>Las facturas se generan automáticamente y se envían a su dirección de correo electrónico registrada después de cada pago. También puede descargar las facturas desde su panel de control.</p>

<h2>10. Nivel de Servicio</h2>

<h3>10.1 Disponibilidad</h3>
<p>Aspiramos a un 99,9% de tiempo de actividad para nuestros servicios. El mantenimiento programado se anunciará con antelación cuando sea posible.</p>

<h3>10.2 Soporte</h3>
<table>
    <thead>
        <tr>
            <th>Plan</th>
            <th>Nivel de Soporte</th>
            <th>Tiempo de Respuesta</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Gratuito</td>
            <td>Soporte por email</td>
            <td>72 horas</td>
        </tr>
        <tr>
            <td>Starter</td>
            <td>Soporte por email</td>
            <td>48 horas</td>
        </tr>
        <tr>
            <td>Pro</td>
            <td>Soporte email prioritario</td>
            <td>24 horas</td>
        </tr>
        <tr>
            <td>Business</td>
            <td>Soporte prioritario</td>
            <td>12 horas</td>
        </tr>
        <tr>
            <td>Enterprise</td>
            <td>Soporte dedicado</td>
            <td>4 horas</td>
        </tr>
    </tbody>
</table>

<h2>11. Limitación de Responsabilidad</h2>
<p>Nuestra responsabilidad por cualquier reclamación derivada del servicio de suscripción está limitada al importe que nos ha pagado en los 12 meses anteriores a la reclamación. No somos responsables de daños indirectos, incidentales o consecuentes.</p>

<h2>12. Resolución de Disputas</h2>

<h3>12.1 Contáctenos Primero</h3>
<p>Si tiene una queja o disputa, por favor contáctenos primero en <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a>. Trabajaremos para resolver el problema dentro de 30 días.</p>

<h3>12.2 Resolución de Disputas en Línea (UE)</h3>
<p>Para consumidores de la UE: La Comisión Europea proporciona una plataforma de resolución de disputas en línea en <a href="https://ec.europa.eu/consumers/odr" target="_blank">https://ec.europa.eu/consumers/odr</a></p>

<h3>12.3 Ley Aplicable</h3>
<p>Estas Condiciones de Venta se rigen por las leyes del Reino de Marruecos. Las disputas estarán sujetas a la jurisdicción exclusiva de los tribunales de Marrakech, Marruecos, excepto cuando las leyes obligatorias de protección al consumidor dispongan lo contrario.</p>

<h2>13. Cambios en las Condiciones</h2>
<p>Podemos actualizar estas Condiciones de Venta. Los cambios se anunciarán con 30 días de antelación y no afectarán a las suscripciones existentes hasta su renovación.</p>

<h2>14. Contacto</h2>
<p>Para preguntas sobre compras, facturación o estas Condiciones de Venta:</p>
<ul>
    <li><strong>Email:</strong> <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
    <li><strong>Dirección:</strong> {{ $companyName }}, {{ $companyAddress }}</li>
</ul>
@endsection
