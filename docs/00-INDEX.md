# Documentação Oficial - Carla Channels Dashboard

**Versão:** 2.0
**Data:** 06 de Dezembro de 2025
**Autor:** Manus AI (CTO)

---

## Bem-vindo

Esta documentação serve como a fonte única da verdade (`Single Source of Truth`) para o design, arquitetura e desenvolvimento do front-end do **Carla Channels Dashboard**. O objetivo é fornecer diretrizes claras e detalhadas para garantir que o produto final seja uma representação fiel da estética e dos padrões de qualidade da marca **Carla** ([carla.money](https://carla.money/)).

Este conjunto de documentos foi projetado para ser consumido por ferramentas de IA generativa, como o **Cursor**, para acelerar o desenvolvimento, bem como para guiar desenvolvedores, designers e stakeholders do projeto.

## Estrutura da Documentação

A documentação está organizada em seções lógicas para facilitar a consulta.

### Parte 1: Fundamentos de Design e Marca

*   **[01-BRAND-IDENTITY.md](./01-BRAND-IDENTITY.md):** A essência da marca Carla. Missão, valores e personalidade que informam o design.
*   **[02-DESIGN-SYSTEM.md](./02-DESIGN-SYSTEM.md):** A filosofia e os princípios do nosso design system, "Aura".
*   **[03-COLOR-PALETTE.md](./03-COLOR-PALETTE.md):** A paleta de cores oficial, com valores HEX, RGB e casos de uso.
*   **[04-TYPOGRAPHY.md](./04-TYPOGRAPHY.md):** A família tipográfica, escala de tamanhos, pesos e regras de aplicação.
*   **[05-LAYOUT-PATTERNS.md](./05-LAYOUT-PATTERNS.md):** Regras de espaçamento, grid system e padrões de layout responsivo.
*   **[06-ICONOGRAPHY.md](./06-ICONOGRAPHY.md):** O estilo e a biblioteca de ícones a serem utilizados.
*   **[07-ANIMATIONS.md](./07-ANIMATIONS.md):** Princípios de animação e microinterações para uma experiência fluida.

### Parte 2: Biblioteca de Componentes

*   **[08-COMPONENT-LIBRARY-OVERVIEW.md](./08-COMPONENT-LIBRARY-OVERVIEW.md):** Visão geral da nossa abordagem de biblioteca de componentes usando `shadcn/ui`.
*   **[09-COMPONENT-SPECS-ATOMS.md](./09-COMPONENT-SPECS-ATOMS.md):** Especificações para componentes atômicos (Botões, Inputs, Badges, Avatares).
*   **[10-COMPONENT-SPECS-MOLECULES.md](./10-COMPONENT-SPECS-MOLECULES.md):** Especificações para componentes moleculares (Cards de KPI, Campos de Formulário, Itens de Lista).
*   **[11-COMPONENT-SPECS-ORGANISMS.md](./11-COMPONENT-SPECS-ORGANISMS.md):** Especificações para componentes complexos (Tabelas de Dados, Gráficos, Painéis de Perfil).

### Parte 3: Especificação das Telas

*   **[12-SCREENS-OVERVIEW.md](./12-SCREENS-OVERVIEW.md):** Visão geral da arquitetura de navegação e das principais telas da aplicação.
*   **[13-SCREEN-DASHBOARD-MAIN.md](./13-SCREEN-DASHBOARD-MAIN.md):** Especificação detalhada da tela do Dashboard Principal (BI).
*   **[14-SCREEN-CONVERSATIONS-CRM.md](./14-SCREEN-CONVERSATIONS-CRM.md):** Especificação detalhada da tela de Conversações (CRM).
*   **[15-SCREEN-TRANSACTIONS.md](./15-SCREEN-TRANSACTIONS.md):** Especificação detalhada da tela de Transações.
*   **[16-SCREEN-PROCESSES.md](./16-SCREEN-PROCESSES.md):** Especificação detalhada da tela de Gestão de Processos.

### Parte 4: Diretrizes Técnicas

*   **[17-TECH-STACK.md](./17-TECH-STACK.md):** Detalhes sobre o stack de tecnologia de front-end (React, Vite, TypeScript, etc.).
*   **[18-STATE-MANAGEMENT.md](./18-STATE-MANAGEMENT.md):** Estratégia para gerenciamento de estado local e global (Zustand, React Query).
*   **[19-DATA-VISUALIZATION.md](./19-DATA-VISUALIZATION.md):** Diretrizes para a implementação de gráficos e visualizações de dados com Recharts.
*   **[20-INTEGRATION-GUIDE.md](./20-INTEGRATION-GUIDE.md):** Guia para integração com as APIs do backend (FastAPI) e serviços externos (WhatsApp).
*   **[21-ACCESSIBILITY.md](./21-ACCESSIBILITY.md):** Requisitos e melhores práticas de acessibilidade (a11y) a serem seguidos.
*   **[22-PERFORMANCE.md](./22-PERFORMANCE.md):** Metas e estratégias de performance (Code Splitting, Lazy Loading, Virtualização).

---

Use este índice como ponto de partida para navegar pela documentação. Cada arquivo foi escrito para ser autocontido e fornecer o máximo de detalhes possível.
