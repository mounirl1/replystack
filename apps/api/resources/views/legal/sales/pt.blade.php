@extends('legal.layouts.legal')

@section('title', 'Condições de Venda')
@section('link_legal', 'Aviso Legal')
@section('link_terms', 'Termos de Uso')
@section('link_sales', 'Condições de Venda')
@section('link_privacy', 'Política de Privacidade')
@section('link_cookies', 'Política de Cookies')

@section('content')
<h1>Condições Gerais de Venda</h1>
<p class="last-updated">{{ $translations['lastUpdated'] }}: {{ $lastUpdatedDate }}</p>

<div class="highlight-box">
    <strong>Aviso:</strong> Estas Condições de Venda regem todas as compras de assinaturas dos serviços ReplyStack. Ao assinar, você concorda com estas condições.
</div>

<h2>1. Informações do Vendedor</h2>
<ul>
    <li><strong>Empresa:</strong> {{ $companyName }}</li>
    <li><strong>Forma Jurídica:</strong> {{ $companyForm }} (Lei Marroquina)</li>
    <li><strong>ICE:</strong> {{ $companyId }}</li>
    <li><strong>Endereço:</strong> {{ $companyAddress }}</li>
    <li><strong>Email:</strong> <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
    <li><strong>Representante:</strong> {{ $directorName }}, {{ $directorTitle }}</li>
</ul>

<h2>2. Âmbito de Aplicação</h2>
<p>Estas Condições de Venda aplicam-se a todas as compras de assinaturas realizadas através da plataforma ReplyStack (replystack.io). Ao concluir uma compra, você celebra um contrato vinculante com {{ $companyName }}.</p>

<h2>3. Produtos e Serviços</h2>

<h3>3.1 Descrição do Serviço</h3>
<p>O ReplyStack oferece planos de assinatura para geração de respostas a avaliações assistida por IA:</p>
<ul>
    <li><strong>Plano Gratuito:</strong> Respostas diárias limitadas, funcionalidades básicas</li>
    <li><strong>Plano Starter:</strong> Cota mensal de respostas, acesso ao painel de controle</li>
    <li><strong>Plano Pro:</strong> Respostas ilimitadas, funcionalidades avançadas, análises</li>
    <li><strong>Plano Business:</strong> Suporte multi-localização, funcionalidades de equipe, suporte prioritário</li>
    <li><strong>Plano Enterprise:</strong> Soluções personalizadas, suporte dedicado, acesso à API</li>
</ul>

<h3>3.2 Disponibilidade do Serviço</h3>
<p>Nosso serviço está disponível mundialmente. Certas funcionalidades podem variar por região devido a restrições regulatórias ou técnicas.</p>

<h2>4. Preços</h2>

<h3>4.1 Informações de Preços</h3>
<p>Todos os preços são exibidos em Euros (EUR) e não incluem impostos aplicáveis, salvo indicação em contrário. Os preços atuais estão disponíveis em nosso site em replystack.io/pricing.</p>

<h3>4.2 Alterações de Preços</h3>
<p>Reservamo-nos o direito de modificar nossos preços a qualquer momento. As alterações de preços:</p>
<ul>
    <li>Serão anunciadas com pelo menos 30 dias de antecedência</li>
    <li>Não afetarão assinaturas ativas até a renovação</li>
    <li>Serão comunicadas por email aos clientes existentes</li>
</ul>

<h2>5. Pagamento</h2>

<h3>5.1 Métodos de Pagamento</h3>
<p>Os pagamentos são processados através do nosso provedor de pagamentos, Lemon Squeezy. Os métodos de pagamento aceitos incluem:</p>
<ul>
    <li>Cartões de crédito e débito (Visa, Mastercard, American Express)</li>
    <li>PayPal (onde disponível)</li>
    <li>Outros métodos suportados pelo nosso provedor de pagamentos</li>
</ul>

