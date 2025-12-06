# 07: Animações e Microinterações

**Versão:** 2.0
**Data:** 06 de Dezembro de 2025

---

## 1. Visão Geral

No Design System "Aura", o movimento é uma ferramenta de comunicação. As animações e microinterações não são meramente decorativas; elas servem para guiar o usuário, fornecer feedback, e criar uma experiência de uso mais fluida e intuitiva. Nossa filosofia de animação é baseada na **sutileza e no propósito**. O movimento deve ser tão discreto e profissional quanto o resto do design, reforçando a sensação de uma aplicação responsiva e de alta qualidade.

## 2. Princípios de Animação

| Princípio | Descrição Detalhada |
| :--- | :--- |
| **Proposital** | Cada animação deve ter uma razão de ser. Ela deve responder a uma pergunta do usuário, como "Onde devo olhar?", "Minha ação foi registrada?" ou "De onde veio este novo elemento?". Evitamos movimentos sem propósito. |
| **Sutil e Rápida** | As animações devem ser rápidas e eficientes para não atrapalhar o fluxo do usuário. A duração ideal para a maioria das transições de UI é entre **150ms e 300ms**. Movimentos lentos fazem a aplicação parecer lenta. |
| **Consistente** | A mesma interação deve sempre produzir a mesma resposta visual. Botões devem ter o mesmo feedback de hover, modais devem sempre aparecer da mesma forma. Isso cria um padrão de reconhecimento e previsibilidade. |
| **Performática** | As animações devem ser fluidas e não devem degradar a performance da aplicação. Priorizamos o uso de propriedades CSS que são baratas de animar, como `transform` (scale, translate) e `opacity`. Evitamos animar propriedades que causam reflow, como `width`, `height` ou `margin`. |

## 3. Curvas de Animação (Easing)

A curva de animação (ou *easing function*) define a aceleração e desaceleração de uma transição, dando-lhe uma sensação mais natural.

-   **Padrão:** `ease-in-out`
    -   **Uso:** A curva padrão para a maioria das transições de estado, como mudanças de cor em hover. Proporciona um início e um fim suaves.
    -   **Tailwind Class:** `ease-in-out`

-   **Ease Out:**
    -   **Uso:** Para elementos que estão entrando na tela (ex: um modal ou um dropdown aparecendo). Eles começam rápidos e desaceleram até parar, dando uma sensação de chegada.
    -   **Tailwind Class:** `ease-out`

-   **Ease In:**
    -   **Uso:** Para elementos que estão saindo da tela. Eles começam lentos e aceleram, dando uma sensação de partida.
    -   **Tailwind Class:** `ease-in`

## 4. Padrões de Microinteração

### 4.1. Estados de Hover
-   **Propósito:** Fornecer feedback imediato de que um elemento é interativo.
-   **Implementação:** Transição suave de cor de fundo, cor de texto ou borda.
-   **Duração:** `150ms`
-   **Exemplo:** Um botão que muda sutilmente de cor ou um item de menu que ganha um fundo suave ao passar o mouse.

### 4.2. Estados de Foco (Focus)
-   **Propósito:** Indicar claramente qual elemento está ativo para usuários que navegam via teclado, um requisito crucial de acessibilidade.
-   **Implementação:** Adicionar um contorno visível (`outline`) ou uma sombra de anel (`ring`) ao redor do elemento focado. A cor deve ser o **Azul Elétrico (`#0052FF`)**.
-   **Exemplo:** Um input de formulário ou um botão que ganha um anel azul ao ser selecionado com a tecla "Tab".

### 4.3. Transições de Estado
-   **Propósito:** Suavizar a aparição ou desaparecimento de elementos na UI.
-   **Implementação:** Usar transições de `opacity` (fade in/out) para mostrar e esconder elementos. Para componentes como acordeões, animar a propriedade `height` (com cuidado para a performance).
-   **Duração:** `200ms - 300ms`
-   **Exemplo:** Um menu dropdown que aparece com um leve fade e um slide para baixo.

### 4.4. Estados de Carregamento (Loading)
-   **Propósito:** Informar ao usuário que o sistema está processando uma requisição.
-   **Implementação:** Usar animações sutis e em loop. Evitar spinners grandes e chamativos.
-   **Exemplo:** Um ícone de spinner pequeno e elegante (usando as cores da marca) ou uma animação de pulso sutil no fundo de um card que está carregando dados.

## 5. Implementação e Ferramentas

-   **Tailwind CSS:** A maioria das nossas microinterações pode e deve ser implementada usando as classes utilitárias de transição e animação do Tailwind.

    ```jsx
    // Exemplo de um botão com transição de cor em hover
    <button className="bg-neutral-900 text-neutral-100 hover:bg-neutral-700 transition-colors duration-150 ease-in-out">
      Exportar Relatório
    </button>
    ```

-   **Framer Motion (Recomendado para Animações Complexas):**
    -   **Uso:** Para animações de layout (ex: reordenar uma lista), transições de página ou animações orquestradas (quando vários elementos animam em sequência).
    -   **Justificativa:** Framer Motion oferece uma API declarativa e poderosa que se integra perfeitamente com React, simplificando a criação de animações complexas e performáticas.

    ```jsx
    // Exemplo conceitual de um item de lista aparecendo
    import { motion } from "framer-motion";

    <motion.li
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      Novo item da lista
    </motion.li>
    ```

---

O uso criterioso do movimento elevará a percepção de qualidade do nosso produto, tornando-o não apenas funcional, mas também agradável de usar.
