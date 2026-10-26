# Pense Bem: Street Fighter II

Aplicativo React Native com Expo baseado nos cinco programas do livro *Pense Bem: Street Fighter II*. As questões visuais foram adaptadas para texto para facilitar a apresentação no celular.

## Modos

- **Básico:** cinco programas do livro, 30 perguntas cada, até três tentativas e 3/2/1/0 pontos.
- **Clássico — Desafio:** escolha um lutador, responda 50 perguntas aleatórias sem repetição, ganhe um ponto por acerto e jogue com três vidas. Cada acerto anima o lutador atacando o carro bônus.
- **Clássico — Sobrevivência:** escolha um lutador e marque o máximo de pontos em 3 minutos. O primeiro acerto vale 100 pontos e cada acerto consecutivo multiplica o valor do próximo por 1,1, arredondado ao inteiro mais próximo. Um erro encerra a partida, preservando os pontos ganhos. As perguntas são embaralhadas novamente caso o banco se esgote durante a rodada.
- **PvP:** dois jogadores no mesmo aparelho escolhem personagens diferentes entre Ryu, Ken, Chun-Li e Blanka antes de jogar 20 turnos alternados. Cada um começa com 100 HP e tem 20 segundos por pergunta. Acerto causa 15 de dano ao adversário; erro ou tempo esgotado tira de 10 a 30 HP de quem respondeu, aumentando 5 HP a cada 5 segundos. O cronômetro começa quando o jogador toca em **Começar turno**.

## Rodar localmente

Requisitos: Node.js e npm.

```bash
npm ci
npm start
```

Abra o QR code no Expo Go ou use as opções do Expo para Android, iOS ou navegador.

## Prévia de teste

[Abrir a versão atual no Expo Snack](https://snack.expo.dev/OylMELMZBUjQ2FfChq3nS?platform=web). Esta prévia corresponde à `main`, com a nova Sobrevivência e a cena do carro.

## Arquivos principais

- `App.js`: navegação entre os modos.
- `Home.js`: tela inicial.
- `Game.js`: perguntas e regras das partidas.
- `CombatStage.js`, `BonusCarStage.js` e `assets/combat/`: cenas animadas, lutadores, carro bônus e fontes dos sprites.
- `questions.json`: perguntas, alternativas e gabarito dos programas 1 a 5.
- `app.json`: configuração do Expo.

O link público para a entrega da avaliação será definido depois da revisão do grupo.
