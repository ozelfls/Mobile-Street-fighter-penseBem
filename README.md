# Pense Bem: Street Fighter II

Aplicativo React Native com Expo baseado nos cinco programas do livro *Pense Bem: Street Fighter II*. Para jogar o Básico, use o livro físico para acompanhar as perguntas.

## Modos

- **Básico:** escolha um dos cinco programas do livro e um lutador. Cada programa tem 30 questões, com até três tentativas por questão. Os acertos valem 3, 2 ou 1 ponto conforme a tentativa; quem acertar todas na primeira tentativa ganha 10 pontos de bônus, chegando a 100. A cada questão acertada, o lutador golpeia o carro quatro vezes e a destruição avança uma vez.
- **PvP:** dois jogadores no mesmo aparelho escolhem personagens diferentes entre Ryu, Ken, Chun-Li e Blanka antes de jogar 20 turnos alternados. Cada turno mostra o programa e o número da questão antes do cronômetro, para o jogador encontrá-la no livro físico; a resposta é dada por uma das quatro teclas coloridas. Cada jogador começa com 100 HP e tem 20 segundos para responder após tocar em **Começar turno**. Acerto causa 15 de dano ao adversário; erro ou tempo esgotado tira de 10 a 30 HP de quem respondeu, aumentando 5 HP a cada 5 segundos.

## Rodar localmente

Requisitos: Node.js e npm.

```bash
npm ci
npm start
```

Abra o QR code no Expo Go ou use as opções do Expo para Android, iOS ou navegador.

## Homologação para a aula

[Pense Bem - Homologacao para testes](https://snack.expo.dev/KFs-2Su6DuZ46s55qzuRX?platform=web). Esta versão corresponde à `main` com o Básico pelo livro físico, quatro golpes por acerto e o PvP. É necessário acesso à internet para carregar o jogo, os sprites e os sons.

## Arquivos principais

- `App.js`: navegação entre os modos.
- `Home.js`: tela inicial.
- `Game.js`: perguntas e regras das partidas.
- `CombatStage.js`, `BonusCarStage.js` e `assets/combat/`: cenas animadas, lutadores, carro bônus e fontes dos sprites.
- `questions.json`: perguntas, alternativas e gabarito dos programas 1 a 5.
- `app.json`: configuração do Expo.

