@extends('legal.layouts.legal')

@section('title', 'Política de Privacidade')
@section('link_legal', 'Aviso Legal')
@section('link_terms', 'Termos de Uso')
@section('link_sales', 'Condições de Venda')
@section('link_privacy', 'Política de Privacidade')
@section('link_cookies', 'Política de Cookies')

@section('content')
<h1>Política de Privacidade</h1>
<p class="last-updated">{{ $translations['lastUpdated'] }}: {{ $lastUpdatedDate }}</p>

<div class="highlight-box">
    <strong>Nosso Compromisso:</strong> Na ReplyStack, estamos comprometidos em proteger sua privacidade e dados pessoais. Esta política explica como coletamos, usamos e protegemos suas informações em conformidade com o RGPD (UE), CCPA (Califórnia), LGPD (Brasil) e a Lei marroquina 09-08.
</div>

<h2>1. Controlador de Dados</h2>
<p>O controlador de dados responsável pelos seus dados pessoais é:</p>
<ul>
    <li><strong>Empresa:</strong> {{ $companyName }}</li>
    <li><strong>Forma Jurídica:</strong> {{ $companyForm }} (Lei Marroquina)</li>
    <li><strong>ICE:</strong> {{ $companyId }}</li>
    <li><strong>Endereço:</strong> {{ $companyAddress }}</li>
    <li><strong>Email:</strong> <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
    <li><strong>Representante:</strong> {{ $directorName }}, {{ $directorTitle }}</li>
</ul>

<h2>2. Âmbito de Aplicação</h2>
<p>Esta Política de Privacidade aplica-se a:</p>
<ul>
    <li>O site e aplicação web da ReplyStack</li>
    <li>O painel de controle da ReplyStack</li>
    <li>A extensão de navegador ReplyStack para Chrome e Firefox</li>
    <li>Todos os serviços e comunicações relacionados</li>
</ul>

<h2>3. Dados que Coletamos</h2>

<h3>3.1 Informações da Conta</h3>
<ul>
    <li>Endereço de email</li>
    <li>Nome (opcional)</li>
    <li>Senha (armazenada como hash seguro, nunca em texto simples)</li>
    <li>Plano e status de assinatura</li>
</ul>

<h3>3.2 Dados do Perfil Empresarial</h3>
<ul>
    <li>Nome do estabelecimento</li>
    <li>Setor de atividade</li>
    <li>Endereço (opcional)</li>
    <li>Preferências de resposta (tom, idioma, assinatura)</li>
</ul>

<h3>3.3 Dados de Avaliações de Clientes</h3>
<ul>
    <li>Conteúdo das avaliações, autores, classificações e datas das plataformas conectadas</li>
    <li>Respostas geradas por IA</li>
    <li>Histórico de respostas e análises</li>
</ul>

<h3>3.4 OAuth e Conexões de Plataformas</h3>
<ul>
    <li>Tokens OAuth para Google Business Profile e Facebook (criptografados em repouso)</li>
    <li>Identificadores de plataforma para contas conectadas</li>
</ul>

<h3>3.5 Dados de Uso</h3>
<ul>
    <li>Arquivos de log (endereço IP, tipo de navegador, horários de acesso)</li>
    <li>Estatísticas de uso de funcionalidades</li>
    <li>Preferências e configurações</li>
</ul>

<h3>3.6 Informações de Pagamento</h3>
<ul>
    <li>As informações de faturamento são processadas pelo nosso provedor de pagamentos (Lemon Squeezy)</li>
    <li>NÃO armazenamos números de cartão de crédito ou dados bancários</li>
</ul>

<h3>3.7 Dados da Extensão do Navegador</h3>
<ul>
    <li>Dados de avaliações das plataformas suportadas (Google Business, TripAdvisor, etc.)</li>
    <li>A extensão só funciona nas páginas das plataformas de avaliações suportadas</li>
    <li>Não rastreamos sua atividade de navegação geral</li>
</ul>

