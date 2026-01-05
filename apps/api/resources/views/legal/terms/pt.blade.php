@extends('legal.layouts.legal')

@section('title', 'Termos de Uso')
@section('link_legal', 'Aviso Legal')
@section('link_terms', 'Termos de Uso')
@section('link_sales', 'Condições de Venda')
@section('link_privacy', 'Política de Privacidade')
@section('link_cookies', 'Política de Cookies')

@section('content')
<h1>Termos de Uso</h1>
<p class="last-updated">{{ $translations['lastUpdated'] }}: {{ $lastUpdatedDate }}</p>

<div class="highlight-box">
    <strong>Importante:</strong> Ao usar o ReplyStack, você concorda com estes Termos de Uso. Por favor, leia-os atentamente antes de usar nossos serviços.
</div>

<h2>1. Definições</h2>
<ul>
    <li><strong>"ReplyStack"</strong>, <strong>"nós"</strong>, <strong>"nos"</strong>, <strong>"nosso"</strong>: {{ $companyName }}, uma {{ $companyForm }} registrada sob a lei marroquina, ICE {{ $companyId }}.</li>
    <li><strong>"Serviço"</strong>: A plataforma ReplyStack incluindo a aplicação web, o painel de controle, a extensão do navegador e todas as funcionalidades relacionadas.</li>
    <li><strong>"Usuário"</strong>, <strong>"você"</strong>, <strong>"seu"</strong>: Qualquer pessoa física ou jurídica que utiliza o Serviço.</li>
    <li><strong>"Conteúdo"</strong>: Todo texto, dado, informação, avaliação, resposta e material carregado, gerado ou processado através do Serviço.</li>
    <li><strong>"Conteúdo Gerado por IA"</strong>: As respostas e textos gerados pelo sistema de inteligência artificial integrado ao ReplyStack.</li>
</ul>

<h2>2. Aceitação dos Termos</h2>
<p>Ao criar uma conta, instalar a extensão do navegador ou usar qualquer parte do Serviço, você reconhece que leu, entendeu e concorda em estar vinculado a estes Termos de Uso.</p>
<p>Se você não concordar com estes termos, não deve usar o Serviço.</p>

<h2>3. Descrição do Serviço</h2>
<p>O ReplyStack fornece:</p>
<ul>
    <li>Geração de respostas a avaliações de clientes assistida por IA</li>
    <li>Uma extensão de navegador para Chrome e Firefox para gerar respostas diretamente nas plataformas de avaliações</li>
    <li>Um painel web para gerenciar respostas, visualizar análises e configurar preferências</li>
    <li>Integração com plataformas de avaliações de terceiros (Google Business, TripAdvisor, etc.)</li>
</ul>

<h2>4. Registro de Conta</h2>

<h3>4.1 Elegibilidade</h3>
<p>Você deve ter pelo menos 18 anos e ter capacidade legal para celebrar contratos para usar o Serviço. Ao usar o ReplyStack, você declara e garante que atende a estes requisitos.</p>

<h3>4.2 Informações da Conta</h3>
<p>Você se compromete a:</p>
<ul>
    <li>Fornecer informações precisas, atuais e completas durante o registro</li>
    <li>Manter e atualizar prontamente as informações da sua conta</li>
    <li>Manter sua senha segura e confidencial</li>
    <li>Nos notificar imediatamente sobre qualquer uso não autorizado da sua conta</li>
</ul>

<h3>4.3 Responsabilidade da Conta</h3>
<p>Você é responsável por todas as atividades que ocorrem sob sua conta. Não somos responsáveis por perdas ou danos decorrentes do uso não autorizado da sua conta.</p>

<h2>5. Uso Aceitável</h2>

<h3>5.1 Usos Permitidos</h3>
<p>Você pode usar o Serviço para:</p>
<ul>
    <li>Gerar respostas assistidas por IA a avaliações legítimas de clientes do seu negócio</li>
    <li>Gerenciar e acompanhar respostas a avaliações</li>
    <li>Acessar análises e insights sobre a gestão das suas avaliações</li>
</ul>

