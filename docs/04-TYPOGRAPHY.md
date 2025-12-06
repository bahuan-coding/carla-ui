# 04: Tipografia

**Versão:** 2.0
**Data:** 06 de Dezembro de 2025

---

## 1. Visão Geral

A tipografia é um pilar fundamental da identidade visual do **Carla Channels Dashboard**. Ela não apenas garante a legibilidade do conteúdo, mas também estabelece o tom de voz da marca: moderno, claro e profissional. Nossa abordagem tipográfica é sistemática, utilizando uma única família de fontes e uma escala bem definida para criar uma hierarquia visual consistente e harmoniosa.

## 2. Família Tipográfica

-   **Fonte Principal:** **Poppins**
-   **Fonte de Fallback:** `sans-serif`

**Justificativa:**
A fonte **Poppins** foi escolhida por suas características geométricas e limpas, que se alinham perfeitamente com a estética moderna e profissional de `carla.money`. É uma fonte altamente legível em diversos tamanhos e pesos, tornando-a ideal para uma interface de dados densa como um dashboard. Além disso, é uma fonte de código aberto e facilmente acessível através do Google Fonts.

**Importação (Exemplo):**
Para usar a Poppins, ela deve ser importada no projeto. A maneira mais comum é via Google Fonts, adicionando o seguinte ao `<head>` do seu `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
```

## 3. Escala Tipográfica

A escala tipográfica define os tamanhos e pesos de fonte para cada nível semântico de texto. O uso consistente desta escala é crucial para a harmonia visual da interface.

| Estilo | Tamanho (font-size) | Peso (font-weight) | Altura da Linha (line-height) | Uso Principal |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | `48px` (3rem) | `700` (Bold) | `60px` (3.75rem) | Títulos de página muito proeminentes, números de KPI gigantes. Usar com moderação. |
| **Título 1 (h1)** | `36px` (2.25rem) | `700` (Bold) | `44px` (2.75rem) | Título principal de cada página ou seção principal. |
| **Título 2 (h2)** | `24px` (1.5rem) | `600` (SemiBold) | `32px` (2rem) | Títulos de cards, seções secundárias, títulos de modais. |
| **Título 3 (h3)** | `20px` (1.25rem) | `600` (SemiBold) | `28px` (1.75rem) | Subtítulos dentro de cards ou seções. |
| **Corpo (Body)** | `16px` (1rem) | `400` (Regular) | `24px` (1.5rem) | Texto principal, parágrafos, descrições. É a base da nossa tipografia. |
| **Corpo (Bold)** | `16px` (1rem) | `700` (Bold) | `24px` (1.5rem) | Para dar ênfase a palavras ou frases dentro do texto principal. |
| **Label** | `14px` (0.875rem) | `500` (Medium) | `20px` (1.25rem) | Labels de formulários, cabeçalhos de tabelas, texto de navegação. |
| **Caption** | `12px` (0.75rem) | `400` (Regular) | `16px` (1rem) | Texto de ajuda, metadados (timestamps), notas de rodapé. |

## 4. Hierarquia e Aplicação

-   **Contraste de Peso:** Use a variação de peso (Regular, Medium, SemiBold, Bold) para criar hierarquia sem precisar alterar o tamanho da fonte. Por exemplo, um título de card pode ser `24px SemiBold` enquanto o conteúdo é `16px Regular`.
-   **Cor do Texto:** A cor padrão para todo o texto é o **Preto (`#000000`)** para garantir o máximo de contraste e legibilidade. O **Cinza Texto Sec. (`#6C757D`)** deve ser usado para texto secundário, como placeholders e captions.
-   **Comprimento da Linha:** Para parágrafos de texto, o comprimento ideal da linha deve ser entre 50 e 75 caracteres para uma legibilidade ótima.

## 5. Implementação (Tailwind CSS)

A família de fontes e a escala de tamanhos serão configuradas no `tailwind.config.js`.

```javascript
// tailwind.config.js
const { fontFamily } = require("tailwindcss/defaultTheme");

module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", ...fontFamily.sans],
      },
      fontSize: {
        'xs': ['12px', '16px'],    // Caption
        'sm': ['14px', '20px'],    // Label
        'base': ['16px', '24px'],  // Body
        'lg': ['20px', '28px'],    // h3
        'xl': ['24px', '32px'],    // h2
        '2xl': ['36px', '44px'],   // h1
        '3xl': ['48px', '60px'],   // Display
      },
    },
  },
  plugins: [],
};
```

**Exemplo de Uso:**

-   `<h1 class="text-2xl font-bold">` para um Título 1.
-   `<p class="text-base font-regular">` para um parágrafo de corpo.
-   `<label class="text-sm font-medium">` para uma label de formulário.

---

A disciplina no uso da tipografia é essencial para uma interface limpa e profissional. Evite usar tamanhos ou pesos de fonte que não estejam definidos nesta escala.
