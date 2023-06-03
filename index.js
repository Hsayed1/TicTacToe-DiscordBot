const { Client, GatewayIntentBits, Embed, Component, ActionRow, MessageActionRow, MessageButton} = require('discord.js');

const {token} = require ('./config.json');
const {TicTacToe} = require('./databaseObjects.js');

const client = new Client({
    intents: [
        'GUILDS',
        'GUILD_MESSAGES'
    ]
});

client.once('ready', () => {
    console.log('Ready!');
})

client.on('messageCreate', (message) => {
    if (message.author.id === client.user.id) return;   //makes sure bot does not reply to itself

    if(message.content = "ping") {    //checking message
        message.reply("pong");
    }
})


/*Tic tac Toe*/
let EMPTY = Symbol("empty");
let PLAYER = Symbol("player");
let BOT = Symbol("bot");   //used to tell when bot selects

let tictactoe_state

function makeGrid() {
    components = []

    for(let row = 0; row < 3; row++){
        actionRow = new MessageActionRow()

        for(let col = 0; col < 3; col++){
            messageButton = new MessageButton()
                .setCustomId('tictactoe_' + row + '_' + col)
            
            switch(tictactoe_state[row][col]){
                case EMPTY:
                    messageButton.setLabel('Select').setStyle('SECONDARY')
                    break;
                case PLAYER:
                    messageButton.setLabel('X').setStyle('PRIMARY')
                    break;
                case BOT:
                    messageButton.setLabel('O').setStyle('DANGER')
                    break;
            }          
            actionRow.addComponents(messageButton)
        }
        components.push(actionRow)
    }
    return components
}

function isDraw() {
    
    // Check if any empty cell is present
    for(let i = 0; i < 3; i++){
        for (let j = 0; j < 3; j++){
            if (tictactoe_state[i][j] == EMPTY){
                return false;
            }
        }
    }
    return true;
}

function isGameOver() {
    // Check rows
    for (let row of tictactoe_state) {
      if (new Set(row).size === 1 && row[0] !== EMPTY) {
        return true;
      }
    }
  
    // Check columns
    for (let col = 0; col < tictactoe_state[0].length; col++) {
      let column = [];
      for (let row = 0; row < tictactoe_state.length; row++) {
        column.push(tictactoe_state[row][col]);
      }
      if (new Set(column).size === 1 && column[0] !== EMPTY) {
        return true;
      }
    }
  
    // Check diagonals
    let diagonal1 = [];
    let diagonal2 = [];
    for (let i = 0; i < tictactoe_state.length; i++) {
      diagonal1.push(tictactoe_state[i][i]);
      diagonal2.push(tictactoe_state[i][tictactoe_state.length - 1 - i]);
    }
    if (new Set(diagonal1).size === 1 && diagonal1[0] !== EMPTY) {
      return true;
    }
    if (new Set(diagonal2).size === 1 && diagonal2[0] !== EMPTY) {
      return true;
    }
  
    // Game is not over
    return false;
  }

function getRandomInt(max){
    return Math.floor(Math.random() * max);
}

client.on('interactionCreate', async (interaction) => {
    if (interaction.isCommand()) {
        const { commandName } = interaction;

        if (commandName === 'tictactoe') {
            tictactoe_state = [
                [EMPTY, EMPTY, EMPTY],
                [EMPTY, EMPTY, EMPTY],
                [EMPTY, EMPTY, EMPTY]
            ];

            try {
                await interaction.reply({ content: 'Playing a game of tic tac toe', components: makeGrid() });
            } catch (error) {
                console.error('Error during interaction handling:', error);
            }
        }
    }

    if (interaction.isButton() && interaction.customId.startsWith('tictactoe')) {
        if (isGameOver()) {
            interaction.update({
                components: makeGrid()
            });
            return;
        }
        let parsedFields = interaction.customId.split("_");
        let row = parsedFields[1];
        let col = parsedFields[2];

        if (tictactoe_state[row][col] != EMPTY) {
            interaction.update({
                content: "This square has already been selected!",
                components: makeGrid()
            });
            return;
        }

        tictactoe_state[row][col] = PLAYER;

        if (isGameOver()) {
            let user = await TicTacToe.findOne({
                where: {
                    user_id: interaction.user.id
                }
            });
            if(!user){
                user = await TicTacToe.create({ user_id: interaction.user.id});
            }
            await user.increment('score');

            interaction.update({
                content: "You won! You have now won: "+ (user.get('score') + 1) + " time(s).",
                components: []
            });
            return;
        }

        if (isDraw()) {
            interaction.update({
                content: "The game resulted in a draw!",
                components: []
            });
            return;
        }

        // Bot functions
        let botRow;
        let botCol;
        do {
            botRow = getRandomInt(3);
            botCol = getRandomInt(3);
        } while (tictactoe_state[botRow][botCol] != EMPTY);

        tictactoe_state[botRow][botCol] = BOT;
        

        if (isGameOver()) {
            interaction.update({
                content: "You lost!",
                components: makeGrid()
            });
            return;
        }

        if (isDraw()) {
            interaction.update({
                content: "The game resulted in a draw!",
                components: []
            });
            return;
        }

        interaction.update({
            components: makeGrid()
        });
    }
});

client.login(token);