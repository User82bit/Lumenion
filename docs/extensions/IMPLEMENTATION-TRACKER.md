# Acompanhamento — Sistema de Extensões

**Status geral:** Em desenvolvimento  
**Branch de documentação:** `docs/extensions-node-runtime`  
**Branch de homologação:** `homologa`

Este arquivo acompanha o processo completo. Atualizar os estados durante cada etapa; não marcar uma etapa como concluída sem evidência.

## Legenda de status

- **Não iniciado:** ainda não começou.
- **Em desenvolvimento:** trabalho em andamento.
- **Concluído:** trabalho executado e evidências registradas.
- **Revisão:** aguardando validação técnica ou aprovação do usuário.

## Etapas

| Etapa | Status | Evidência / critério de saída |
|---|---|---|
| Levantamento da arquitetura atual do repositório | Concluído | Estrutura MAUI/Blazor, React/TypeScript e serviços C# examinados na análise inicial. |
| Definição da linguagem das extensões | Concluído | TypeScript compilado para JavaScript. |
| Definição dos modelos de interface | Concluído | Componentes nativos e interfaces independentes em WebView. |
| Definição da plataforma inicial | Concluído | Windows. |
| Definição da arquitetura interna | Concluído | Modelo híbrido C# Host + Rust Core, com adoção incremental de Rust. |
| Definição do Marketplace | Concluído | Desenvolver a aba existente; catálogo aberto a publicadores externos com verificação. |
| Definição de permissões e consentimento | Concluído | Autorizações uma vez, nesta sessão ou persistentes e revogáveis; operações sensíveis mediadas. |
| Definição de eventos entre extensões | Concluído | Broker central com verificação de identidade, permissões e schemas. |
| Definição de dependências e exports | Concluído | Dependências obrigatórias/opcionais e exports privados/internos/públicos via proxy controlado. |
| Definição do runtime e isolamento | Concluído | Node.js + V8; processo separado por extensão, supervisionado pelo Host C#. |
| Definição dos limites de recursos | Concluído | Limites globais e individuais configuráveis. |
| Definição de compatibilidade | Concluído | Resolver adaptativo com aliases oficiais e desativação localizada de operações incompatíveis. |
| Definição da entrega gradual da API | Concluído | Três fases de módulos registradas na especificação. |
| Especificação dos itens técnicos pendentes | Em desenvolvimento | Definir IPC, manifesto, assinatura, quotas, sandbox Windows e schemas. |
| Revisão integral da arquitetura pelo usuário | Não iniciado | Aprovação explícita da especificação consolidada. |
| Revisão técnica de segurança | Não iniciado | Threat model, fronteiras de confiança e testes de isolamento. |
| Implementação do SDK e contratos da Fase 1 | Não iniciado | Contratos TypeScript, schemas e testes. |
| Implementação do Extension Manager e runtime | Não iniciado | Instalação, ciclo de vida, isolamento e controle de recursos. |
| Implementação da Extension API Bridge e Event Broker | Não iniciado | IPC validado, permissões e comunicação entre extensões. |
| Integração com Marketplace existente | Não iniciado | Pesquisa, detalhes, instalação, atualização e publicação. |
| Implementação das Fases 2 e 3 | Não iniciado | Módulos adicionais conforme a ordem aprovada. |
| Testes, documentação de desenvolvedor e exemplo de extensão | Não iniciado | Testes automatizados, guias e extensão de referência. |
| Revisão final, CI e validação | Não iniciado | CI aprovado, revisão de segurança e checklist concluído. |
| PR para `homologa` | Não iniciado | PR aberto com resumo, testes, riscos e documentação. |

## Registro de trabalho

### 2026-11-27 — Registro inicial das decisões arquiteturais

**Status:** Em desenvolvimento

- Consolidada a arquitetura híbrida C# + Rust.
- Registrado TypeScript como linguagem das extensões.
- Registrados os modelos de UI nativa e independente.
- Registrado suporte inicial exclusivo ao Windows.
- Registrados Marketplace aberto com verificação, permissões supervisionadas, eventos entre extensões, dependências e exports TypeScript.
- Registrados limites de recursos configuráveis e compatibilidade adaptativa.
- Runtime aprovado: Node.js + V8, com processo próprio por extensão e Runtime Supervisor coordenado pelo Host C#.
- A decisão substitui a proposta anterior de processo compartilhado para extensões comuns e isolamento apenas para extensões sensíveis.
- WebView2 permanece separada do runtime lógico; sandbox adicional do Windows e protocolo IPC seguem pendentes de especificação.
- Registrada a entrega gradual da Extension API em três fases.
- Nenhuma alteração em código de produto foi realizada nesta etapa.

## Histórico de revisão

| Data | Revisor | Resultado | Observações |
|---|---|---|---|
| Pendente | Usuário | Não iniciado | Aguardar revisão da especificação consolidada. |
| Pendente | Revisão técnica | Não iniciado | Avaliar segurança, viabilidade e compatibilidade com a arquitetura atual. |

## Regras de execução

1. Toda implementação deverá ocorrer em branch própria baseada na branch de trabalho apropriada.
2. Não implementar funcionalidades enquanto a arquitetura e os contratos relevantes não estiverem aprovados.
3. Atualizar este tracker durante o desenvolvimento, incluindo evidências e decisões.
4. Executar testes e CI antes da revisão final.
5. Abrir PR direcionado a `homologa`; não integrar diretamente nessa branch.
