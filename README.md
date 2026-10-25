# Pense Bem: Street Fighter II

Aplicativo React Native com Expo baseado nos cinco programas do livro *Pense Bem: Street Fighter II*. As questões visuais foram adaptadas para texto para facilitar a apresentação no celular.

## Modos

- **Básico:** cinco programas do livro, 30 perguntas cada, até três tentativas e 3/2/1/0 pontos.
- **Clássico — Desafio:** 50 perguntas aleatórias sem repetição, um ponto por acerto e três vidas.
- **Clássico — Sobrevivência:** 50 perguntas aleatórias sem repetição, um ponto por acerto; um erro encerra a partida e zera a pontuação.
- **PvP:** dois jogadores no mesmo aparelho escolhem personagens diferentes entre Ryu, Ken, Chun-Li e Blanka antes de jogar 20 turnos alternados. Cada um começa com 100 HP e tem 20 segundos por pergunta. Acerto causa 15 de dano ao adversário; erro ou tempo esgotado tira de 10 a 30 HP de quem respondeu, aumentando 5 HP a cada 5 segundos. O cronômetro começa quando o jogador toca em **Começar turno**.

## Rodar localmente

Requisitos: Node.js e npm.

```bash
npm ci
npm start
```

Abra o QR code no Expo Go ou use as opções do Expo para Android, iOS ou navegador.

## Prévia de teste

[Abrir a versão atual para revisão no Expo Snack](https://snack.expo.dev/GOt9kiGfpFyu0F-tUzM8g?platform=web). Este é o link de teste para o grupo; a versão final de entrega será definida após a revisão.

## Arquivos principais

- `App.js`: navegação entre os modos.
- `Home.js`: tela inicial.
- `Game.js`: perguntas e regras das partidas.
- `CombatStage.js` e `assets/combat/`: cena animada do PvP e fontes dos GIFs.
- `questions.json`: perguntas, alternativas e gabarito dos programas 1 a 5.
- `app.json`: configuração do Expo.

O link público para a entrega da avaliação será definido depois da revisão do grupo.
