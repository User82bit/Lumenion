# TODO — ciclo de vida e configurações de projetos

**Branch de documentação:** `docs/project-configuration-architecture`  
**PR de destino:** `homologa`  
**Estado geral:** Não iniciada (implementação)  
**Documento relacionado:** [Arquitetura de criação, configuração e ciclo de vida de projetos](../architecture/project-configuration-architecture.md)

## Legenda de status

- **Não iniciada:** trabalho ainda não começou.
- **Em desenvolvimento:** trabalho em andamento.
- **Concluída:** implementação e testes da etapa foram finalizados.
- **Revisão:** aguardando revisão técnica/homologação ou correções após revisão.

> Atualizar este arquivo durante todo o processo. Cada etapa deve registrar decisões, alterações, testes, evidências, pendências e PRs. Não marcar como concluída apenas porque a documentação foi escrita.

## 1. Documentação e decisões arquiteturais

| Etapa | Status | Entregável / critério |
|---|---|---|
| Registrar problemas do fluxo atual | Concluída | Diagnóstico inicial documentado com base nos arquivos inspecionados |
| Definir responsabilidades do Project Creator, Project Core e dois editores | Concluída | Arquitetura documentada |
| Registrar regra de dimensão imutável | Concluída | Regra arquitetural documentada |
| Definir categorias e níveis simplificado/avançado | Concluída | Organização inicial documentada |
| Definir templates iniciais | Concluída | Presets propostos documentados |
| Definir contrato definitivo do ProjectManifest | Não iniciada | Campos, tipos, validações, defaults, unidades e versionamento aprovados |
| Definir contrato de eventos e sincronização | Não iniciada | Eventos, payloads, ordenação e consistência especificados |
| Definir política de aplicação das configurações | Não iniciada | Política por campo: imediata, reinício de subsistema, reabertura ou somente criação |
| Definir contrato versionado do pacote .light | Não iniciada | Cabeçalho, manifesto, conteúdo, integridade e compatibilidade especificados |
| Revisar arquitetura com o usuário | Revisão | Decisões pendentes resolvidas antes do início do código |

## 2. Fundação: manifesto e Project Core

| Etapa | Status | Critério de conclusão |
|---|---|---|
| Criar tipos e schema versionado do manifesto | Não iniciada | Tipos e validação centralizados, sem dependência da UI |
| Criar serviço Project Core | Não iniciada | API única para carregar, consultar, validar e atualizar projetos |
| Implementar validação de dimensão imutável | Não iniciada | Tentativas de alteração são rejeitadas no Core |
| Implementar validação de configurações | Não iniciada | Tipos, limites, dependências e campos por dimensão validados |
| Implementar eventos do ciclo de vida | Não iniciada | Eventos documentados e testados |
| Implementar política de atualização concorrente | Não iniciada | Evita estado divergente ou sobrescrita silenciosa |
| Criar testes unitários do manifesto/Core | Não iniciada | Cobertura de validação, imutabilidade e migrações |

## 3. Persistência e migração

| Etapa | Status | Critério de conclusão |
|---|---|---|
| Auditar bridge C#/MAUI e operações de diretório/arquivo | Não iniciada | Fluxos atuais e limitações registrados |
| Definir estrutura física oficial do projeto | Não iniciada | Layout e política de caminhos aprovados |
| Persistir manifesto no diretório do projeto | Não iniciada | Leitura/gravação durável e validada |
| Persistir assets com IDs e caminhos estáveis | Não iniciada | Sem dependência de URL blob temporária |
| Manter índice/cache local reconstruível | Não iniciada | localStorage não é fonte de verdade |
| Migrar projetos legados | Não iniciada | Projetos existentes abrem sem perda de dados |
| Implementar gravação segura/recuperação de falhas | Não iniciada | Falhas não deixam manifesto parcialmente gravado |
| Testar persistência e migração | Não iniciada | Testes automatizados e cenários reais aprovados |

## 4. Criação e editor de configurações

| Etapa | Status | Critério de conclusão |
|---|---|---|
| Expandir criação com categorias completas aprovadas | Não iniciada | Campos definidos no contrato podem ser configurados |
| Implementar modo simplificado | Não iniciada | Exibe opções essenciais sem duplicar modelo |
| Implementar modo avançado | Não iniciada | Expõe parâmetros avançados suportados |
| Implementar seleção de templates | Não iniciada | Template preenche presets coerentes com dimensão |
| Tornar dimensão fixa após criação | Não iniciada | Campo exibido como somente leitura em edição |
| Fazer Settings Editor consumir Project Core | Não iniciada | Não mantém cópia independente da configuração |
| Implementar validação e feedback de campos | Não iniciada | Erros e limites comunicados na interface |
| Testar criação, edição e reabertura | Não iniciada | Dados persistem e reabrem corretamente |

