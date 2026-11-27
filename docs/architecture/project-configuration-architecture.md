# Arquitetura de criação, configuração e ciclo de vida de projetos

**Status do documento:** Em revisão  
**Status da implementação:** Não iniciada  
**Escopo:** criação de projetos, editor de configurações, Game Editor, persistência e pacote `.light`.

## 1. Objetivo

Definir uma arquitetura única para que as informações escolhidas na criação de um projeto sejam preservadas, disponibilizadas aos dois editores e transportadas na exportação/importação. A arquitetura também estabelece que a dimensão inicial (2D ou 3D) é imutável durante toda a vida do projeto.

Este documento registra decisões já alinhadas e propostas técnicas que ainda precisam ser validadas. Ele não representa implementação concluída nem contrato de código definitivo.

## 2. Problemas observados no estado atual

A inspeção do frontend identificou os seguintes pontos:

- A configuração atual é limitada a dimensão, modo de programação, resolução, VSync, gravidade e modo de depuração.
- A janela de criação/edição permite alterar a dimensão mesmo quando o projeto já existe.
- O modelo `StoredProject` mantém identidade, configuração e timestamps, mas não representa um manifesto completo do projeto.
- O armazenamento atual de projetos usa `localStorage`; a pasta física é criada por meio da bridge, mas o fluxo ainda não estabelece um manifesto persistente como fonte oficial.
- O Game Editor carrega o projeto por ID e distribui o objeto `StoredProject` aos componentes, portanto recebe somente os dados existentes nesse modelo.
- O formato `.light` atual serializa estruturas de configuração e scripts, mas o contrato atual não define um manifesto abrangente nem garante o empacotamento de todos os arquivos reais do projeto.
- A imagem selecionada pode ser mantida como URL temporária de objeto do navegador; esse endereço não é uma referência durável para um pacote exportado.
- O fluxo de exportação atual ainda possui conteúdo de script de exemplo/placeholder e precisa ser substituído por serialização dos dados reais.

Esses pontos são a referência inicial da implementação. Antes de alterar os fluxos, deve-se confirmar a situação atual dos serviços C#/MAUI e da bridge de arquivos.

## 3. Conceitos e responsabilidades

### 3.1 Project Creator

Responsável por coletar os dados iniciais:

- Identidade: nome, descrição e imagem/ícone.
- Dimensão: 2D ou 3D.
- Template/modelo inicial.
- Linguagem ou modo de programação.
- Configurações iniciais do projeto.

O criador deve oferecer dois níveis de configuração:

- **Simplificado:** opções essenciais, com escolhas e explicações acessíveis.
- **Avançado:** parâmetros completos, agrupados por categoria.

Os dois níveis editam o mesmo modelo de dados. Não devem existir configurações paralelas ou incompatíveis.

### 3.2 Project Core

Camada central e independente da interface React. Deve ser a autoridade para:

- Carregar e fornecer o contexto completo do projeto.
- Validar o manifesto e sua versão.
- Aplicar alterações permitidas.
- Proteger propriedades imutáveis, especialmente a dimensão.
- Persistir alterações.
- Coordenar eventos e atualizações entre os editores.
- Gerenciar compatibilidade, migrações, importação e exportação.
- Aplicar políticas de acesso para extensões.

O manifesto não deve pertencer ao estado de um componente React nem a um dos editores. Ele pertence ao núcleo do sistema de projetos.

### 3.3 Project Settings Editor

Editor dedicado à configuração do projeto. Deve:

- Receber o manifesto completo.
- Exibir as mesmas categorias e valores definidos no criador.
- Permitir alterações nos campos editáveis.
- Exibir a dimensão como informação fixa, sem affordance de edição.
- Validar e salvar alterações por meio do Project Core.

O modo simplificado/avançado deve estar disponível também nesse editor, mantendo o mesmo modelo e as mesmas regras.

### 3.4 Game Editor

É um editor distinto do editor de configurações. Deve receber o contexto completo do projeto para que seus subsistemas possam consultar identidade, dimensão, template, linguagem e configurações.

Isso não significa que todos os parâmetros devam aparecer na interface do Game Editor. Cada subsistema utiliza somente os dados relevantes, mas todos devem estar acessíveis por uma interface de contexto comum.

### 3.5 Project Storage

Responsável pela persistência durável dos dados. A direção arquitetural proposta é:

- Pasta do projeto no disco como unidade persistente.
- Manifesto do projeto como fonte oficial de identidade e configurações.
- Arquivos de cenas, scripts e assets armazenados no projeto.
- `localStorage` limitado a índice/cache e estado auxiliar da interface, não como autoridade sobre os dados do projeto.

A adoção definitiva depende de validar a bridge C#/MAUI, os mecanismos de leitura/escrita e a compatibilidade com projetos já existentes.

