# 11: Especificações de Componentes - Organismos

**Versão:** 2.0
**Data:** 06 de Dezembro de 2025

---

## 1. Visão Geral

Os organismos são as seções mais complexas e distintas da nossa interface. Eles são compostos por grupos de moléculas e átomos e formam componentes independentes e reutilizáveis, como uma tabela de dados completa ou o cabeçalho principal da aplicação. A boa definição desses organismos é o que dará à nossa aplicação sua estrutura e funcionalidade robusta.

---

## 2. Tabela de Dados (`DataTable`)

**Propósito:** Exibir conjuntos de dados complexos de forma organizada, permitindo ordenação, filtragem e paginação.

### Estrutura e Composição

-   **Container (`Card`):** A tabela inteira é envolvida por um card para manter a consistência visual.
-   **Cabeçalho da Tabela:** Contém o título e as ações (ex: filtros, botão de "Adicionar Novo").
-   **Tabela (`Table` de shadcn/ui):** O componente principal para exibir os dados.
    -   `TableHeader`: Cabeçalho das colunas.
    -   `TableBody`: Corpo da tabela com as linhas de dados.
-   **Rodapé da Tabela:** Contém os controles de paginação.

### Especificação de Estilo

-   **Container (`Card`):**
    -   `bg-neutral-100 border border-neutral-300 rounded-lg`.
    -   **Importante:** Usar `p-0` (sem padding) para que a tabela possa ocupar toda a largura do card.

-   **Cabeçalho da Tabela (dentro do Card):**
    -   Layout: `flex justify-between items-center p-6`.
    -   Título: `text-lg font-semibold text-neutral-900`.
    -   Ações: Agrupar filtros e botões à direita.

-   **Componente `Table`:**
    -   **Cabeçalho das Colunas (`TableHeader`):**
        -   Fundo: `bg-neutral-200`.
        -   Texto: `text-sm font-medium text-neutral-700`.
        -   Bordas: Sem bordas verticais, apenas uma borda inferior `border-b border-neutral-300`.
    -   **Linhas do Corpo (`TableRow`):**
        -   Borda: `border-b border-neutral-300`.
        -   Estado Hover: `bg-neutral-200/50`.
    -   **Células (`TableCell`):**
        -   Padding: `px-6 py-4`.
        -   Texto: `text-sm text-neutral-900`.

-   **Rodapé da Tabela (Paginação):**
    -   Layout: `flex justify-between items-center p-4`.
    -   Texto de contagem: `text-sm text-neutral-700` (ex: "Página 1 de 10").
    -   Botões de Paginação: Usar a variante `ghost` do componente `Button` com ícones (`ChevronLeft`, `ChevronRight`).

---

## 3. Cabeçalho da Aplicação (`Header`)

**Propósito:** Fornecer navegação persistente, acesso a ações globais e ao perfil do usuário.

### Estrutura e Composição

-   **Container `header`:** Barra fixa no topo da área de conteúdo.
-   **Título da Página:** Exibe o nome da tela atual.
-   **Ações Globais:** Botões como "Exportar Relatório".
-   **Menu do Usuário:** Avatar e menu dropdown com opções de perfil e logout.

### Especificação de Estilo

-   **Container:**
    -   Layout: `flex justify-between items-center h-20 px-8` (Altura de 80px).
    -   Fundo: `bg-neutral-100`.
    -   Borda: `border-b border-neutral-300`.

-   **Título da Página:**
    -   Estilo: `text-2xl font-bold text-neutral-900`.

-   **Ações Globais:**
    -   Layout: `flex items-center gap-4`.
    -   Botões: Usar a variante `primary` do `Button` para a ação mais importante.

-   **Menu do Usuário:**
    -   Layout: `flex items-center gap-3`.
    -   **Avatar:** Tamanho `md` (`h-10 w-10`).
    -   **Informações do Usuário (Layout):** `flex flex-col items-end`.
    -   **Nome do Usuário:** `text-sm font-semibold text-neutral-900`.
    -   **Cargo/Email:** `text-xs text-neutral-700`.
    -   **Dropdown (`DropdownMenu` de shadcn/ui):** Acionado ao clicar na área do usuário. Os itens de menu devem seguir o estilo padrão do componente.

---

## 4. Menu Lateral (`Sidebar`)

**Propósito:** Navegação principal da aplicação.

### Estrutura e Composição

-   **Container `aside`:** Barra lateral fixa à esquerda.
-   **Logo:** Logo da Carla no topo.
-   **Navegação Principal:** Lista de links para as telas principais.
-   **Navegação Secundária:** Links para configurações, notificações, etc., na parte inferior.

### Especificação de Estilo

-   **Container:**
    -   Layout: `flex flex-col h-screen p-6`.
    -   Largura: `w-64` (256px).
    -   Fundo: `bg-neutral-100`.
    -   Borda: `border-r border-neutral-300`.

-   **Logo:**
    -   Layout: `h-20 flex items-center` (para alinhar com a altura do Header).
    -   Estilo: O SVG do logo da Carla.

-   **Navegação Principal:**
    -   Layout: `flex flex-col gap-2 mt-8`.
    -   **Item de Navegação (`NavItem` - Molécula):**
        -   Layout: `flex items-center gap-3 px-3 py-2 rounded-md`.
        -   Texto: `text-base font-medium text-neutral-700`.
        -   Ícone: `h-5 w-5 text-neutral-700`.
        -   **Estado Hover:** `bg-neutral-200 text-neutral-900` (ícone e texto mudam de cor).
        -   **Estado Ativo:** `bg-primary/10 text-primary font-semibold` (ícone e texto mudam para a cor primária).

-   **Navegação Secundária:**
    -   Layout: `flex flex-col gap-2 mt-auto` (para alinhar na parte inferior).
    -   Estilo dos itens segue o mesmo padrão da navegação principal.

---

Estes organismos fornecem a estrutura macro da nossa aplicação. A implementação cuidadosa deles garantirá uma experiência de usuário consistente e profissional.
