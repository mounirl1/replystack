@extends('legal.layouts.legal')

@section('title', 'Aviso Legal')
@section('link_legal', 'Aviso Legal')
@section('link_terms', 'Termos de Uso')
@section('link_sales', 'Condições de Venda')
@section('link_privacy', 'Política de Privacidade')
@section('link_cookies', 'Política de Cookies')

@section('content')
<h1>Aviso Legal</h1>
<p class="last-updated">{{ $translations['lastUpdated'] }}: {{ $lastUpdatedDate }}</p>

<h2>1. Editor do Site</h2>
<p>Este site é publicado por:</p>
<ul>
    <li><strong>Razão Social:</strong> {{ $companyName }}</li>
    <li><strong>Nome Comercial:</strong> {{ $commercialName }}</li>
    <li><strong>Forma Jurídica:</strong> {{ $companyForm }} (Sociedade Anônima sob a Lei Marroquina)</li>
    <li><strong>ICE (Identifiant Commun de l'Entreprise):</strong> {{ $companyId }}</li>
    <li><strong>Sede:</strong> {{ $companyAddress }}</li>
    <li><strong>Email:</strong> <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
</ul>

<h2>2. Diretor de Publicação</h2>
<p>O Diretor de Publicação responsável pelo conteúdo deste site é:</p>
<ul>
    <li><strong>Nome:</strong> {{ $directorName }}</li>
    <li><strong>Cargo:</strong> {{ $directorTitle }}</li>
    <li><strong>Contato:</strong> <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
</ul>

<h2>3. Hospedagem</h2>
<p>Este site é hospedado por:</p>

<h3>3.1 API (Backend)</h3>
<ul>
    <li><strong>Provedor:</strong> Railway Corporation</li>
    <li><strong>Endereço:</strong> 548 Market St, PMB 65883, San Francisco, CA 94104, USA</li>
    <li><strong>Site:</strong> <a href="https://railway.app" target="_blank">railway.app</a></li>
</ul>

<h3>3.2 Aplicação Web (Frontend)</h3>
<ul>
    <li><strong>Provedor:</strong> Vercel Inc.</li>
    <li><strong>Endereço:</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</li>
    <li><strong>Site:</strong> <a href="https://vercel.com" target="_blank">vercel.com</a></li>
</ul>

<h2>4. Propriedade Intelectual</h2>

<h3>4.1 Marcas</h3>
<p>ReplyStack® e o logotipo ReplyStack são marcas registradas de {{ $companyName }}. É proibida qualquer reprodução, imitação ou uso não autorizado destas marcas.</p>

<h3>4.2 Conteúdo do Site</h3>
<p>Todo o conteúdo deste site (textos, imagens, gráficos, logotipos, ícones, sons, software, etc.) é propriedade exclusiva de {{ $companyName }} ou de seus parceiros e está protegido pelas leis de propriedade intelectual.</p>
<p>É proibida qualquer reprodução, representação, modificação, publicação ou adaptação de todo ou parte dos elementos do site sem autorização prévia por escrito de {{ $companyName }}.</p>

<h3>4.3 Software</h3>
<p>A plataforma ReplyStack, incluindo a aplicação web e a extensão do navegador, é software proprietário. O código-fonte, algoritmos e tecnologia subjacente estão protegidos por direitos de propriedade intelectual.</p>

<h2>5. Conteúdo Gerado pelo Usuário</h2>
<p>Os usuários podem gerar conteúdo através do Serviço (como respostas geradas por IA). Os usuários mantêm os direitos sobre seu conteúdo original, mas concedem a {{ $companyName }} uma licença para processar tal conteúdo para fins de prestação do serviço, conforme descrito em nossos Termos de Uso.</p>

<h2>6. Limitação de Responsabilidade</h2>

<h3>6.1 Informações do Site</h3>
<p>{{ $companyName }} se esforça para garantir que as informações disponíveis neste site sejam precisas e atualizadas. No entanto, não podemos garantir a precisão, integridade ou atualidade das informações fornecidas. Reservamo-nos o direito de modificar o conteúdo a qualquer momento sem aviso prévio.</p>

<h3>6.2 Links Externos</h3>
<p>Este site pode conter links para sites de terceiros. {{ $companyName }} não tem controle sobre o conteúdo desses sites externos e isenta-se de toda responsabilidade por seu conteúdo, incluindo quaisquer produtos, serviços ou informações que possam oferecer.</p>

<h3>6.3 Conteúdo Gerado por IA</h3>
<p>As respostas geradas pela inteligência artificial do ReplyStack são apenas sugestões. Os usuários são os únicos responsáveis por revisar e aprovar qualquer conteúdo antes da publicação. {{ $companyName }} não é responsável pelas consequências da publicação de conteúdo gerado por IA.</p>

<h2>7. Lei Aplicável</h2>
<p>Este site e seu conteúdo são regidos pelas leis do Reino do Marrocos. Qualquer disputa relacionada ao uso deste site estará sujeita à jurisdição exclusiva dos tribunais de Marrakech, Marrocos.</p>

<h2>8. Proteção de Dados</h2>
<p>Os dados pessoais coletados através deste site são processados de acordo com as leis de proteção de dados aplicáveis, incluindo:</p>
<ul>
    <li>A Lei marroquina 09-08 sobre a proteção de pessoas físicas em relação ao tratamento de dados pessoais</li>
    <li>O Regulamento Geral sobre a Proteção de Dados (RGPD) da UE para usuários europeus</li>
    <li>O California Consumer Privacy Act (CCPA) para residentes da Califórnia</li>
    <li>A Lei Geral de Proteção de Dados (LGPD) do Brasil para usuários brasileiros</li>
</ul>
<p>Para mais informações, consulte nossa <a href="/privacy?lang=pt">Política de Privacidade</a>.</p>

<h2>9. Acessibilidade</h2>
<p>Nos esforçamos para tornar nosso site acessível a todos os usuários. Se você encontrar problemas de acessibilidade, entre em contato conosco em <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a>.</p>

<h2>10. Créditos</h2>
<p>Design e desenvolvimento do site: {{ $companyName }}</p>

<h2>11. Contato</h2>
<p>Para qualquer dúvida sobre este aviso legal:</p>
<ul>
    <li><strong>Email:</strong> <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
    <li><strong>Endereço:</strong> {{ $companyName }}, {{ $companyAddress }}</li>
</ul>
@endsection
