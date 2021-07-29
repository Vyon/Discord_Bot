/*

[Info]
I am going to use a custom log system you will need to modify the code if you want to use mongodb or a different database

*/

const { MessageEmbed } = require('discord.js'); // Using { item } will get a specific item
const { prefix } = require('./config.json') // Gets the prefix from the config file
const fs = require('fs'); // I use this strictly for reading json files

function log(info, userId) {
	let file_name = './logs.json'
	fs.readFile(file_name, function(err, data) { // reads the json files "data"
		let logFile = JSON.parse(data); // using JSON.parse turns the data into an object
		if (logFile.Moderation[userId] && Object.keys(logFile.Moderation[userId]).length !== 0) { // I use Object.keys() to get the length of dictionaries
			let userLogs = logFile.Moderation[userId]; // Saves me some energy of writing the line above multiple times
			userLogs[`${Object.keys(userLogs).length}`] = info; // Creates a log for that person using the length of the object
		} else {
			logFile.Moderation[userId] = {}; // Creates an index for the userid
			let userLogs = logFile.Moderation[userId]; // Saves me some energy of writing the line above multiple times
			userLogs[`${Object.keys(userLogs).length}`] = info; // Creates a log for that person using the length of the object
		};
	fs.writeFile(file_name, JSON.stringify(logFile, null, 4), () => console.error()); // Turns the logFile into nice looking json
	if (err) throw err; // logs the error
	});
};

function embed(args) {
	// embed documentation https://discordjs.guide/popular-topics/embeds.html#using-the-embed-constructor
	let embed = new MessageEmbed() // Creates an embed object
		.setColor('#C03CFF') // Sets a hexadecimal color, you can choose your own here: https://htmlcolorcodes.com/color-picker/
		.setTitle(args.title) // Sets the title
		.addFields(
			{ name: 'Info', value: `You were ${args.type} ${args.word} ${args.guild_name}`},
			{ name: 'Reason', value: `${args.reason}` },
		)
		.setTimestamp();
	return embed; // Returns the embed object to send to the target user
};

