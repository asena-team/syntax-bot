const {
    Client,
    MessageEmbed,
    Message
} = require('discord.js')
const {
    Roles,
    Prefixes,
    WikiMap,
    QuestionMap,
    URLMap,
    Greetings,
    Channels
} = require('./Constants')
const dotenv = require('dotenv')
const db = require('./drivers/SQLite3')
require('./api/ExtendedAPIMessage')
const { isValidSnowflake, parseArgs, isAuthorizedRole} = require('./utils/Utils');

dotenv.config({
    path: `${__dirname}/../.env`
})

const run = async () => {
    const client = new Client({
        repliedUser: true,
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

    // Prefix Detect Callback
    client.on('message', async message => {
        const args = await parseArgs(message)
        const content = args.join(' ')
        const arg0 = (args[0] || "").trim()
        switch(arg0){
            case Prefixes.SSS:
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
                break

            case 'top':
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
                break

            case 'run':
                const cmdArgs = args.slice(1, args.length)
                switch(cmdArgs[0]){
                    case 'ast':
                        if(!isAuthorizedRole(message.member.roles)){
                            await message.channel.send('Bu komut kullanmak için yetkiniz yok.')
                            break
                        }

                        if(cmdArgs.length < 3){
                            await message.channel.send('**Kullanımı:** run ast <add | kick> [user id]')
                            break
                        }

                        const [, transaction, userId] = cmdArgs
                        if(!isValidSnowflake(userId)){
                            await message.channel.send('Lütfen geçerli bir **Üye ID**\'si girin.')
                            break
                        }

                        const member = message.guild.members.cache.get(userId)
                        if(!member){
                            await message.channel.send('Üye bulunamadı.')
                            break
                        }

                        switch(transaction){
                            case 'add':
                                if(member.roles.cache.has(Roles.SUPPORT_TEAM)){
                                    await message.channel.send('Bu üye zaten destek ekibinde.')
                                    break
                                }

                                member.roles.add(Roles.SUPPORT_TEAM).then(async() => {
                                    message.channel.send(`${member}, destek ekibine başarıyla eklendi.`)
                                    member.createDM().then(dm => {
                                        dm.send([
                                            '**Asena** Destek Ekibine hoşgeldin! 🎉',
                                            `**-** Asena hakkında bilmediğin bir çok şeyi buradan bulabilirsin: ${URLMap.WIKI_URL}`,
                                            '**-** Ekip hakkındaki güncellemeleri kaçırmamak için **#moderatör-duyuru** kanalına göz atmayı unutma.'
                                        ])
                                    })
                                })
                                break

                            case 'kick':
                                if(!member.roles.cache.has(Roles.SUPPORT_TEAM)){
                                    await message.channel.send('Bu üye zaten destek ekibinde değil.')
                                    break
                                }

                                member.roles.remove(Roles.SUPPORT_TEAM).then(() => {
                                    message.channel.send(`${member}, destek ekibinden başarıyla çıkarıldı.`)
                                    member.createDM().then(dm => {
                                        dm.send([
                                            '**Asena** ekibine zaman ayırdığın ve bugüne kadar verdiğin destekler için teşekkür ederiz. En yakın zamanda seni tekrar aramızda görebilmek dileğiyle hoşçakal.',
                                            `**İşlemi Yapan Yetkili:** ${message.member}`
                                        ])
                                    })
                                })
                                break
                        }
                        break

                    default:
                        await message.channel.send('Komut bulunamadı.')
                        break
                }
                break

            case Prefixes.Wiki:
                const cmd = args[1]
                let url = URLMap.WIKI_URL
                if(WikiMap.Commands.includes(cmd)){
                    url += `/docs/commands/${cmd}`
                }

                const answer = `Lütfen buraya göz atın: ${url}`
                const messageId = args[2]
                if(messageId && isValidSnowflake(messageId)){
                    message.channel.messages.fetch(messageId).then(message => {
                        if(message instanceof Message){
                            message.inlineReply(answer)
                        }
                    }).catch(void 0)
                }else{
                    message.channel.send(answer)
                }

                await message.delete()
                break

            default:
                if(!content.startsWith(Prefixes.Shortcuts)){
                    if(Greetings.includes(content.toLowerCase())){
                        message.inlineReply([
                            `Merhaba, **Asena Destek** sunucusuna hoşgeldiniz!`,
                            `**>** Bot hakkında yardıma ihtiyacınız varsa ${message.channel.id !== Channels.SUPPORT_CHANNEL ? `<#${Channels.SUPPORT_CHANNEL}> kanalına,` : ''} sorununuz hakkında detaylı bilgi yazarak **Destek Ekibimizi** etiketlemekten çekinmeyin.`,
                            `**>** Bot hakkında detaylı döküman: ${URLMap.WIKI_URL}`,
                            `**>** Bize oy verin: ${URLMap.TOP_GG_VOTE_URL}`
                        ]).then(message => message.suppressEmbeds())
                    }
                    break
                }

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
                break
        }
    })
}

setTimeout(run, 100)
