# Arquitetura do sistema de extensões

**Status:** Em desenvolvimento — especificação arquitetural  
**Escopo deste documento:** registrar decisões aprovadas e propostas ainda pendentes antes da implementação.  
**Plataforma-alvo inicial:** Windows  
**Branch de trabalho:** `docs/extensions-ipc`  
**Destino do PR:** `homologa`

> Este documento descreve o contrato arquitetural planejado. Não representa funcionalidades já implementadas.

## 1. Objetivos e princípios

O sistema de extensões deve permitir que desenvolvedores ampliem o Lumenion por meio de TypeScript, mantendo a engine protegida, extensível e independente da linguagem usada internamente.

Princípios:

- Extensões usam TypeScript, compilado para JavaScript.
- Extensões não acessam diretamente serviços internos C# ou módulos Rust.
- Toda capacidade da engine é exposta por contratos públicos versionados e pela Extension API Bridge.
- O Extension Manager controla instalação, validação, ciclo de vida, permissões, recursos e comunicação.
- Falhas de uma extensão não podem derrubar a engine.
- Recursos sensíveis exigem autorização explícita e auditável.
- A arquitetura deve permitir evolução incremental sem quebrar extensões compatíveis.

## 2. Plataforma e arquitetura interna

### 2.1 Plataforma

A primeira plataforma oficialmente considerada é **Windows**. A arquitetura não deve assumir suporte multiplataforma nesta etapa.

### 2.2 Arquitetura híbrida C# + Rust

Decisão aprovada: manter uma arquitetura híbrida.

- **C# Host:** aplicação MAUI/Blazor, integração com Windows, serviços da aplicação, gerenciamento de extensões e coordenação do ciclo de vida.
- **Rust Core:** módulos internos que comprovadamente se beneficiem de processamento intensivo, controle de memória, paralelismo ou operações de baixo nível.
- **React + TypeScript:** interface do Lumenion e interfaces nativas disponibilizadas às extensões.
- **TypeScript/JavaScript:** linguagem e formato de execução das extensões.

A introdução de Rust será incremental e orientada por necessidade medida. Não está aprovada uma reescrita integral do host em Rust. A comunicação C# ↔ Rust deverá ocorrer por uma fronteira nativa bem definida (por exemplo, FFI), com contratos estáveis.

## 3. Componentes do sistema

1. **Extension API / SDK:** contratos públicos TypeScript, tipos, interfaces e documentação para desenvolvedores.
2. **Extension Manager:** instalação, validação, ativação, desativação, atualização, desinstalação, dependências, permissões e recursos.
3. **Extension Runtime:** executa o JavaScript produzido a partir do TypeScript.
4. **Extension API Bridge:** valida e encaminha chamadas entre extensões e os serviços internos do Lumenion.
5. **Extension Event Broker:** valida publicação, inscrição e entrega de eventos.
6. **API Compatibility Resolver:** resolve aliases e adaptações explicitamente registradas entre versões da API.
7. **Marketplace:** catálogo, publicação, distribuição e atualização de pacotes.
8. **Interface Host:** renderiza componentes nativos e hospeda interfaces independentes em WebView isolada.

Nenhuma extensão deve receber referências diretas a objetos internos do host, C# ou Rust.

## 4. Interfaces das extensões

Decisão aprovada: oferecer ambos os modelos.

### 4.1 Componentes nativos

O SDK disponibilizará componentes integrados à interface do Lumenion, como menus, comandos, botões, painéis, abas, campos e notificações. O host controla renderização, estilo e ciclo de vida.

### 4.2 Interface independente

Extensões poderão fornecer HTML, CSS e JavaScript/TypeScript para interfaces próprias, hospedadas em uma WebView isolada. A interface não terá acesso direto ao sistema operacional ou aos serviços internos; utilizará apenas canais controlados da Extension API.

Uma extensão poderá combinar os dois modelos.

## 5. Pacotes e Marketplace

A interface inicial de Marketplace já existe no produto e deverá ser desenvolvida, não substituída por uma nova área.

