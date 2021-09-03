const isValidSnowflake = s => /^(\d{17,19})$/ig.test((s || "").trim())

const parseArgs = async message => {
    const args = message.content.split(' ')
    for(let i = 0; i < args.length; i++){
        const arg = args[i]
        if(arg === '--payload' || arg === '-p'){
            delete args[i]
            await message.channel.send('Payload:\n```json\n' + JSON.stringify(message, null, 2) + '```')
            break
        }
    }

    return args.filter(Boolean)
}

module.exports = {
    isValidSnowflake,
    parseArgs
}
