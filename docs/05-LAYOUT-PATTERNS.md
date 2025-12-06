# 05: Padrões de Layout e Espaçamento

**Versão:** 2.0
**Data:** 06 de Dezembro de 2025

---

## 1. Visão Geral

O layout e o espaçamento são a espinha dorsal invisível do nosso design. Eles trazem ordem, ritmo e clareza à interface, guiando o olhar do usuário e criando uma sensação de calma e organização. No Design System "Aura", usamos um sistema de espaçamento consistente e um grid flexível para garantir que todos os componentes e seções da interface estejam visualmente harmonizados.

## 2. Sistema de Espaçamento (Spacing System)

Nosso sistema de espaçamento é baseado em uma **unidade base de 4px**. Todos os valores de `padding`, `margin` e `gap` devem ser múltiplos desta unidade base. Esta abordagem garante um ritmo vertical e horizontal consistente em toda a aplicação.

| Múltiplo | Pixels | REM | Tailwind Class | Uso Principal |
| :--- | :--- | :--- | :--- | :--- |
| 1x | 4px | 0.25rem | `p-1`, `m-1`, `gap-1` | Espaçamento mínimo entre elementos muito pequenos. |
| 2x | 8px | 0.5rem | `p-2`, `m-2`, `gap-2` | Espaçamento entre ícones e texto, ou itens de menu. |
| 3x | 12px | 0.75rem | `p-3`, `m-3`, `gap-3` | Espaçamento interno em badges ou tags. |
| 4x | 16px | 1rem | `p-4`, `m-4`, `gap-4` | Espaçamento padrão entre elementos de texto e componentes. Padding interno de inputs. |
| 6x | 24px | 1.5rem | `p-6`, `m-6`, `gap-6` | Padding interno de cards e modais. Espaçamento entre seções. |
| 8x | 32px | 2rem | `p-8`, `m-8`, `gap-8` | Padding maior para seções de página. Espaçamento entre cards em um grid. |
| 12x | 48px | 3rem | `p-12`, `m-12`, `gap-12` | Espaçamento vertical entre grandes seções da página. |
| 16x | 64px | 4rem | `p-16`, `m-16`, `gap-16` | Espaçamento vertical principal, como a margem superior do conteúdo da página. |

**Regra de Ouro:** Nunca use valores de espaçamento arbitrários (ex: `13px`, `21px`). Sempre adira à escala de 4px.

## 3. Grid System

Nosso layout é construído sobre um **grid de 12 colunas**. Este sistema é extremamente flexível e se adapta a uma variedade de layouts de tela, desde as mais simples até as mais complexas com múltiplos painéis.

-   **Implementação:** Usaremos o **Flexbox** e o **CSS Grid** nativos, controlados via classes do Tailwind CSS.
-   **Gutter (Calha):** O espaçamento padrão entre as colunas do grid (`gap`) será de **24px (1.5rem)**.

**Exemplo de Layout de Página:**
Um layout de dashboard comum pode ser dividido da seguinte forma:

-   **Sidebar (Menu Lateral):** Ocupa 2 de 12 colunas.
-   **Área de Conteúdo Principal:** Ocupa os 10 de 12 colunas restantes.

Dentro da área de conteúdo, os cards e gráficos podem ser dispostos no grid:

-   Uma linha de 4 cards de KPI: Cada card ocupa 3 de 12 colunas.
-   Um gráfico principal: Ocupa 8 de 12 colunas.
-   Um painel lateral de informações: Ocupa 4 de 12 colunas.

## 4. Padrões de Layout Responsivo

O dashboard deve ser totalmente responsivo para garantir uma experiência de uso ótima em diferentes tamanhos de tela, desde monitores grandes até tablets.

-   **Breakpoints Padrão (Tailwind):**
    -   `sm`: 640px
    -   `md`: 768px (Ponto de quebra principal para tablets)
    -   `lg`: 1024px (Ponto de quebra para desktops menores)
    -   `xl`: 1280px
    -   `2xl`: 1536px

-   **Estratégia Mobile-First:** O design deve ser pensado primeiro para telas menores (embora o foco principal seja desktop) e depois adaptado para telas maiores. No nosso caso, o layout base será para `lg` (1024px) e ajustado para cima e para baixo.

-   **Comportamento em Telas Menores (Tablets - `md`):**
    -   O menu lateral (sidebar) pode ser colapsado por padrão, mostrando apenas ícones, e expandindo com um clique.
    -   Grids de 3 ou 4 colunas devem quebrar para 2 colunas.
    -   Tabelas complexas podem ocultar colunas menos importantes ou adotar um layout de cards.

## 5. Content Max-Width

Para garantir a legibilidade e evitar que as linhas de texto fiquem excessivamente longas em monitores muito largos, a área de conteúdo principal deve ter uma largura máxima (`max-width`).

-   **Largura Máxima Recomendada:** `1440px`.
-   **Implementação:** O container principal do conteúdo terá a classe `max-w-screen-xl mx-auto` (ou similar) para centralizá-lo na tela.

---

O uso disciplinado destes padrões de layout e espaçamento é o que transformará uma coleção de componentes em uma interface coesa, profissional e agradável de usar.
