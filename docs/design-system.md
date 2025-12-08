# Design System "Aura"

O Design System **"Aura"** é o ecossistema de design e desenvolvimento para o **Carla Channels Dashboard**. Ele existe para garantir consistência, acelerar o desenvolvimento e criar uma interface de usuário coesa, intuitiva e perfeitamente alinhada com a identidade da marca Carla.

## Filosofia e Princípios

Nossa filosofia de design é centrada no **minimalismo funcional**.

| Princípio | Descrição |
| :--- | :--- |
| **Clareza Radical** | A interface deve ser autoexplicativa. A complexidade inerente aos dados financeiros e processos de CRM será abstraída através de layouts limpos, hierarquia visual forte e comunicação direta. |
| **Consistência Coesiva** | Um usuário deve ser capaz de prever como um elemento da interface se comportará, independentemente de onde ele apareça. |
| **Eficiência Orientada ao Fluxo** | O design deve ser um catalisador para a produtividade. Os fluxos de trabalho devem ser otimizados para o menor número de cliques. |
| **Estética da Confiança** | A aparência da interface deve inspirar confiança e profissionalismo através de uma estética limpa, organizada e de alta qualidade. |
| **Escalabilidade Modular** | O sistema é construído com base em componentes modulares e reutilizáveis. |

## Estrutura do Sistema

O Design System Aura é estruturado usando a metodologia de **Design Atômico**:

1. **Tokens de Design:** Valores primitivos (cores, fontes, espaçamentos) gerenciados em `tailwind.config.js`.
2. **Átomos:** Blocos básicos (Botões, Inputs, Labels, Ícones, Avatares).
3. **Moléculas:** Grupos de átomos (campo de formulário, card de KPI, item de menu).
4. **Organismos:** Combinações de moléculas (cabeçalho, tabela de dados, painel de perfil).
5. **Templates:** Estruturas de página que organizam os organismos.

## Ferramentas e Implementação

- **Tailwind CSS:** Para aplicar os tokens de design através de classes utilitárias.
- **shadcn/ui:** Para a biblioteca de componentes, permitindo customização total.
- **React:** Como a biblioteca de UI para construir a interface.

