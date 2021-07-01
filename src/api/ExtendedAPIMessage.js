/**
 * from: https://gist.github.com/Allvaa/0320f06ee793dc88e4e209d3ea9f6256
 *
 * It's working fine now.
 * But planned to be removed when official support with DiscordJS v13 becomes available.
 */
const { APIMessage, Structures } = require('discord.js')

class ExtendedAPIMessage extends APIMessage{

    resolveData(){
        if(this.data) return this
        super.resolveData()
        const allowedMentions = this.options.allowedMentions || this.target.client.options.allowedMentions || {}
        if(allowedMentions.repliedUser !== undefined){
            if(this.data.allowed_mentions === undefined) this.data.allowed_mentions = {}
            Object.assign(this.data.allowed_mentions, {replied_user: allowedMentions.repliedUser})
        }
        if(this.options.replyTo !== undefined){
            Object.assign(this.data, {message_reference: {message_id: this.options.replyTo.id}})
        }
        return this
    }

}

class Message extends Structures.get('Message'){

    inlineReply(content, options){
        return this.channel.send(ExtendedAPIMessage.create(this, content, options, {replyTo: this}).resolveData())
    }

    edit(content, options){
        return super.edit(ExtendedAPIMessage.create(this, content, options).resolveData())
    }

}

Structures.extend('Message', () => Message)