## 4. Manifesto central do projeto

### 4.1 Princípios

O `ProjectManifest` deve:

1. Ser independente de React, Settings Editor e Game Editor.
2. Representar o estado persistente e exportável do projeto.
3. Ter versão própria de esquema, separada da versão da engine e da versão do pacote.
4. Preservar campos desconhecidos quando isso for seguro e compatível, evitando perda de dados em importações futuras.
5. Ser validado pelo Project Core antes de ser aplicado.
6. Ser a fonte comum consumida pelos dois editores, runtime, build e APIs autorizadas.

### 4.2 Estrutura conceitual

A estrutura abaixo é um ponto de partida para discussão, não um contrato TypeScript aprovado:

```ts
interface ProjectManifest {
  manifestVersion: number;

  identity: {
    id: string;
    name: string;
    description: string;
    iconAssetId?: string;
    createdAt: string;
    updatedAt: string;
  };

  structure: {
    dimension: '2D' | '3D';
    templateId: string;
    scriptingMode: 'csharp' | 'lumen';
  };

  settings: {
    general: GeneralSettings;
    display: DisplaySettings;
    rendering: RenderingSettings;
    physics: PhysicsSettings;
    input: InputSettings;
    audio: AudioSettings;
    camera: CameraSettings;
    advanced: AdvancedSettings;
  };

  content: {
    scenes: SceneReference[];
    scripts: ScriptReference[];
    assets: AssetReference[];
  };

  extensions: ExtensionDependency[];
  compatibility: CompatibilityMetadata;
}
```

Os tipos internos e campos exatos serão definidos em uma especificação de contrato antes da implementação. O manifesto também deverá estabelecer valores padrão, obrigatoriedade, validação, unidades, limites e regras condicionais por dimensão.

### 4.3 Identidade e referências

- IDs internos devem ser estáveis e não depender do nome ou do caminho exibido.
- Imagens, ícones e demais arquivos devem ser referenciados por IDs/caminhos gerenciados pelo projeto, nunca por URLs temporárias `blob:`.
- Datas devem usar formato consistente e documentado.
- Renomear o projeto não deve invalidar referências internas.

### 4.4 Categorias de configuração

Categorias inicialmente propostas:

| Categoria | Exemplos de conteúdo |
|---|---|
| Geral | nome, descrição, template, metadados |
| Tela e apresentação | resolução, proporção, janela, VSync |
| Programação | linguagem/modo, opções do ambiente de script |
| Renderização | backend, qualidade, sombras, iluminação, pós-processamento |
| Física | gravidade, escala/unidades, parâmetros físicos |
| Controles e entrada | mapeamentos, dispositivos e sensibilidade |
| Áudio | volume global, canais e configurações de áudio |
| Câmera | projeção, parâmetros e comportamento padrão |
| Avançado | depuração, diagnóstico, otimizações e opções especializadas |

A lista é uma organização inicial. Os campos definitivos precisam ser compatíveis com o que a engine realmente suporta. Não documentar opções como implementadas antes de existirem no runtime.

Alguns campos podem depender da dimensão. A interface deve mostrar apenas o que faz sentido para o projeto, sem remover dados válidos do manifesto ao alternar entre modos de visualização.

## 5. Dimensão imutável

A dimensão é uma característica estrutural definida na criação.

Regras obrigatórias:

- Um projeto criado como 2D permanece 2D.
- Um projeto criado como 3D permanece 3D.
- O Settings Editor não oferece controle para alterar a dimensão.
- O Game Editor, templates, importadores e APIs de extensões não podem alterar a dimensão de um projeto existente.
- A regra deve ser imposta no Project Core e na validação/persistência, não apenas pela interface.
- A importação restaura a dimensão registrada no manifesto original.
- Uma tentativa de alteração deve retornar erro explícito e não persistir parcialmente o restante da operação.

Caso o usuário precise de outra dimensão, o caminho futuro poderá ser criar outro projeto e migrar conteúdo por ferramenta específica. Isso não equivale a converter a dimensão do projeto original e não faz parte desta implementação inicial.

## 6. Templates e presets

Templates são pontos de partida que preenchem configurações iniciais. Não são tipos rígidos de projeto e não devem bloquear personalização posterior.

Modelos iniciais sugeridos:

- 2D Plataforma.
- 2D Top-down.
- 2D Estratégia.
- 3D Primeira pessoa.
- 3D Terceira pessoa.
- 3D Estratégia.
- Personalizado.

Cada template deve declarar a dimensão que utiliza. A escolha do template define a dimensão inicial; depois da criação, a dimensão fica fixa. As demais configurações podem ser modificadas conforme as capacidades da engine.

O template escolhido deve permanecer registrado como metadado de origem, mesmo que o usuário personalize os parâmetros depois.

