const redis = require('redis')
const createRedisClient = () => {
    return redis.createClient({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD
    })
}

const publisher = createRedisClient()
publisher.on('connect', () => console.log('Yayımcı, Redis veritabanına bağlandı.'))
publisher.config('SET', 'notify-keyspace-events', 'Kx')

const subscriber = createRedisClient()
subscriber.on('connect', () => console.log('Abone, Redis veritabanına bağlandı.'))
subscriber.on('disconnect', () => console.log('Abonenin Redis veritabanı ile bağlantısı kesildi.'))

publisher.on('disconnect', () => {
    console.log('Yayımcının Redis veritabanı ile bağlantısı kesildi.')
    subscriber.quit()
})

module.exports = {
    publisher,
    subscriber
}
