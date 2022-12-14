const { Client, Collection, GatewayIntentBits, Partials } = require("discord.js");
const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildEmojisAndStickers, GatewayIntentBits.GuildIntegrations, GatewayIntentBits.GuildWebhooks, GatewayIntentBits.GuildInvites, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.DirectMessageTyping, GatewayIntentBits.MessageContent], shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember, Partials.Reaction, Partials.GuildScheduledEvent, Partials.User, Partials.ThreadMember]});

const config = require("./src/config.js");
const { readdirSync } = require("fs")
const moment = require("moment");
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const token = config.token
const { AuditLogEvent, Events } = require('discord.js');
const db = require("croxydb")

client.commands = new Collection()
const rest = new REST({ version: '10' }).setToken(token);

const commands = [];
readdirSync('./src/commands').forEach(async file => {
  const command = require(`./src/commands/${file}`);
  commands.push(command.data.toJSON());
  client.commands.set(command.data.name, command);
})

client.on("ready", async () => {
        try {
            await rest.put(
                Routes.applicationCommands(client.user.id),
                { body: commands },
            );
        } catch (error) {
            console.error(error);
        }
})

readdirSync('./src/events').forEach(async file => {
	const event = require(`./src/events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
})
//

client.login(token)
client.on(Events.GuildBanAdd, async ban => {
  const fetchedLogs = await ban.guild.fetchAuditLogs({
		limit: 1,
		type: AuditLogEvent.MemberBanAdd,
	});
  if(!fetchedLogs) return;
  const banLog = fetchedLogs.entries.first();
  const { executor, target } = banLog;
  const channel = db.fetch(`banlog_${ban.guild.id}`)
  if(!channel) return;
  client.channels.cache.get(channel).send(`**Yasaklanan:** ${ban.user.tag} \n\n**Yasaklayan:**${executor.tag}`)
})


client.on("roleDelete", async role => {
  const log = await role.guild.fetchAuditLogs({
        type: AuditLogEvent.RoleDelete,
        limit: 1
      })
      if(!log) return;
      const rollog = log.entries.first();
      const { executor, target } = rollog;

      const channel = db.fetch(`rollog`)
      if(!channel) return;
      client.channels.cache.get(channel).send(`**Silinen Rol:** ${role.name} \n\n**Silen Yetkili:** ${executor.tag}`)
})


client.on("channelDelete", async(channel) => {
  const fetchedLogs = await channel.guild.fetchAuditLogs({
		limit: 1,
		type: AuditLogEvent.ChannelDelete,
	});
  if(!fetchedLogs) return;
	const channellog = fetchedLogs.entries.first();
  const { executor, target } = channellog;

const channels = db.fetch(`${channel.guild.id}`)
if(!channels) return;
client.channels.cache.get(channels).send(`**Silinen Kanal:** ${channel.name} \n\n**Silen Yetkili:** ${executor.tag}`)
})