O Marketplace será o principal canal de descoberta, instalação e atualização. A instalação manual por pacote continuará possível.

Formato de pacote proposto: `.lumenion-extension`.

Estrutura ilustrativa:

```text
example.lumenion-extension
├── manifest.json
├── extension.js
├── ui/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── assets/
└── README.md
```

O manifesto deverá declarar, no mínimo, identidade, versão, autor, descrição, versão da engine/API, pontos de entrada, dependências, permissões, eventos e exports públicos.

### 5.1 Publicação

Decisão aprovada: Marketplace aberto a desenvolvedores externos, com verificação e moderação.

Estados editoriais propostos:

- **Verificada:** passou pela análise técnica e de segurança definida pelo Lumenion.
- **Não verificada:** publicada sem aprovação oficial; deve ser identificada claramente.
- **Rejeitada:** não distribuída pelo catálogo.
- **Suspensa:** retirada temporariamente por risco ou violação.

A marca de verificação não concede privilégios adicionais nem substitui o consentimento de permissões. Cada atualização deve ser reavaliada.

## 6. Manifesto, instalação e ciclo de vida

O manifesto será a fonte declarativa de metadados e capacidades solicitadas. A instalação não implica ativação nem execução automática.

Estados distintos:

- **Instalada:** pacote presente e validado.
- **Ativada:** extensão autorizada e habilitada.
- **Em execução:** runtime efetivamente iniciado.

O comportamento de inicialização será declarado pela extensão e respeitará as configurações e escolhas do usuário. A implementação deverá definir callbacks de ciclo de vida (por exemplo, carregar, ativar, desativar e descarregar) no contrato do SDK.

## 7. Runtime JavaScript e isolamento

Decisão aprovada: **Node.js + V8, com um processo separado por extensão**.

- TypeScript será compilado para JavaScript executado pelo Node.js.
- Cada extensão terá seu próprio processo Node.js. Não haverá compartilhamento de memória de execução entre extensões.
- O mesmo runtime distribuído pelo Lumenion poderá ser utilizado por todos os processos, mas cada extensão terá ciclo de vida, identidade, limites e falhas isolados.
- Um **Runtime Supervisor**, coordenado pelo Host C#, será responsável por iniciar, monitorar, suspender e encerrar os processos, além de administrar versões, recursos e ciclo de vida.
- Extensões não terão acesso direto a objetos internos do host ou de outras extensões; utilizarão a Extension API Bridge e canais IPC autenticados e validados.
- Interfaces independentes serão hospedadas em WebView2, separadas do processo lógico Node.js e sem acesso direto ao sistema operacional ou aos serviços internos.
- Extensões que solicitem capacidades sensíveis (por exemplo, execução de comandos ou processos externos) estarão sujeitas a restrições adicionais do Windows, a serem especificadas e testadas.

**Requisito de segurança:** node:vm, worker_threads, contextos V8 e iframes não serão tratados isoladamente como fronteiras de segurança entre extensões não confiáveis. A separação principal será feita por processo do sistema operacional, reforçada por controles de identidade, permissões, limites de recursos e IPC. A política concreta de sandbox do Windows ainda deverá ser detalhada na revisão de segurança.

### 7.1 Comunicação entre processos (IPC)

Decisão aprovada: **Windows Named Pipes como transporte, com JSON-RPC 2.0 como protocolo de mensagens**.

- Cada processo Node.js de extensão terá um canal IPC próprio, criado e administrado pelo Runtime Supervisor/Host C#.
- O canal será local ao sistema operacional; não será necessário abrir uma porta TCP para a comunicação entre o runtime e o host.
- JSON-RPC 2.0 padronizará chamadas de métodos, parâmetros, identificadores de requisição, respostas, erros e notificações.
- O Host C# será o ponto de mediação para chamadas à Extension API e para acesso a serviços internos ou módulos Rust.
- Chamadas entre extensões serão encaminhadas pelo host/Extension Manager; uma extensão não receberá acesso direto ao canal privado de outra.
- Cada conexão deverá ser associada a uma identidade de extensão e validada pelo host. A autorização será verificada em cada operação, não apenas no estabelecimento da conexão.
- Mensagens e parâmetros deverão obedecer a schemas versionados, limites de tamanho e políticas contra abuso, repetição e excesso de chamadas.
- Falhas, desconexões e timeouts deverão produzir erros controlados sem comprometer o host ou outros runtimes.