<h2>4. Como Usamos Seus Dados</h2>
<table>
    <thead>
        <tr>
            <th>Finalidade</th>
            <th>Base Legal</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Prestação do serviço ReplyStack (geração de respostas IA, agregação de avaliações)</td>
            <td>Execução do contrato</td>
        </tr>
        <tr>
            <td>Gestão da sua conta de usuário</td>
            <td>Execução do contrato</td>
        </tr>
        <tr>
            <td>Processamento de pagamentos e faturamento</td>
            <td>Execução do contrato / Obrigação legal</td>
        </tr>
        <tr>
            <td>Envio de emails transacionais (conta, faturamento, segurança)</td>
            <td>Execução do contrato</td>
        </tr>
        <tr>
            <td>Melhoria dos nossos serviços através de análises</td>
            <td>Interesse legítimo</td>
        </tr>
        <tr>
            <td>Segurança e prevenção de fraudes</td>
            <td>Interesse legítimo / Obrigação legal</td>
        </tr>
        <tr>
            <td>Comunicações de marketing</td>
            <td>Consentimento (opt-in)</td>
        </tr>
    </tbody>
</table>

<h2>5. Destinatários e Operadores</h2>
<p>Compartilhamos seus dados com os seguintes prestadores de serviços:</p>
<table>
    <thead>
        <tr>
            <th>Destinatário</th>
            <th>Finalidade</th>
            <th>Localização</th>
            <th>Garantias</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Anthropic, PBC</td>
            <td>Geração de respostas IA</td>
            <td>EUA</td>
            <td>DPF, CCT</td>
        </tr>
        <tr>
            <td>Railway, Inc.</td>
            <td>Hospedagem de API</td>
            <td>EUA</td>
            <td>DPF, CCT</td>
        </tr>
        <tr>
            <td>Vercel Inc.</td>
            <td>Hospedagem de Frontend</td>
            <td>EUA</td>
            <td>DPF, CCT</td>
        </tr>
        <tr>
            <td>Lemon Squeezy, LLC</td>
            <td>Processamento de pagamentos</td>
            <td>EUA</td>
            <td>DPF, CCT, PCI-DSS</td>
        </tr>
        <tr>
            <td>Google LLC</td>
            <td>OAuth (se conectado)</td>
            <td>EUA</td>
            <td>DPF, CCT</td>
        </tr>
        <tr>
            <td>Meta Platforms, Inc.</td>
            <td>OAuth (se conectado)</td>
            <td>EUA</td>
            <td>DPF, CCT</td>
        </tr>
    </tbody>
</table>
<p><small>DPF = Data Privacy Framework UE-EUA; CCT = Cláusulas Contratuais Tipo</small></p>

<h2>6. Transferências Internacionais de Dados</h2>
<p>Seus dados podem ser transferidos e processados nos Estados Unidos. Garantimos proteção adequada através de:</p>
<ul>
    <li>Certificação Data Privacy Framework UE-EUA dos nossos operadores</li>
    <li>Cláusulas Contratuais Tipo (CCT) aprovadas pela Comissão Europeia</li>
    <li>Seu consentimento explícito para essas transferências ao criar sua conta</li>
</ul>

<h2>7. Retenção de Dados</h2>
<table>
    <thead>
        <tr>
            <th>Tipo de Dados</th>
            <th>Período de Retenção</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Dados da conta</td>
            <td>Duração da assinatura + 3 anos</td>
        </tr>
        <tr>
            <td>Avaliações e respostas</td>
            <td>Duração da assinatura + 1 ano</td>
        </tr>
        <tr>
            <td>Tokens OAuth</td>
            <td>Até desconexão ou expiração</td>
        </tr>
        <tr>
            <td>Logs do servidor</td>
            <td>12 meses</td>
        </tr>
        <tr>
            <td>Documentos de faturamento</td>
            <td>10 anos (obrigação legal)</td>
        </tr>
    </tbody>
</table>

<h2>8. Seus Direitos de Privacidade</h2>

<h3>8.1 Direitos para Todos os Usuários</h3>
<ul>
    <li><strong>Direito de acesso:</strong> Solicitar uma cópia dos seus dados pessoais</li>
    <li><strong>Direito de retificação:</strong> Corrigir dados inexatos ou incompletos</li>
    <li><strong>Direito de eliminação:</strong> Solicitar a exclusão dos seus dados ("direito ao esquecimento")</li>
    <li><strong>Direito à portabilidade:</strong> Receber seus dados em formato estruturado</li>
    <li><strong>Direito de oposição:</strong> Opor-se a determinados tratamentos</li>
    <li><strong>Direito de revogação do consentimento:</strong> Revogar seu consentimento a qualquer momento</li>
</ul>