module.exports = {
	help: {
		command: ['help', 'info'], // Command Name/Names
		minArgs: 0, // The minimum amount of arguments you need
		callback: (msg) => { // callback function
			const { guild, member, author } = msg; // Gets the guild, member, and author objects
			const staff_roles = ['Staff']; // This will be used to loop and identify a staff member
			let embed = { // I use a different format for this embed so I can push fields
				title: 'Commands', // Sets the title
				color: 'C03CFF', // Sets a hexadecimal color, you can choose your own here: https://htmlcolorcodes.com/color-picker/
				fields: [
					{
						name: 'Community-Commands',
						value: `${prefix}help`
					}
				]
			};
			msg.delete(); // Deletes the msg
			for (staff_role of staff_roles) { // Looks through all of the staff roles
				const role = guild.roles.cache.find((r) => r.name === staff_role); // Finds and returns the role

				if (member.roles.cache.has(role.id)) { // Checks if the member has the role be using role.id
					embed.fields.push({ // Creates a new index and pushes it to the array
						name: 'Staff-Commands',
						value: `${prefix}clear <int>\n` + // Using + is for concatenation
						`${prefix}warn <target> <reason>\n` + // \n = newline character
						`${prefix}kick <target> <reason>\n` +
						`${prefix}ban <target> <reason>\n` +
						`${prefix}unban <target> <reason>`
					});
				};
			};
			author.send({ embed: embed }); // Sends the embed to the person who created the message
		}
	},
	clear: {
		command: ['clear', 'remove', 'purge'], // Command Name/Names
		minArgs: 1, // The minimum amount of arguments you need
		expectedArgs: '<int>', // If incorrect arguments are given the bot will reply with "Incorrect syntax, use <prefix><command>" and whatever is in expected args
		requiredRoles: ['Staff'], // The role needed to use this command
		callback: (msg, args) => { // callback function
			const { channel } = msg; // Gets the current channel
			const amount = parseInt(args[0]); // Changes the input number turn from a string into an integer
			msg.delete(); // Deletes the msg
			if (amount <= 50) { // Checks if the amount given is greater than or equal to 50
				channel.bulkDelete(amount, false) // Will delete the amount specified in the integer and false is for the filterOld ting
			} else { // If the number was to high
				msg.reply('Invalid amount to delete the max is 50').then((message) => { // Replies to the message that was sent then calls a function
					setTimeout(() =>  message.delete(), 3000); // Waits 3 seconds or 3000 milliseconds then deletes the message
				});
			};
		}
	},
	warn: {
		command: 'warn', // Command Name/Names
		minArgs: 2, // The minimum amount of arguments you need
		expectedArgs: '<target> <reason>',
		requiredRoles: ['Staff'], // The role needed to use this command
		callback: (msg, args, __, bot, timeArr) => { // callback function
			const { guild, author } = msg // Gets the guild and author
			const currentGuild = bot.guilds.cache.get(guild.id) // Gets the current guild from the bots cache
			const memberCache = currentGuild.members.cache // Gets the members cache
			const userId = args[0].match(/(\d+)/) // Gets the targets id in integer form
			const target = memberCache.get(userId[0]) // Gets the target

			const info = { // Moderation Log Info
				"ModerationType": 'warn',
				"info": `${author.username}#${author.discriminator} warned ${target.user.username}#${target.user.discriminator} for: ${args[1]}`,
				"staff_id": `${author.id}`,
				"target_id": `${target.id}`,
				"Time": `${timeArr.hour}:${timeArr.minute} ${timeArr.typography}`,
				"Date": `${timeArr.month}/${timeArr.day}/${timeArr.year}`
			}

			target.send({
				embed: embed({
					title: 'Warning', // Title
					type: 'warned', // This is really just the tense of the action but like
					word: 'in', // idfk
					guild_name: `${guild.name}`, // The guilds name
					reason: `${args[1]}` // reason that was passed in
				})
			}).then( // After the embed is sent it will log the data in the const "info"
				log(info, target.id) // Logs Data using the function located on line 12-27
			)

			msg.delete() // Deletes the message
		}
	},
	kick: {
		command: 'kick', // Command Name/Names
		minArgs: 2, // The minimum amount of arguments you need
		expectedArgs: '<target> <reason>',
		requiredRoles: ['Staff'], // The role needed to use this command
		callback: (msg, args, __, bot, timeArr) => { // callback function
			const { guild, author } = msg // Gets the guild and author
			const currentGuild = bot.guilds.cache.get(guild.id) // Gets the current guild from the bots cache
			const memberCache = currentGuild.members.cache // Gets the members cache
			const userId = args[0].match(/(\d+)/) // Gets the targets id in integer form
			const target = memberCache.get(userId[0]) // Gets the target

			const info = { // Moderation Log Info
				"ModerationType": 'kick',
				"info": `${author.username}#${author.discriminator} kicked ${target.user.username}#${target.user.discriminator} for: ${args[1]}`,
				"staff_id": `${author.id}`,
				"target_id": `${target.id}`,
				"Time": `${timeArr.hour}:${timeArr.minute} ${timeArr.typography}`,
				"Date": `${timeArr.month}/${timeArr.day}/${timeArr.year}`
			}

			try { // Tries to send an embed, log and kick
				target.send({ embed: embed({
					title: 'Kicked', 
					type: 'kicked', 
					word: 'from', 
					guild_name: `${guild.name}`, 
					reason: `${args[1]}`
				}) 
			}).then(log(info, target.id)).then(setTimeout(() => target.kick(args[1]), 5000))
			} catch { // If failure then:
				msg.reply('User was unable to be kicked.').then((message) => { // Replies then calls function
					setTimeout(() =>  message.delete(), 3000) // Waits 3 seconds or 3000 milliseconds then deletes the message
				});
			};
			msg.delete() // Deletes message
		}
	},
	ban: {
		command: 'ban', // Command Name/Names
		minArgs: 2, // The minimum amount of arguments you need
		expectedArgs: '<target> <reason>',
		requiredRoles: ['Staff'], // The role needed to use this command
		callback: (msg, args, __1, bot, timeArr) => { // callback function
			const { guild, author } = msg // Gets the guild and author
			const currentGuild = bot.guilds.cache.get(guild.id) // Gets the current guild from the bots cache
			const memberCache = currentGuild.members.cache // Gets the members cache
			const userId = args[0].match(/(\d+)/) // Gets the targets id in integer form
			const target = memberCache.get(userId[0]) // Gets the target

			const info = { // Moderation Log Info
				"ModerationType": 'ban',
				"info": `${author.username}#${author.discriminator} banned ${target.user.username}#${target.user.discriminator} for: ${args[1]}`,
				"staff_id": `${author.id}`,
				"target_id": `${target.id}`,
				"Time": `${timeArr.hour}:${timeArr.minute} ${timeArr.typography}`,
				"Date": `${timeArr.month}/${timeArr.day}/${timeArr.year}`
			}

			if (target && args[1]) { // If the target exists and the reason exists then:
				try { // Tries to send an embed, log and ban
					target.send({ embed: embed({
						title: 'Banned', 
						type: 'banned', 
						word: 'from', 
						guild_name: `${guild.name}`, 
						reason: `${args[1]}`
					}) 
				}).then(log(info, target.id)).then(setTimeout(() => target.ban(), 5000))
				} catch { // If failure then:
					msg.reply('User was unable to be banned.').then((message) => { // Replies then calls the function
						setTimeout(() =>  message.delete(), 3000) // Waits 3 seconds or 3000 milliseconds then deletes the message
					});
				};
			} else msg.reply('User does not exist').then((message) => { // Replies then calls the function
				setTimeout(() => message.delete(), 3000); // Waits 3 seconds or 3000 milliseconds then deletes the message
			});
		}
	},
	unban: {
		command: 'unban', // Command Name/Names
		minArgs: 2, // The minimum amount of arguments you need
		expectedArgs: '<target> <reason>',
		requiredRoles: ['Staff'], // The role needed to use this command
		callback: async(msg,  args, __1, __2, timeArr) => { // async functions allow async specific things to be used such as await
			const { guild, author } = msg // Gets the guild and author
			const members = guild.members // The servers member list
			try { // Tries to unban target and log user data
				const target = await members.unban(args[0]) // waits for the member to be unbanned

				const info = { // Moderation Log Info
					"ModerationType": 'unban',
					"info": `${author.username}#${author.discriminator} unbanned ${target.username}#${target.discriminator} for: ${args[1]}`,
					"staff_id": `${author.id}`,
					"target_id": `${args[0]}`,
					"Time": `${timeArr.hour}:${timeArr.minute} ${timeArr.typography}`,
					"Date": `${timeArr.month}/${timeArr.day}/${timeArr.year}`
				};

				log(info, target.id); // Logs data in the const "info"
			} catch { // If failure then:
				msg.reply('User was unable to be unbanned.').then((message) => { // Replies then calls the function
					setTimeout(() =>  message.delete(), 3000); // Waits 3 seconds or 3000 milliseconds then deletes the message
				});
			};
		}
	}
};