O uso de Named Pipes não substitui o sandbox do Windows nem a validação de permissões. ACLs, autenticação da identidade do processo, proteção contra sequestro de pipe, política de reconexão, timeouts e limites de mensagens ainda deverão ser detalhados na especificação de segurança.

A comunicação com WebView2 é uma fronteira distinta: continuará usando o mecanismo de mensagens do WebView2, com validação de origem, conteúdo e schemas. Não se deve expor diretamente o pipe do runtime à interface web.

## 8. Permissões e operações sensíveis

As permissões serão granulares, declaradas no manifesto e verificadas pelo Extension Manager. A extensão não pode conceder permissões a si mesma.

Níveis de acesso a projetos:

- **Leitura:** consultar informações e recursos autorizados.
- **Modificação:** criar, editar e excluir elementos por APIs controladas.
- **Avançado:** operações estruturais ou sensíveis, sempre sujeitas à política de autorização.

### 8.1 Execução de processos e CMD

Extensões não recebem acesso direto ao terminal. Solicitações de execução passam por uma API mediada pelo host.

A solicitação de autorização deve identificar:

- extensão solicitante e publicador;
- comando completo, argumentos e diretório de trabalho;
- privilégios e recursos envolvidos;
- finalidade declarada;
- consequências relevantes que o Lumenion consiga determinar.

A janela de autorização é criada pelo próprio Lumenion e não pode ser simulada ou controlada pela extensão.

Níveis de consentimento aprovados:

1. **Permitir uma vez:** uma única operação.
2. **Permitir nesta sessão:** até o encerramento da sessão atual.
3. **Sempre permitir para esta extensão:** regra persistente e específica para a capacidade, revogável nas configurações.

A permissão persistente não equivale a liberar todo o CMD. A execução deve usar argumentos estruturados sempre que possível, evitar composição insegura de shell e registrar resultado e decisão. A confirmação do usuário não transforma um comando desconhecido em comando seguro.

## 9. Recursos e limites

Decisão aprovada: limites globais e individuais, ambos configuráveis nas configurações do Lumenion.

Controles previstos:

- orçamento global de memória e CPU para extensões;
- limites individuais de memória e CPU;
- quantidade máxima de extensões ativas;
- prioridade e suspensão de extensões;
- permissões de rede e processos;
- capacidade de interromper ou encerrar uma extensão.

Limites individuais nunca poderão ultrapassar os limites globais. Valores padrão, mecanismo de medição e política exata de throttling/suspensão/encerramento ainda precisam ser especificados e testados.

Comportamento proposto diante de excesso: advertir, suspender e, se necessário, encerrar a extensão. A política deve evitar perda silenciosa de dados e preservar a estabilidade do host.

## 10. Eventos e comunicação entre extensões

O sistema terá:

- **eventos oficiais**, publicados pelo Lumenion;
- **eventos personalizados**, publicados por extensões para outras extensões.

Toda comunicação passa pelo Extension Event Broker, que valida identidade da origem e destino, permissões, schema, tamanho, frequência, compatibilidade e limites contra recursão/loops.

Eventos personalizados devem usar namespace próprio, preferencialmente identificador reverso de domínio, por exemplo `com.example.model.generated`.

Cada extensão declara eventos que pretende publicar e consumir. Publicar um evento não concede a todas as extensões acesso automático ao conteúdo; o broker aplica a política de destinatários e permissões.

## 11. Dependências e exports TypeScript

Extensões poderão declarar dependências obrigatórias e opcionais.

- Dependência obrigatória ausente ou incompatível impede a ativação da extensão dependente.
- Dependência opcional ausente desabilita apenas a funcionalidade que a utiliza.
- Dependências circulares devem ser detectadas e bloqueadas.
- O instalador/Marketplace deve resolver e apresentar dependências antes de concluir a instalação.