## 7. Sincronização e ciclo de vida

### 7.1 Abertura

1. O Project Core localiza o projeto.
2. Carrega o manifesto e os dados persistentes necessários.
3. Valida estrutura, versão e compatibilidade.
4. Executa migrações necessárias sem descartar dados válidos.
5. Publica um contexto consistente para o Settings Editor e o Game Editor.
6. Inicializa os subsistemas com as configurações relevantes.

### 7.2 Alterações

1. A interface solicita a alteração ao Project Core.
2. O Core valida tipo, faixa, dependências e permissões.
3. O Core rejeita alterações na dimensão.
4. A alteração válida é persistida.
5. O Core publica atualização/evento para os consumidores interessados.
6. Os editores atualizam suas representações sem manter cópias divergentes da fonte de verdade.

Eventos conceituais sugeridos:

- `project.created`
- `project.opened`
- `project.settings.updated`
- `project.saved`
- `project.closed`

O contrato dos eventos, payloads, ordenação e garantias de persistência será detalhado na etapa de especificação.

### 7.3 Aplicação das configurações

Cada campo deve declarar sua política de aplicação:

- **Imediata:** atualiza sem reiniciar subsistemas.
- **Reinicialização de subsistema:** requer recriar uma parte da engine.
- **Reabertura do projeto:** só é aplicada ao fechar e abrir novamente.
- **Somente criação:** não pode ser alterada depois da criação; dimensão é o primeiro caso obrigatório.

A política precisa ser definida campo a campo, com base no comportamento real da engine.

## 8. Persistência e estrutura lógica

Estrutura lógica sugerida (não obriga a implementação física exata):

```text
MeuProjeto/
├── project.manifest
├── Scenes/
├── Scripts/
├── Assets/
│   ├── Textures/
│   ├── Models/
│   ├── Audio/
│   └── Fonts/
├── Extensions/
│   └── dependencies.manifest
└── Metadata/
```

O manifesto é a fonte oficial das configurações e referências. As pastas armazenam o conteúdo real. O Project Core deve mediar as operações de leitura e escrita.

Antes de migrar o armazenamento, definir:

- Como o C#/MAUI cria, abre, move e remove diretórios.
- Como o frontend recebe caminhos e bytes sem depender de URLs temporárias.
- Como são tratados caminhos relativos, permissões e falhas de I/O.
- Como o índice local é reconstruído a partir dos projetos em disco.
- Como projetos legados são encontrados e migrados.
- Como gravações são atômicas ou recuperáveis após interrupções.

## 9. Formato de exportação/importação .light

O formato `.light` pode continuar binário e comprimido. O requisito é que represente o projeto inteiro e tenha um contrato versionado.

### 9.1 Conteúdo mínimo esperado

- Manifesto completo.
- Identidade e metadados.
- Dimensão, template e modo de programação.
- Todas as configurações persistentes.
- Cenas e sua ordem/referências.
- Objetos, hierarquias e transformações.
- Scripts reais e seus caminhos.
- Assets reais (texturas, modelos, áudio, fontes etc.).
- Referências e dependências de extensões.
- Metadados de compatibilidade da engine e do formato.

Não exportar somente referências a arquivos locais que não acompanhem o pacote, salvo quando forem dependências externas explicitamente declaradas e verificadas.

### 9.2 Importação

O importador deve:

1. Validar cabeçalho, integridade e limites do pacote.
2. Validar a versão do formato e do manifesto.
3. Rejeitar arquivos malformados ou conteúdo incompatível.
4. Aplicar migrações versionadas quando disponíveis.
5. Restaurar a dimensão original e todas as configurações.
6. Restaurar cenas, scripts, hierarquias e assets.
7. Resolver dependências de extensões sem executar automaticamente código importado.
8. Solicitar autorização e informar dependências ausentes/incompatíveis.
9. Salvar o projeto restaurado por meio do Project Core.

A importação não pode substituir campos presentes no arquivo por defaults apenas porque o modelo atual do frontend ainda não os conhece.

### 9.3 Segurança e integridade

Definir limites de tamanho, validação de caminhos, prevenção de path traversal, tratamento de arquivos duplicados e validação de hashes. Nenhum script ou extensão importada deve ser executado automaticamente durante a importação.

## 10. Integração com extensões

Extensões devem consultar e solicitar alterações por APIs oficiais do Project Core, não por acesso irrestrito ao armazenamento interno.

Exemplo conceitual:

```ts
const project = await lumenion.projects.getCurrent();

const dimension = project.structure.dimension;
const display = project.settings.display;
```

Regras:

