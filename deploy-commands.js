const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./config.json');

const commands = [
    new SlashCommandBuilder().setName('tictactoe').setDescription('Play a game of Tic Tac Toe'),
];

const rest = new REST({ version: '9' }).setToken(token);
rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands.map(command => command.toJSON()) })
    .then(() => console.log('Successfully Registered Application Command'))
    .catch(console.error);
