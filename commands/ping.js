module.exports = {
	name: 'ping',
	description: 'Ping!',
	execute(message, args) {
		message.channel.send('Pong.');
	},
};

// from  https://discordjs.guide/command-handling/#individual-command-files