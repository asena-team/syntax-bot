const { WebhookClient } = require('discord.js')

const webhook = new WebhookClient(
    process.env.SYNTAX_WEBHOOK_ID,
    process.env.SYNTAX_WEBHOOK_TOKEN
)

module.exports = webhook