<h3>5.2 Processamento de Pagamentos</h3>
<p>Todas as informações de pagamento são processadas de forma segura pelo Lemon Squeezy. Não armazenamos os detalhes do seu cartão de crédito. O Lemon Squeezy é compatível com PCI-DSS.</p>

<h3>5.3 Ciclo de Faturamento</h3>
<ul>
    <li><strong>Assinaturas mensais:</strong> Faturadas no mesmo dia a cada mês</li>
    <li><strong>Assinaturas anuais:</strong> Faturadas uma vez por ano com desconto aplicável</li>
</ul>

<h3>5.4 Pagamentos Falhos</h3>
<p>Se um pagamento falhar:</p>
<ul>
    <li>Tentaremos processar o pagamento novamente dentro de 3 dias úteis</li>
    <li>Você será notificado por email sobre o pagamento falho</li>
    <li>Se o pagamento não puder ser processado após 3 tentativas, sua assinatura pode ser suspensa</li>
</ul>

<h2>6. Assinatura e Renovação</h2>

<h3>6.1 Renovação Automática</h3>
<p>Todas as assinaturas são renovadas automaticamente no final de cada período de faturamento, salvo cancelamento. Ao assinar, você nos autoriza a cobrar seu método de pagamento para pagamentos recorrentes.</p>

<h3>6.2 Cancelamento</h3>
<p>Você pode cancelar sua assinatura a qualquer momento através de:</p>
<ul>
    <li>As configurações da sua conta no painel do ReplyStack</li>
    <li>Entrando em contato com nosso suporte em <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
</ul>
<p>O cancelamento entra em vigor no final do período de faturamento atual. Você manterá o acesso às funcionalidades pagas até então.</p>

<h3>6.3 Downgrade</h3>
<p>Você pode fazer downgrade para um plano inferior a qualquer momento. A alteração entrará em vigor no início do seu próximo período de faturamento.</p>

<h2>7. Direito de Desistência (Período de Reflexão)</h2>

<div class="jurisdiction-notice">
    <h3>7.1 Para Consumidores da UE/EEE</h3>
    <p>De acordo com as leis europeias de proteção ao consumidor, você tem o direito de desistir deste contrato dentro de 14 dias sem dar qualquer motivo.</p>
    <p>O período de desistência expira 14 dias após o dia da celebração do contrato.</p>
    <p>Para exercer o direito de desistência, você deve nos informar de sua decisão por meio de uma declaração clara (email para <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a>).</p>

    <h4>Exceções</h4>
    <p>O direito de desistência não se aplica se:</p>
    <ul>
        <li>Você consentiu expressamente que o serviço começasse durante o período de desistência</li>
        <li>Você reconheceu que perderá seu direito de desistência uma vez que o serviço seja totalmente executado</li>
        <li>O serviço foi totalmente executado com seu consentimento expresso prévio</li>
    </ul>

    <h4>Efeito da Desistência</h4>
    <p>Se você desistir deste contrato, reembolsaremos todos os pagamentos recebidos de você sem demora indevida e, em qualquer caso, no máximo 14 dias a partir do dia em que recebemos notificação de sua desistência.</p>
</div>

<h3>7.2 Para Outras Jurisdições</h3>
<p>Para clientes fora da UE/EEE, as políticas de reembolso são regidas pela Seção 8 destas Condições.</p>

<h2>8. Política de Reembolso</h2>

<h3>8.1 Política Geral</h3>
<p>Devido à natureza digital de nossos serviços:</p>
<ul>
    <li>Reembolsos geralmente não são fornecidos para períodos de assinatura que já começaram</li>
    <li>Avaliamos solicitações de reembolso caso a caso para problemas técnicos ou falhas de serviço</li>
</ul>

<h3>8.2 Solicitação de Reembolso</h3>
<p>Para solicitar um reembolso:</p>
<ol>
    <li>Entre em contato conosco em <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
    <li>Inclua o email da sua conta e o motivo da solicitação</li>
    <li>Responderemos dentro de 5 dias úteis</li>
