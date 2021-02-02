const {
    GuildMember,
    MessageEmbed
} = require('discord.js')
const DBL = require('dblapi.js')
const cron = require('node-cron')

const { Roles, URLMap } = require('./../Constants')
const { subscriber, publisher } = require('./../drivers/Redis')
const webhook = require('./../Webhook')
const { findTurkishMonthName } = require('./../utils/DateTimeHelper')

module.exports = (client, server, db) => {
    const api = new DBL(process.env.TOP_GG_API_TOKEN, {
        webhookPath: process.env.TOP_GG_WEBHOOK_PATH,
        webhookPort: process.env.TOP_GG_WEBHOOK_PORT,
        webhookAuth: process.env.TOP_GG_WEBHOOK_PASSWORD
    })

    api.webhook.on('ready', hook => console.log(`Webhook şu adreste çalışıyor: http://${hook.hostname}:${hook.port}${hook.path}`))

    const buildVoteEmbed = (user, mentionable) => {
        return new MessageEmbed()
            .setAuthor('Oy Vermek İçin Tıkla', user ? (mentionable ? user.user.displayAvatarURL() : user.displayAvatarURL()) : URLMap.ANONYMOUS_PP_URL, URLMap.TOP_GG_VOTE_URL)
            .setDescription([
                (user
                    ?
                    `${mentionable ? `<@${user.id}>` : `**${user.username}#${user.discriminator}**`}`
                    :
                    'Anonim biri'
                ) + ` bize oy verdi.`,
                'Desteklerinden dolayı **teşekkür** ederiz.'
            ])
            .setTimestamp()
            .setColor('#50C878')
    }

    const fetchUser = async user_id => {
        return new Promise(resolve => {
            server.members
                .fetch(user_id)
                .then(resolve)
                .catch(() => {
                    client.users
                        .fetch(user_id)
                        .then(resolve)
                        .catch(() => resolve(undefined))
                })
        })
    }

    const runWebhook = async (user, mentionable = false) => {
        await webhook.send({
            embeds: [buildVoteEmbed(user, mentionable)]
        })
    }

    api.webhook.on('vote', async vote => {
        db.run('INSERT INTO votes (user_id, count) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET count = count + 1', [
            vote.user,
            1
        ])

        const user = await fetchUser(vote.user)
        if(user){
            publisher.setex(vote.user, 60 * 60 * 12 /* 12 Hour */, '1', async err => {
                const isGuildMember = user instanceof GuildMember
                if(!err && isGuildMember) await user.roles.add(Roles.VOTE_SUPPORTER)

                await runWebhook(user, isGuildMember)
            })
        }else{
            await runWebhook(user)
        }
    })

    subscriber.psubscribe('*', () => {
        subscriber.on('pmessage', async (channel, message) => {
            const user_id = message.split(':').pop()
            if(user_id){
                const user = await fetchUser(user_id)
                if(user && user instanceof GuildMember){
                    if(user.roles.cache.has(Roles.VOTE_SUPPORTER)){
                        await user.roles.remove(Roles.VOTE_SUPPORTER)
                    }
                }
            }
        })
    })

    cron.schedule('0 0 1 * *', () => {
        db.all('SELECT * FROM votes ORDER BY count DESC LIMIT 10', async (err, rows) => {
            if(!err){
                const channel = server.channels.cache.get('745226161231102013')
                if(channel){
                    let i = 0

                    const fixedDate = new Date()
                    fixedDate.setDate(fixedDate.getDate() - 7)

                    const embed = new MessageEmbed()
                        .setAuthor(`📋 ${findTurkishMonthName(fixedDate.getMonth())} Ayı Oy Sıralaması`, URLMap.ASENA_PP_URL)
                        .setTimestamp()
                        .setColor('GOLD')
                        .addField('Bu Ay En Çok Oy Veren Kullanıcılar', rows.map(row => {
                            return ++i === 1
                                ?
                                `**#${i} | <@${row.user_id}> Oy: \`${row.count}\`**`
                                :
                                `#${i} | <@${row.user_id}> Oy: \`${row.count}\``
                        }))

                    await channel.send('Oy verip bizi destekleyen herkese teşekkür ederiz.', {
                        embed
                    })
                    db.run('DELETE FROM votes')
                }
            }
        })
    })

}