<h3>5.2 Usos Proibidos</h3>
<p>Você se compromete a NÃO:</p>
<ul>
    <li>Usar o Serviço para fins ilegais ou em violação de qualquer lei</li>
    <li>Gerar respostas difamatórias, abusivas, assediadoras ou discriminatórias</li>
    <li>Usar o Serviço para enganar consumidores ou publicar avaliações falsas</li>
    <li>Tentar fazer engenharia reversa, descompilar ou desmontar o Serviço</li>
    <li>Usar sistemas automatizados (bots, scrapers) para acessar o Serviço além do uso normal</li>
    <li>Compartilhar suas credenciais de conta com terceiros</li>
    <li>Revender, redistribuir ou sublicenciar o acesso ao Serviço</li>
    <li>Interferir com ou interromper o Serviço ou servidores</li>
    <li>Contornar quaisquer limites de uso ou cotas</li>
    <li>Usar o Serviço para competir com o ReplyStack</li>
</ul>

<h2>6. Conteúdo Gerado por IA</h2>

<h3>6.1 Natureza das Respostas de IA</h3>
<p>As respostas geradas pelo ReplyStack são produzidas por inteligência artificial. Embora busquemos precisão e qualidade:</p>
<ul>
    <li>O conteúdo gerado por IA pode conter erros ou imprecisões</li>
    <li>As respostas são sugestões e devem ser revisadas antes da publicação</li>
    <li>Você é o único responsável por revisar e aprovar qualquer conteúdo antes da publicação</li>
</ul>

<h3>6.2 Responsabilidade do Usuário</h3>
<p>Você reconhece e concorda que:</p>
<ul>
    <li>Revisará todas as respostas geradas por IA antes de publicá-las</li>
    <li>É responsável pela precisão e adequação das respostas publicadas</li>
    <li>O ReplyStack não é responsável pelas consequências decorrentes das respostas publicadas</li>
    <li>Não responsabilizará o ReplyStack por danos resultantes do conteúdo gerado por IA</li>
</ul>

<h2>7. Propriedade Intelectual</h2>

<h3>7.1 Propriedade do ReplyStack</h3>
<p>O Serviço, incluindo seu design, funcionalidades, código e toda a propriedade intelectual relacionada, é de propriedade de {{ $companyName }}. Você recebe uma licença limitada, não exclusiva e intransferível para usar o Serviço de acordo com estes Termos.</p>

<h3>7.2 Seu Conteúdo</h3>
<p>Você mantém a propriedade do seu conteúdo original. Ao usar o Serviço, você nos concede uma licença limitada para processar seu conteúdo exclusivamente para fornecer o Serviço.</p>

<h3>7.3 Respostas Geradas por IA</h3>
<p>Você pode usar as respostas geradas por IA para os fins do seu negócio. Não reivindicamos a propriedade do conteúdo gerado por IA criado para seu uso.</p>

<h2>8. Serviços de Terceiros</h2>

<h3>8.1 Integração de Plataformas</h3>
<p>O Serviço se integra com plataformas de terceiros (Google, Facebook, TripAdvisor, etc.). Seu uso dessas integrações também está sujeito aos termos de serviço dessas plataformas.</p>

<h3>8.2 Sem Endosso</h3>
<p>A integração com serviços de terceiros não constitui endosso pelo ReplyStack. Não somos responsáveis pela disponibilidade, precisão ou políticas dos serviços de terceiros.</p>

<h2>9. Disponibilidade do Serviço</h2>

<h3>9.1 Uptime</h3>
<p>Nos esforçamos para manter alta disponibilidade do Serviço, mas não garantimos acesso ininterrupto. O Serviço pode estar temporariamente indisponível devido a:</p>
<ul>
    <li>Manutenção programada (forneceremos aviso prévio quando possível)</li>
    <li>Manutenção de emergência ou atualizações</li>
    <li>Fatores fora do nosso controle (interrupções de internet, problemas de serviços de terceiros)</li>
</ul>

<h3>9.2 Modificações</h3>
<p>Reservamos o direito de modificar, suspender ou descontinuar qualquer parte do Serviço a qualquer momento. Forneceremos aviso razoável para alterações importantes.</p>

