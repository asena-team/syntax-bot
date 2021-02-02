const redis = require('redis')
const publisher = redis.createClient()

publisher.on('connect', () => console.log('Yayımcı, Redis veritabanına bağlandı.'))
publisher.config('SET', 'notify-keyspace-events', 'Kx')
const subscriber = redis.createClient()

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