<div class="jurisdiction-notice">
    <h3>8.2 Direitos Adicionais para Residentes da UE/EEE (RGPD)</h3>
    <ul>
        <li>Direito de apresentar reclamação à sua Autoridade de Proteção de Dados local</li>
        <li>Direito à limitação do tratamento</li>
        <li>Direito a não ser sujeito a decisões automatizadas</li>
    </ul>
</div>

<div class="jurisdiction-notice">
    <h3>8.3 Direitos Adicionais para Residentes da Califórnia (CCPA)</h3>
    <ul>
        <li>Direito de saber quais informações pessoais são coletadas, usadas e compartilhadas</li>
        <li>Direito de excluir informações pessoais</li>
        <li>Direito de recusar a venda de informações pessoais (Nota: NÃO vendemos dados pessoais)</li>
        <li>Direito à não discriminação pelo exercício dos seus direitos</li>
    </ul>
</div>

<div class="jurisdiction-notice">
    <h3>8.4 Direitos Adicionais para Residentes do Brasil (LGPD)</h3>
    <ul>
        <li>Direito à informação sobre o compartilhamento de dados com terceiros</li>
        <li>Direito à anonimização, bloqueio ou eliminação de dados excessivos</li>
        <li>Direito à revogação do consentimento</li>
    </ul>
</div>

<h3>8.5 Como Exercer Seus Direitos</h3>
<p>Para exercer qualquer um desses direitos, entre em contato conosco em: <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></p>
<p>Responderemos dentro de 30 dias após o recebimento da sua solicitação.</p>

<h2>9. Cookies</h2>
<p>Usamos cookies essenciais para autenticação e segurança. Para informações detalhadas, consulte nossa <a href="/cookies?lang=pt">Política de Cookies</a>.</p>

<h2>10. Medidas de Segurança</h2>
<p>Implementamos medidas técnicas e organizacionais apropriadas para proteger seus dados:</p>
<ul>
    <li>Criptografia de dados sensíveis em repouso (AES-256)</li>
    <li>Criptografia HTTPS para todos os dados em trânsito</li>
    <li>Tokens OAuth criptografados em repouso</li>
    <li>Senhas hasheadas usando bcrypt</li>
    <li>Auditorias de segurança regulares</li>
    <li>Controles de acesso e logging</li>
    <li>Treinamento de funcionários em proteção de dados</li>
</ul>

<h2>11. Privacidade da Extensão do Navegador</h2>
<p>A extensão de navegador ReplyStack:</p>
<ul>
    <li>Só é ativada nas plataformas de avaliações suportadas (Google Business, TripAdvisor, etc.)</li>
    <li>NÃO rastreia sua atividade de navegação geral</li>
    <li>NÃO coleta dados de páginas fora das plataformas suportadas</li>
    <li>Requer permissões apenas para funcionalidade (armazenamento, aba ativa em sites de avaliações)</li>
    <li>Processa dados de avaliações localmente antes de sincronizar com sua conta</li>
</ul>

<h2>12. Privacidade de Menores</h2>
<p>A ReplyStack não é destinada a usuários menores de 18 anos. Não coletamos conscientemente dados pessoais de crianças. Se você acredita que coletamos dados de um menor, entre em contato conosco imediatamente.</p>

<h2>13. Alterações nesta Política</h2>
<p>Podemos atualizar esta Política de Privacidade periodicamente. Nós:</p>
<ul>
    <li>Notificaremos você por email sobre alterações importantes</li>
    <li>Forneceremos um aviso de 30 dias antes das alterações entrarem em vigor</li>
    <li>Atualizaremos a data de "Última atualização" no topo desta página</li>
</ul>

<h2>14. Contato e Reclamações</h2>
<p>Para perguntas ou reclamações sobre esta política ou nossas práticas de dados:</p>
<ul>
    <li><strong>Email:</strong> <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
    <li><strong>Endereço:</strong> {{ $companyName }}, {{ $companyAddress }}</li>
</ul>

<p>Você também pode entrar em contato com a autoridade supervisora relevante:</p>
<ul>
    <li><strong>UE:</strong> Sua Autoridade de Proteção de Dados local</li>
    <li><strong>Marrocos:</strong> CNDP (Commission Nationale de contrôle de la protection des Données à caractère personnel)</li>
    <li><strong>Califórnia:</strong> Procurador-Geral da Califórnia</li>
    <li><strong>Brasil:</strong> ANPD (Autoridade Nacional de Proteção de Dados)</li>
</ul>
@endsection
