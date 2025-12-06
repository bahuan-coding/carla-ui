# 03: Paleta de Cores

**Versão:** 2.0
**Data:** 06 de Dezembro de 2025

---

## 1. Visão Geral

A paleta de cores do Design System "Aura" é diretamente inspirada na identidade visual de **[carla.money](https://carla.money/)**. Ela é projetada para ser moderna, profissional e de alto contraste, garantindo legibilidade e uma hierarquia visual clara. A paleta é minimalista, com um uso forte e intencional de cores primárias e de destaque.

## 2. Cores Primárias

As cores primárias formam a base da nossa identidade visual.

| Cor | Amostra | HEX | RGB | Uso Principal |
| :--- | :--- | :--- | :--- | :--- |
| **Azul Elétrico** | ![#0052FF](https://placehold.co/15x15/0052FF/0052FF.png) | `#0052FF` | `0, 82, 255` | Destaques interativos, links, gráficos, ícones ativos, bordas de input em foco. É a cor que sinaliza "ação" e "informação". |
| **Preto** | ![#000000](https://placehold.co/15x15/000000/000000.png) | `#000000` | `0, 0, 0` | Botões de ação principal (CTAs), tipografia de títulos, ícones estáticos, fundos de elementos de alto contraste (ex: chat do agente). |
| **Branco** | ![#FFFFFF](https://placehold.co/15x15/FFFFFF/FFFFFF.png) | `#FFFFFF` | `255, 255, 255` | Fundo principal da aplicação, fundo de cards e modais, texto sobre fundos escuros. |

## 3. Cores Secundárias (Neutras)

As cores neutras são usadas para criar estrutura, profundidade e legibilidade sem competir com as cores primárias.

| Cor | Amostra | HEX | RGB | Uso Principal |
| :--- | :--- | :--- | :--- | :--- |
| **Cinza Fundo** | ![#F5F5F5](https://placehold.co/15x15/F5F5F5/F5F5F5.png) | `#F5F5F5` | `245, 245, 245` | Fundos de seções para criar uma diferenciação sutil em relação ao fundo branco principal. |
| **Cinza Bordas** | ![#EAEAEA](https://placehold.co/15x15/EAEAEA/EAEAEA.png) | `#EAEAEA` | `234, 234, 234` | Bordas de inputs, divisores de linhas em tabelas, linhas finas de separação. |
| **Cinza Texto Sec.** | ![#6C757D](https://placehold.co/15x15/6C757D/6C757D.png) | `#6C757D` | `108, 117, 125` | Texto de suporte, labels, placeholders, metadados (ex: timestamps). |

## 4. Cores de Feedback (Semânticas)

Estas cores são usadas para comunicar o status de uma ação ou informação ao usuário. Devem ser usadas de forma consistente para criar padrões de reconhecimento.

| Cor | Amostra | HEX | RGB | Uso Principal |
| :--- | :--- | :--- | :--- | :--- |
| **Sucesso (Verde)** | ![#00D084](https://placehold.co/15x15/00D084/00D084.png) | `#00D084` | `0, 208, 132` | Mensagens de sucesso, status "Completo" ou "Aprovado", variações de KPI positivas, ícones de validação. |
| **Alerta (Amarelo)** | ![#FFC107](https://placehold.co/15x15/FFC107/FFC107.png) | `#FFC107` | `255, 193, 7` | Avisos não críticos, status "Pendente" ou "Em Análise", notificações informativas. |
| **Erro (Vermelho)** | ![#DC3545](https://placehold.co/15x15/DC3545/DC3545.png) | `#DC3545` | `220, 53, 69` | Mensagens de erro, falhas de validação, status "Rejeitado", ações destrutivas, variações de KPI negativas. |

## 5. Implementação (Tailwind CSS)

Estas cores serão configuradas no arquivo `tailwind.config.js` para serem usadas como classes utilitárias em todo o projeto.

```javascript
// tailwind.config.js
const colors = require('tailwindcss/colors')

module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0052FF', // Azul Elétrico
        },
        secondary: {
          DEFAULT: '#00D084', // Verde Menta
        },
        neutral: {
          100: '#FFFFFF', // Branco
          200: '#F5F5F5', // Cinza Fundo
          300: '#EAEAEA', // Cinza Bordas
          700: '#6C757D', // Cinza Texto Sec.
          900: '#000000', // Preto
        },
        feedback: {
          success: '#00D084',
          warning: '#FFC107',
          error: '#DC3545',
        },
      },
    },
  },
  plugins: [],
}
```

**Exemplo de Uso:**

-   `<button class="bg-neutral-900 text-neutral-100">` para um botão preto.
-   `<h1 class="text-primary">` para um título em azul elétrico.
-   `<div class="border-neutral-300">` para uma borda cinza suave.

---

A aplicação consistente desta paleta é crucial para manter a integridade da marca Carla no dashboard.