<h2>10. Limitação de Responsabilidade</h2>

<div class="warning-box">
    <p><strong>Importante:</strong> Na máxima extensão permitida por lei:</p>
    <ul>
        <li>O Serviço é fornecido "COMO ESTÁ" e "CONFORME DISPONÍVEL" sem garantias de qualquer tipo</li>
        <li>Rejeitamos todas as garantias implícitas, incluindo comercialização e adequação a um propósito específico</li>
        <li>Não somos responsáveis por danos indiretos, incidentais, especiais, consequenciais ou punitivos</li>
        <li>Nossa responsabilidade total não excederá o valor que você nos pagou nos 12 meses anteriores à reclamação</li>
    </ul>
</div>

<h2>11. Indenização</h2>
<p>Você concorda em indenizar, defender e isentar o ReplyStack, seus diretores, administradores, funcionários e agentes de quaisquer reclamações, danos, perdas, responsabilidades e despesas (incluindo honorários advocatícios) decorrentes de:</p>
<ul>
    <li>Seu uso do Serviço</li>
    <li>Sua violação destes Termos</li>
    <li>Sua violação de direitos de terceiros</li>
    <li>Conteúdo que você publicar usando o Serviço</li>
</ul>

<h2>12. Rescisão</h2>

<h3>12.1 Rescisão por Você</h3>
<p>Você pode rescindir sua conta a qualquer momento entrando em contato conosco ou usando as configurações da conta. Após a rescisão, seu direito de usar o Serviço cessará imediatamente.</p>

<h3>12.2 Rescisão por Nós</h3>
<p>Podemos suspender ou rescindir sua conta se:</p>
<ul>
    <li>Você violar estes Termos de Uso</li>
    <li>Seu uso apresentar um risco de segurança</li>
    <li>Você não pagar as taxas aplicáveis</li>
    <li>Exigido por lei ou processo legal</li>
</ul>

<h3>12.3 Efeito da Rescisão</h3>
<p>Após a rescisão, todas as licenças concedidas a você terminarão e você deverá parar de usar o Serviço. Podemos excluir seus dados de acordo com nossa Política de Privacidade.</p>

<h2>13. Lei Aplicável e Disputas</h2>
<p>Estes Termos são regidos pelas leis do Reino do Marrocos. Qualquer disputa decorrente destes Termos ou do seu uso do Serviço estará sujeita à jurisdição exclusiva dos tribunais de Marrakech, Marrocos.</p>

<h2>14. Alterações nos Termos</h2>
<p>Podemos atualizar estes Termos periodicamente. Nós:</p>
<ul>
    <li>Notificaremos você sobre alterações importantes por email</li>
    <li>Forneceremos pelo menos 30 dias de aviso antes das alterações entrarem em vigor</li>
    <li>Atualizaremos a data de "Última atualização" no topo desta página</li>
</ul>
<p>O uso continuado do Serviço após as alterações entrarem em vigor constitui aceitação dos novos Termos.</p>

<h2>15. Disposições Diversas</h2>

<h3>15.1 Acordo Integral</h3>
<p>Estes Termos, juntamente com nossa Política de Privacidade e Condições de Venda, constituem o acordo integral entre você e o ReplyStack.</p>

<h3>15.2 Separabilidade</h3>
<p>Se qualquer disposição destes Termos for considerada inválida ou inexequível, as disposições restantes continuarão em pleno vigor e efeito.</p>

<h3>15.3 Renúncia</h3>
<p>Nossa falha em aplicar qualquer direito ou disposição destes Termos não constitui uma renúncia a tal direito ou disposição.</p>

<h3>15.4 Cessão</h3>
<p>Você não pode ceder ou transferir estes Termos sem nosso consentimento prévio por escrito. Podemos ceder nossos direitos e obrigações sem restrição.</p>

<h2>16. Contato</h2>
<p>Para perguntas sobre estes Termos de Uso:</p>
<ul>
    <li><strong>Email:</strong> <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
    <li><strong>Endereço:</strong> {{ $companyName }}, {{ $companyAddress }}</li>
</ul>
@endsection