### 11.1 API de exports

Extensões poderão disponibilizar funções, classes e interfaces TypeScript para reutilização por outras extensões.

Visibilidade:

- **Privada:** somente a própria extensão.
- **Interna:** disponível às extensões declaradas como dependentes.
- **Pública:** descoberta por qualquer extensão instalada, sujeita às verificações e permissões.

O sistema reconhecerá `export default` como ponto de entrada/objeto principal e `export` nomeados para funções e classes específicas, conforme o contrato final do SDK.

Uma extensão não importará diretamente arquivos ou objetos internos de outra. O Extension Manager fornecerá proxies tipados e encaminhará chamadas por IPC/mensageria controlada. A interface pública deverá declarar versão e schema de argumentos e resultados.

### 11.2 Autorização de chamadas

Na primeira utilização, o Lumenion poderá solicitar autorização identificando extensão solicitante, extensão de destino e função chamada. O usuário poderá permitir uma vez, durante a sessão ou permanentemente. A autorização persistente será revogável e limitada à função/capacidade concedida.

## 12. Compatibilidade e versionamento

A API será versionada. Extensões declararão as versões de engine e API suportadas no manifesto. O Marketplace e o Extension Manager verificarão compatibilidade antes de instalar/ativar.

Decisão aprovada: compatibilidade adaptativa, com estas regras:

- **Nova classe/método:** sua ausência em extensão antiga é tolerada quando a capacidade for opcional e não for necessária ao fluxo usado.
- **Classe subdividida/removida:** se a operação depender da estrutura incompatível, desabilitar a operação afetada e avisar o usuário.
- **Renomeação:** tentar resolver por aliases e mapeamentos oficiais registrados.
- **Mudança de assinatura/parâmetros:** adaptar somente com conversão explicitamente conhecida e segura; caso contrário, sinalizar incompatibilidade.
- **Falha localizada:** desabilitar a função ou módulo incompatível, não a extensão inteira, sempre que for possível isolar o impacto.

O API Compatibility Resolver não deve adivinhar equivalências. Toda migração automática precisa ser registrada, testada e versionada. Mudanças incompatíveis devem ser documentadas.

## 13. Módulos da Extension API e entrega gradual

Decisão aprovada: implementação por fases.

### Fase 1 — fundação

- `core`
- `projects`
- `filesystem`
- `assets`
- `ui`
- `events`

### Fase 2 — ferramentas e interoperabilidade

- `editor`
- `scenes`
- `scripting`
- `extensions`

### Fase 3 — execução e integrações sensíveis

- `runtime`
- `build`
- `processes`
- `network`

A ordem é uma estratégia de entrega, não uma promessa de que todos os detalhes de cada módulo já estejam especificados. Cada módulo terá contratos, permissões, schemas, testes e documentação próprios antes de ser disponibilizado.

## 14. Itens ainda pendentes de decisão técnica

Os itens abaixo não devem ser considerados aprovados por inferência:

- protocolo específico de mensagens entre WebView2 e a camada de UI, incluindo validação de origem e schemas;
- formato final do manifesto e do pacote;
- algoritmo de assinatura, verificação de integridade e cadeia de confiança do Marketplace;
- valores padrão e métricas para limites de CPU/memória;
- política exata de ativação automática e callbacks de ciclo de vida;
- schemas definitivos dos módulos da API;
- estratégia de armazenamento de permissões e histórico/auditoria;
- política de atualização, rollback e recuperação de falhas.

## 15. Estado da especificação

As decisões registradas nas seções 2 a 13 foram discutidas e aprovadas conceitualmente. A especificação completa ainda está **em desenvolvimento** até que os itens pendentes sejam resolvidos e o documento seja revisado pelo usuário.

Nenhuma implementação de runtime, API ou Marketplace é autorizada apenas por este documento. A implementação deverá ocorrer posteriormente em branch própria, com testes e PR direcionado a `homologa`.
