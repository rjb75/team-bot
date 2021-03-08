module.exports = {
	name: 'help',
	description: 'Ask for help',
	execute(message, args) {
		message.channel.send('Get your own help');
	},
};
