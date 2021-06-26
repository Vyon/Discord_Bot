/*

DISCORD.JS DOCUMENTATION:
https://discord.js.org/#/docs/main/stable/general/welcome

[Const]: Static variables | Basic Usage: const <variable_name> = '';
[Var]: Non Static variables can be used in many places | Basic Usage: var <variable_name> = '';
[Let]: Non Static variables can be used in a specific part of the script | Basic Usage: let <variable_name> = '';
Using . goes up in the directory;

*/

const discord = require('discord.js'); // Requires discord.js
const config = require('./config.json'); // Requires the config file
const cmds = require('./cmds'); // Gets the commands
const cmd_handler = require('./cmd_handler'); // Requires the command handler
const bot = new discord.Client(); // Creates a new client

bot.on('ready', () => {
	// bot is an emitter that you can add listeners for currently waiting for the bot to be "ready"
	// () => {} is a callback

	bot.user.setActivity('waiting...', { // Sets Activity
		type: 'WATCHING', // List of types https://discord.js.org/#/docs/main/stable/typedef/ActivityType I recommend looking up a video to use them because discord.js documentation kinda ass
		url: 'https://www.example.com' // Url to "Watch" for me it didn't actually say that it was watching this but like
	});
	
	console.log(`Logged in as ${bot.user.tag}`); // Using backticks or [ ` ] allows you to plug in string variables

	bot.setMaxListeners(0); // Using 0 actually means its inf useful if you want to have a lot of commands

	for (cmd in cmds) { // the variables cmd is an index
		cmd_handler(bot, cmds[cmd]) // Passes the bot object and the command
	};
});

bot.login(config.token) // Uses the token that was put in the config file to start the bot