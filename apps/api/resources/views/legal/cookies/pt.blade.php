@extends('legal.layouts.legal')

@section('title', 'Política de Cookies')
@section('link_legal', 'Aviso Legal')
@section('link_terms', 'Termos de Uso')
@section('link_sales', 'Condições de Venda')
@section('link_privacy', 'Política de Privacidade')
@section('link_cookies', 'Política de Cookies')

@section('content')
<h1>Política de Cookies</h1>
<p class="last-updated">{{ $translations['lastUpdated'] }}: {{ $lastUpdatedDate }}</p>

<div class="highlight-box">
    <strong>Resumo:</strong> O ReplyStack utiliza apenas cookies essenciais necessários para o funcionamento do serviço. Não utilizamos cookies publicitários ou de rastreamento.
</div>

<h2>1. O que são Cookies?</h2>
<p>Cookies são pequenos arquivos de texto que são armazenados no seu dispositivo (computador, tablet ou smartphone) quando você visita um site. Eles ajudam o site a lembrar suas ações e preferências ao longo do tempo.</p>

<h2>2. Nossa Política de Cookies</h2>
<p>O ReplyStack está comprometido em respeitar sua privacidade. Utilizamos uma abordagem minimalista de cookies:</p>
<ul>
    <li>Utilizamos apenas <strong>cookies estritamente necessários</strong> para que o serviço funcione</li>
    <li><strong>Não</strong> utilizamos cookies publicitários ou de marketing</li>
    <li><strong>Não</strong> utilizamos cookies de rastreamento de terceiros</li>
    <li><strong>Não</strong> vendemos os dados coletados através de cookies</li>
</ul>

<h2>3. Cookies que Utilizamos</h2>

<h3>3.1 Cookies Essenciais</h3>
<p>Estes cookies são necessários para que o site funcione e não podem ser desativados.</p>

<table>
    <thead>
        <tr>
            <th>Nome do Cookie</th>
            <th>Finalidade</th>
            <th>Duração</th>
            <th>Tipo</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>session</td>
            <td>Mantém sua sessão de login e segurança</td>
            <td>Sessão / 2 horas</td>
            <td>Primeira parte</td>
        </tr>
        <tr>
            <td>XSRF-TOKEN</td>
            <td>Protege contra ataques de falsificação de solicitação entre sites</td>
            <td>Sessão / 2 horas</td>
            <td>Primeira parte</td>
        </tr>
        <tr>
            <td>remember_token</td>
            <td>Mantém você logado se escolher "Lembrar-me"</td>
            <td>30 dias</td>
            <td>Primeira parte</td>
        </tr>
    </tbody>
</table>

<h3>3.2 Cookies Funcionais</h3>
<p>Estes cookies permitem funcionalidades personalizadas.</p>

<table>
    <thead>
        <tr>
            <th>Nome do Cookie</th>
            <th>Finalidade</th>
            <th>Duração</th>
            <th>Tipo</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>locale</td>
            <td>Lembra sua preferência de idioma</td>
            <td>1 ano</td>
            <td>Primeira parte</td>
        </tr>
        <tr>
            <td>theme</td>
            <td>Lembra sua preferência de tema de exibição (claro/escuro)</td>
            <td>1 ano</td>
            <td>Primeira parte</td>
        </tr>
    </tbody>
</table>

<h3>3.3 Extensão do Navegador</h3>
<p>A extensão do navegador ReplyStack usa armazenamento local (não cookies) para:</p>
<ul>
    <li>Armazenar seu token de autenticação de forma segura</li>
    <li>Armazenar em cache suas preferências para acesso mais rápido</li>
    <li>Lembrar suas últimas configurações usadas</li>
</ul>
<p>Estes dados são armazenados localmente no seu navegador e não são compartilhados com terceiros.</p>

<h2>4. Cookies que NÃO Utilizamos</h2>