- Leitura, modificação comum e operações sensíveis devem respeitar permissões distintas.
- Alterações são validadas pelo Core.
- A dimensão é somente leitura após a criação.
- Operações sensíveis exigem confirmação explícita do usuário, com identificação da extensão e da ação solicitada conforme o modelo de permissões do Lumenion.
- Dependências de extensão no pacote registram identificador e versão/restrição compatível; não implicam instalar ou executar automaticamente a extensão.

A API pública final será detalhada em documento próprio, mantendo consistência com a arquitetura de extensões do Lumenion.

## 11. Compatibilidade e migrações

- `manifestVersion` controla a versão do esquema do manifesto.
- A versão do pacote `.light` é independente.
- A versão da engine também é independente.
- Migrações devem ser explícitas, sequenciais e testáveis.
- Projetos existentes precisam de migração não destrutiva.
- Se uma migração não puder preservar os dados, a operação deve parar e explicar o problema, em vez de descartar silenciosamente configurações.

A estratégia de compatibilidade para versões futuras e antigas será definida na especificação do manifesto e do pacote.

## 12. Decisões alinhadas e pontos pendentes

### Alinhado

- Os dois editores são distintos: editor de configurações e Game Editor.
- Ambos recebem o contexto completo do projeto.
- Criação e edição compartilham categorias de configuração.
- Haverá modo simplificado e avançado.
- Haverá templates predefinidos.
- A dimensão 2D/3D não pode ser alterada depois da criação.
- O projeto exportado deve incluir seu contexto e conteúdo, não apenas campos visuais.
- O manifesto deve ser central e independente das interfaces.

### Ainda precisa de especificação antes do código

- Contrato final e tipos de todos os campos do manifesto.
- Campos suportados pela engine em cada categoria e por dimensão.
- IDs, caminhos e política de armazenamento de assets.
- Política de aplicação/reinicialização por configuração.
- Formato binário versionado do pacote `.light`.
- Migração dos projetos atuais e tratamento de projetos importados antigos.
- API de leitura/alteração do Project Core e seus eventos.
- Integração da persistência com a bridge C#/MAUI.
- Estratégia de recuperação em falhas de gravação.

## 13. Critérios de aceite arquiteturais

- [ ] Criação e Settings Editor usam o mesmo contrato de configurações.
- [ ] Game Editor recebe o manifesto/contexto completo.
- [ ] Dimensão é imutável em UI, Core, persistência, importação e API de extensões.
- [ ] Simplificado e avançado são visualizações do mesmo modelo.
- [ ] Templates preenchem valores iniciais sem bloquear personalização.
- [ ] Persistência durável não depende de URLs temporárias nem somente de localStorage.
- [ ] Exportação inclui manifesto e arquivos reais necessários ao projeto.
- [ ] Importação restaura configurações e conteúdo sem sobrescrever dados válidos por defaults.
- [ ] Migrações e compatibilidade são versionadas e testadas.
- [ ] Extensões operam por APIs autorizadas e não alteram dimensão.

## 14. Sequência de implementação proposta

A sequência detalhada e o estado de cada etapa estão em [TODO — ciclo de vida e configurações de projetos](../roadmap/project-configuration-todo.md). A implementação deve começar somente após a revisão do contrato do manifesto e dos pontos pendentes críticos.


## 15. Registro da primeira implementação

A branch `feature/project-manifest-core` iniciou a implementação da fundação:

- Criado `frontend/src/services/project-manifest.ts` com o contrato inicial `ProjectManifest`, `manifestVersion: 1`, normalização e validação estrutural.
- Criado `frontend/src/services/project-core.ts` como fachada para leitura, salvamento, atualizações de configurações e publicação dos primeiros eventos.
- O `project-store.ts` passa a hidratar registros legados com um manifesto e a persistir o manifesto junto ao registro.
- O salvamento rejeita divergência de dimensão entre o projeto existente, a configuração e o manifesto informado.
- O formulário de edição desabilita os controles de dimensão.
- O Game Editor passa a carregar o projeto pela fachada Project Core e recebe o manifesto junto ao registro.

### Limites explícitos da versão inicial

- O schema v1 representa os campos que já existem no frontend. As categorias ainda não suportadas pela engine são objetos extensíveis vazios; isso não significa que suas funcionalidades já estejam implementadas.
- O armazenamento continua em `localStorage`. A migração para manifesto físico na pasta do projeto depende da auditoria e integração da bridge C#/MAUI.
- O pacote `.light` ainda não serializa o manifesto v1 nem todos os assets/conteúdos reais.
- Os eventos estão disponíveis na camada central, mas a atualização reativa simultânea dos editores ainda precisa ser conectada.
- Build, typecheck e testes automatizados devem ser executados antes de considerar esta etapa concluída.

O estado detalhado e atualizado está no [TODO do ciclo de vida e configurações](../roadmap/project-configuration-todo.md).