</ol>

<h3>8.3 Reembolsos Aprovados</h3>
<p>Se um reembolso for aprovado:</p>
<ul>
    <li>O reembolso será processado para seu método de pagamento original</li>
    <li>O tempo de processamento é tipicamente de 5 a 10 dias úteis</li>
    <li>Sua assinatura será cancelada</li>
</ul>

<h2>9. Impostos</h2>

<h3>9.1 IVA e Impostos sobre Vendas</h3>
<p>Os preços podem estar sujeitos ao Imposto sobre o Valor Acrescentado (IVA) ou outros impostos aplicáveis dependendo da sua localização. Nosso provedor de pagamentos calculará e aplicará a taxa de imposto correta com base no seu endereço de faturamento.</p>

<h3>9.2 Faturas</h3>
<p>As faturas são geradas automaticamente e enviadas para seu endereço de email registrado após cada pagamento. Você também pode baixar faturas do seu painel de controle.</p>

<h2>10. Nível de Serviço</h2>

<h3>10.1 Disponibilidade</h3>
<p>Visamos 99,9% de uptime para nossos serviços. A manutenção programada será anunciada com antecedência quando possível.</p>

<h3>10.2 Suporte</h3>
<table>
    <thead>
        <tr>
            <th>Plano</th>
            <th>Nível de Suporte</th>
            <th>Tempo de Resposta</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Gratuito</td>
            <td>Suporte por email</td>
            <td>72 horas</td>
        </tr>
        <tr>
            <td>Starter</td>
            <td>Suporte por email</td>
            <td>48 horas</td>
        </tr>
        <tr>
            <td>Pro</td>
            <td>Suporte email prioritário</td>
            <td>24 horas</td>
        </tr>
        <tr>
            <td>Business</td>
            <td>Suporte prioritário</td>
            <td>12 horas</td>
        </tr>
        <tr>
            <td>Enterprise</td>
            <td>Suporte dedicado</td>
            <td>4 horas</td>
        </tr>
    </tbody>
</table>

<h2>11. Limitação de Responsabilidade</h2>
<p>Nossa responsabilidade por quaisquer reclamações decorrentes do serviço de assinatura é limitada ao valor que você nos pagou nos 12 meses anteriores à reclamação. Não somos responsáveis por danos indiretos, incidentais ou consequenciais.</p>

<h2>12. Resolução de Disputas</h2>

<h3>12.1 Entre em Contato Conosco Primeiro</h3>
<p>Se você tiver uma reclamação ou disputa, entre em contato conosco primeiro em <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a>. Trabalharemos para resolver o problema dentro de 30 dias.</p>

<h3>12.2 Resolução de Disputas Online (UE)</h3>
<p>Para consumidores da UE: A Comissão Europeia fornece uma plataforma de resolução de disputas online em <a href="https://ec.europa.eu/consumers/odr" target="_blank">https://ec.europa.eu/consumers/odr</a></p>

<h3>12.3 Lei Aplicável</h3>
<p>Estas Condições de Venda são regidas pelas leis do Reino do Marrocos. As disputas estarão sujeitas à jurisdição exclusiva dos tribunais de Marrakech, Marrocos, exceto onde as leis obrigatórias de proteção ao consumidor exijam o contrário.</p>

<h2>13. Alterações nas Condições</h2>
<p>Podemos atualizar estas Condições de Venda. As alterações serão anunciadas com 30 dias de antecedência e não afetarão as assinaturas existentes até a renovação.</p>

<h2>14. Contato</h2>
<p>Para perguntas sobre compras, faturamento ou estas Condições de Venda:</p>
<ul>
    <li><strong>Email:</strong> <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
    <li><strong>Endereço:</strong> {{ $companyName }}, {{ $companyAddress }}</li>
</ul>
@endsection
