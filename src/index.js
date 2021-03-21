const {
    Client,
    MessageEmbed
} = require('discord.js')
const {
    Roles,
    Prefixes,
    WikiMap,
    QuestionMap,
    URLMap
} = require('./Constants')
const dotenv = require('dotenv')
const db = require('./drivers/SQLite3')

dotenv.config({
    path: `${__dirname}/../.env`
})

const run = async () => {
    const client = new Client({
        fetchAllMembers: true,
        ws: {
            intents: [
                'GUILDS',
                'GUILD_MEMBERS',
                'GUILD_WEBHOOKS',
                'GUILD_INVITES',
                'GUILD_PRESENCES',
                'GUILD_MESSAGES'
            ]
        }
    })
    await client.login(process.env.TOKEN).then(() => console.log(`${client.user.username} olarak giriş yapıldı.`))

    const syntax = client.guilds.cache.get(process.env.SYNTAX_SERVER_ID)
    if(!syntax){
        console.log(`Sunucu bulunamadı. Bot kapatılıyor.`)
        process.exit(0)
    }

    // Run service
    require('./services/Vote')(
        client,
        syntax,
        db
    )

    let numberOfUser = (await syntax.members.fetch()).size

    const fetchInvites = await syntax.fetchInvites()
    const invites = Array.from(fetchInvites.keys())

    if(syntax.vanityURLCode){
        invites.push(syntax.vanityURLCode)
    }

    const setActivity = async () => {
        await client.user.setActivity(`${numberOfUser} Kullanıcı`, {
            type: 'WATCHING'
        })
    }

    await Promise.all([
        client.user.setStatus('online'),
        setActivity()
    ])

    client.on('inviteCreate', invite => {
        invites.push(invite.code)
    })

    client.on('inviteDelete', invite => {
        delete invites[invite.code]
    })

    client.on('presenceUpdate', async (_, presence) => {
        const user = presence.member
        if(user){
            const activities = presence.activities
            if(activities.length === 0){
                if(user.roles.cache.has(Roles.STATUS_SUPPORTER)){
                    await user.roles.remove(Roles.STATUS_SUPPORTER)
                }
            }else{
                const filter = activities.filter(activity => {
                    if(activity.state){
                        const filter = invites.filter(code => {
                            const regex = new RegExp(`discord.gg/${code}`, 'i')
                            return regex.test(activity.state)
                        })

                        return filter.length > 0
                    }
                })
                if(user.roles.cache.has(Roles.STATUS_SUPPORTER)){
                    if(filter.length === 0){
                        await user.roles.remove(Roles.STATUS_SUPPORTER)
                    }
                }else{
                    if(filter.length !== 0){
                        await user.roles.add(Roles.STATUS_SUPPORTER)
                    }
                }
            }
        }
    })

    client.on('guildMemberAdd', async () => {
        numberOfUser++
        await setActivity()
    })

    client.on('guildMemberRemove', async () => {
        numberOfUser--
        await setActivity()
    })

    // SSS Message Find Callback
    client.on('message', async message => {
        const content = message.content
        if(content.startsWith(Prefixes.SSS)){ // SSS
            const search = Object.keys(QuestionMap).filter(key => {
                const regex = new RegExp(`${content.substr(Prefixes.SSS.length, content.length).trim().toLowerCase()}`)

                return regex.test(key)
            })

            if(search.length !== 0){
                const question_data = QuestionMap[search.shift()]
                if(question_data && message.channel.type === 'text'){
                    await Promise.all([
                        message.channel.send([
                            `Q: **${question_data.Q}**`,
                            `A: ${question_data.A}`
                        ]),
                        message.delete({ timeout: 1 })
                    ])
                }
            }
        }else if(message.content === 'top'){ // Top Voters
            db.all('SELECT * FROM votes ORDER BY count DESC LIMIT 10', (err, rows) => {
                let text = ''
                if(rows.length === 0){
                    text = [
                        'Henüz kimse oy vermemiş.',
                        `[İlk veren olmak için tıkla.](${URLMap.TOP_GG_VOTE_URL})`
                    ]
                }else{
                    let i = 1
                    for(const row of rows){
                        text += message.author.id === row.user_id
                            ?
                            `**#${i} | <@${row.user_id}> Oy: \`${row.count}\`\n**`
                            :
                            `#${i} | <@${row.user_id}> Oy: \`${row.count}\`\n`
                        i++
                    }
                }

                const embed = new MessageEmbed()
                    .setAuthor('📋 Sunucu Oy Sıralaması', message.author.avatarURL() || message.author.defaultAvatarURL)
                    .setTimestamp()
                    .setColor('GOLD')
                    .addField('En Çok Oy Veren Kullanıcılar', text)

                message.channel.send({ embed })
            })
        }else if(content.startsWith(Prefixes.Wiki)){ // Wiki
            const args = content.split(' ')
            const cmd = args[1]
            let url = URLMap.WIKI_URL
            if(WikiMap.Commands.includes(cmd)){
                url += `/docs/commands/${cmd}`
            }

            await Promise.all([
                message.channel.send(url),
                message.delete()
            ])
        }else if(content.startsWith(Prefixes.Shortcuts)){ // Custom Commands
            let text, options
            switch(content.substr(Prefixes.Shortcuts.length, content.length).trim().toLowerCase()){
                case 'davet':
                case 'invite':
                    text = '**Sunucu Davet:** https://discord.gg/CRgXhfs'
                    break

                case 'website':
                case 'site':
                    text = '**Asena Website**: https://asena.xyz'
                    break

                case 'kod':
                case 'code':
                    text = 'Kod paylaşım bloğu nasıl yapılır?'
                    options = {
                        files: [
                            'https://cdn.discordapp.com/attachments/729930836857716747/765936916952383499/lang.PNG'
                        ]
                    }
                    break

                case 'github':
                case 'star':
                    text = [
                        '**Asena** \'nın kaynak kodlarına ulaşmak için: https://github.com/anilmisirlioglu/Asena',
                        '**NOT:** Sağ üst köşeden projeye `star` (:star:) vermeyi unutmayın <:AsenaLogo:764464729283493908>'
                    ]
                    break

                case 'vote':
                case 'oy':
                    text = 'Botumuzu destekleyip oy vermek için: https://top.gg/bot/716259870910840832'
                    break
            }

            if(text){
                await Promise.all([
                    message.channel.send(text, options),
                    message.delete({ timeout: 1 })
                ])
            }
        }
    })
}

setTimeout(run, 100)