<p>Para ser claro, o ReplyStack <strong>não</strong> utiliza:</p>
<ul>
    <li><strong>Cookies publicitários:</strong> Não exibimos anúncios e não rastreamos você para fins publicitários</li>
    <li><strong>Cookies de análise:</strong> Não utilizamos Google Analytics ou ferramentas de análise similares de terceiros</li>
    <li><strong>Cookies de redes sociais:</strong> Não incorporamos rastreamento de redes sociais</li>
    <li><strong>Cookies de rastreamento de terceiros:</strong> Não permitimos que terceiros coloquem cookies em nosso site</li>
</ul>

<h2>5. Serviços de Terceiros</h2>

<p>Quando você usa certas funcionalidades, pode interagir com serviços de terceiros que têm suas próprias políticas de cookies:</p>

<table>
    <thead>
        <tr>
            <th>Serviço</th>
            <th>Finalidade</th>
            <th>Política de Cookies</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Lemon Squeezy</td>
            <td>Processamento de pagamentos</td>
            <td><a href="https://www.lemonsqueezy.com/privacy" target="_blank">Ver Política</a></td>
        </tr>
        <tr>
            <td>Google OAuth</td>
            <td>Login com Google (opcional)</td>
            <td><a href="https://policies.google.com/privacy" target="_blank">Ver Política</a></td>
        </tr>
    </tbody>
</table>

<p>Estes cookies de terceiros só são definidos quando você usa explicitamente estes serviços (por exemplo, durante o checkout ou login OAuth).</p>

<h2>6. Gerenciamento de Cookies</h2>

<h3>6.1 Configurações do Navegador</h3>
<p>Você pode controlar cookies através das configurações do seu navegador:</p>
<ul>
    <li><strong>Chrome:</strong> Configurações → Privacidade e segurança → Cookies</li>
    <li><strong>Firefox:</strong> Configurações → Privacidade e segurança → Cookies</li>
    <li><strong>Safari:</strong> Preferências → Privacidade → Cookies</li>
    <li><strong>Edge:</strong> Configurações → Cookies e permissões do site</li>
</ul>

<h3>6.2 Impacto de Desativar Cookies</h3>
<p>Se você desativar cookies essenciais:</p>
<ul>
    <li>Você não poderá fazer login na sua conta</li>
    <li>As funcionalidades de segurança da sessão não funcionarão</li>
    <li>O serviço pode não funcionar corretamente</li>
</ul>

<h2>7. Consentimento de Cookies</h2>
<p>Sob o RGPD e regulamentos similares, cookies estritamente necessários não requerem consentimento, pois são essenciais para o funcionamento do serviço. Como o ReplyStack usa apenas cookies essenciais:</p>
<ul>
    <li>Não exibimos um banner de consentimento de cookies para nossos cookies essenciais</li>
    <li>Ao usar nosso serviço, você reconhece o uso destes cookies necessários</li>
    <li>Você sempre pode gerenciar cookies através das configurações do seu navegador</li>
</ul>

<h2>8. Proteção de Dados</h2>
<p>Os dados dos cookies são processados de acordo com nossa <a href="/privacy?lang=pt">Política de Privacidade</a>. Garantimos:</p>
<ul>
    <li>Todos os cookies são transmitidos via HTTPS (criptografados)</li>
    <li>Cookies de sessão usam os flags secure e httpOnly</li>
    <li>Dados de cookies não são compartilhados com terceiros para marketing</li>
</ul>

<h2>9. Alterações nesta Política</h2>
<p>Podemos atualizar esta Política de Cookies periodicamente. As alterações serão publicadas nesta página com uma data de revisão atualizada. Notificaremos você sobre quaisquer alterações importantes por email.</p>

<h2>10. Contato</h2>
<p>Se você tiver dúvidas sobre nosso uso de cookies:</p>
<ul>
    <li><strong>Email:</strong> <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
    <li><strong>Endereço:</strong> {{ $companyName }}, {{ $companyAddress }}</li>
</ul>
@endsection
