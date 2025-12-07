Contexto: seção Payment + Customer + Establishment em detalhes de transação.

Payment card:
- Cartão visual com chip e bandeira (Mastercard), número mascarado com 4 visíveis, tipo Credit Card, categoria Standard.
- Issuing Bank e Country of Issue (bandeira + país) em cartões abaixo.
- Provider (ex. Cielo) e Statement Descriptor (A55pay*AKWAABA).
- Segurança: badges “No 3DS Authentication”, “No DataOnly Mode”.
- Anti-fraud: badge “Anti Fraud Decision Applied”.

Customer painel:
- Campos nome, email, Tax ID, address; cada um em cartões preenchidos.
- Transaction Location: mapa embutido com pin azul, controles de zoom; info Device Location (cidade/país).

Establishment painel:
- Campos Account, Merchant, Wallet com botão “View Account”.
- Identifiers (em coluna lateral): IDs de charge, transaction reference, account/merchant/wallet UUIDs, customer UUID, external ID, TID, Authorization Code.

Layout:
- Três colunas principais: Payment (esquerda), Customer (centro), Establishment/Identifiers (direita).
- Padding consistente, bordas suaves, títulos em azul/branco.

Referência visual: `reference/transactions-payment-card.png`.