## 5. Integração do Game Editor

| Etapa | Status | Critério de conclusão |
|---|---|---|
| Definir contrato de contexto consumido pelo Game Editor | Não iniciada | Contexto completo tipado e documentado |
| Carregar contexto via Project Core | Não iniciada | Editor não depende de objeto parcial do localStorage |
| Disponibilizar dimensão/template/linguagem aos subsistemas | Não iniciada | Subsistemas consultam fonte central |
| Sincronizar alterações relevantes | Não iniciada | Atualizações chegam aos consumidores corretos |
| Aplicar política de reinicialização | Não iniciada | Configurações são aplicadas conforme contrato |
| Testar abertura com projetos 2D e 3D | Não iniciada | Fluxos coerentes sem possibilidade de conversão acidental |

## 6. Pacote .light: exportação e importação

| Etapa | Status | Critério de conclusão |
|---|---|---|
| Especificar versão do pacote e manifesto embarcado | Não iniciada | Contratos independentes e compatíveis |
| Exportar manifesto completo | Não iniciada | Nenhuma configuração persistente é omitida |
| Exportar cenas, hierarquias e transformações | Não iniciada | Estrutura do projeto preservada |
| Exportar scripts reais | Não iniciada | Sem scripts placeholder |
| Empacotar assets reais | Não iniciada | Recursos necessários acompanham o projeto |
| Exportar referências de extensões | Não iniciada | IDs e versões/dependências declarados |
| Validar integridade e caminhos | Não iniciada | Pacotes inválidos/inseguros são rejeitados |
| Implementar importação e migrações | Não iniciada | Projeto é restaurado integralmente |
| Tratar extensões ausentes/incompatíveis | Não iniciada | Usuário informado; nada executado automaticamente |
| Testar round-trip exportar/importar | Não iniciada | Projeto reimportado equivale ao original |

## 7. API de extensões e permissões

| Etapa | Status | Critério de conclusão |
|---|---|---|
| Definir API oficial de leitura do projeto | Não iniciada | Extensões consultam manifesto via Core |
| Definir API de alteração de configurações | Não iniciada | Operações validadas e autorizadas |
| Proteger dimensão na API | Não iniciada | Nenhuma extensão consegue alterá-la |
| Integrar níveis de permissão e confirmação | Não iniciada | Ações sensíveis identificam extensão e comando |
| Testar permissões e tentativas inválidas | Não iniciada | Acesso não autorizado é bloqueado e auditável |

## 8. Revisão, qualidade e homologação

| Etapa | Status | Critério |
|---|---|---|
| Executar lint, typecheck e testes | Não iniciada | Todos passam |
| Executar build da aplicação | Não iniciada | Build passa no ambiente suportado |
| Validar projetos legados | Não iniciada | Sem regressões |
| Validar criação/edição 2D e 3D | Não iniciada | Dimensão preservada |
| Validar Game Editor com contexto completo | Não iniciada | Todos os subsistemas necessários recebem os dados |
| Validar exportação/importação completa | Não iniciada | Round-trip sem perda |
| Atualizar documentação e evidências | Não iniciada | TODO, arquitetura e notas de release atualizados |
| Abrir PR para homologa | Não iniciada | PR com resumo, testes, riscos e screenshots quando aplicável |
| Revisar CI e feedback do PR | Não iniciada | Pendências corrigidas |
| Homologar e concluir | Não iniciada | Aprovação explícita; merge somente após revisão |

## 9. Estratégia de branches e PRs

Cada conjunto de implementação deve ocorrer em branch própria, criada a partir de `homologa` atualizada. A sequência sugerida:

1. `feature/project-manifest` — contrato, schema, validação e migrações.
2. `feature/project-core` — serviço central, persistência e eventos.
3. `feature/project-creation` — criação, categorias, níveis e templates.
4. `feature/project-settings-editor` — editor de configurações e dimensão somente leitura.
5. `feature/game-editor-project-context` — integração do Game Editor.
6. `feature/light-project-package` — exportação/importação completa.
7. `feature/project-extension-access` — API e permissões para extensões.

As branches são propostas e podem ser agrupadas quando houver dependência técnica clara, mas cada conjunto de alterações deve permanecer isolado e rastreável. Abrir PRs para `homologa`; não fazer commits diretamente em `homologa` nem em `main`.

## 10. Registro de execução

| Data | Branch/PR | Alterações | Testes/evidências | Status |
|---|---|---|---|---|
| 2026-11-27 | `docs/project-configuration-architecture` | Criação da documentação arquitetural e do TODO | Revisão documental; nenhuma implementação funcional executada | Em desenvolvimento |

Atualizar este registro em cada etapa. Quando a documentação desta branch for revisada e o PR aberto, alterar o status correspondente para **Revisão**.
