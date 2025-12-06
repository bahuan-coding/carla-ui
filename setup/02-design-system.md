# 02 - Design System (Dark Crystal)

Tema:
- Fundo: gradients azul/púrpura sobre base #0b1020; cards glass (bg rgba(255,255,255,0.04), border 1px rgba(255,255,255,0.08), blur 12px, shadow glass).
- Cores HSL via shadcn tokens; accent principal azul (#6b8bff), accent2 púrpura (#9b7bff).
- Tipografia: Inter / SF, 14px+; títulos semibold.
- Espaçamento: 4/8/12/16/24; radius 12px (lg), 16px (xl).
- Ícones: lucide 18–20px stroke 1.5.
- Animações: 150–200ms ease-out; hover lift suave; focus ring 2px accent.

Componentes base (shadcn):
- Button, Input, Card, Dialog, Sheet, Tooltip, Dropdown, Avatar, Badge, Tabs, Table, Toast, Skeleton.
- Ajustar tokens para modo dark por default; suportar light via classe.

Data viz:
- Stacked bars para atividade semanal; donut para distribuição; linhas para SLA.
- Legendas claras, tooltips com valores absolutos/percentuais.
- Skeletons para loading e mensagens de erro com ação “Reintentar”.

