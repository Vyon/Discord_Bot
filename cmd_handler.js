/*

[Credits]
I didn't make this command handler but I did tweak certain parts to make stuff work with my config

Author: Worn Off Keys
https://www.youtube.com/channel/UChPrh75CmPP9Ig6jISPnfNA
https://github.com/AlexzanderFlores/Worn-Off-Keys-Discord-Js/blob/master/22-Advanced-Command-Handler/commands/command-base.js

*/
const { prefix } = require('./config.json')
const time = require('./time')

const validatePermissions = (permissions) => {
	const validPermissions = [
		'CREATE_INSTANT_INVITE',
		'KICK_MEMBERS',
		'BAN_MEMBERS',
		'ADMINISTRATOR',
		'MANAGE_CHANNELS',
		'MANAGE_GUILD',
		'ADD_REACTIONS',
		'VIEW_AUDIT_LOG',
		'PRIORITY_SPEAKER',
		'STREAM',
		'VIEW_CHANNEL',
		'SEND_MESSAGES',
		'SEND_TTS_MESSAGES',
		'MANAGE_MESSAGES',
		'EMBED_LINKS',
		'ATTACH_FILES',
		'READ_MESSAGE_HISTORY',
		'MENTION_EVERYONE',
		'USE_EXTERNAL_EMOJIS',
		'VIEW_GUILD_INSIGHTS',
		'CONNECT',
		'SPEAK',
		'MUTE_MEMBERS',
		'DEAFEN_MEMBERS',
		'MOVE_MEMBERS',
		'USE_VAD',
		'CHANGE_NICKNAME',
		'MANAGE_NICKNAMES',
		'MANAGE_ROLES',
		'MANAGE_WEBHOOKS',
		'MANAGE_EMOJIS',
	]

	for (const permission of permissions) {
		if (!validPermissions.includes(permission)) {
			throw new Error(`Unknown permission node "${permission}"`)
		}
	}
}

module.exports = (bot, commandOptions) => {
	let {command, expectedArgs = '', permissionError = 'You do not have permission to run this command.', minArgs = 0, maxArgs = null, permissions = [], requiredRoles = [], callback} = commandOptions

	if (typeof command === 'string') {
		command = [command]
	}

	if (permissions.length) {
		if (typeof permissions === 'string') {
			permissions = [permissions]
		}

		validatePermissions(permissions)
	}

	bot.on('message', (message) => {
		const { member, content, guild } = message

		for (const alias of command) {
			const command = `${prefix}${alias.toLowerCase()}`

			if (content.toLowerCase().startsWith(`${command} `) || content.toLowerCase() === command) {
				for (const permission of permissions) {
					if (!member.hasPermission(permission)) {
						message.reply(permissionError)
						return
					}
				}

				for (const requiredRole of requiredRoles) {
					const role = guild.roles.cache.find((role) => role.name === requiredRole)

					if (!role || !member.roles.cache.has(role.id)) {
						message.reply(`You must have the "${requiredRole}" role to use this command.`)
						return
					}
				}

				const arguments = content.split(/[ ]+/)

				arguments.shift()

				if (arguments.length < minArgs || (maxArgs !== null && arguments.length > maxArgs)) {
					message.reply(`Incorrect syntax, use ${prefix}${alias} ${expectedArgs}`)
					return
				}

				callback(message, arguments, arguments.join(' '), bot, time.getTime())
				return
			}
		}
	})
}