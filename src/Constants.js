const QuestionStore = [
    {
        Q: 'Neden bizi tercih etmelisiniz?',
        A: 'Çok basit. Çünkü neden olmasın?'
    },
    {
        Q: 'Sunucunuzda ki botlar ne işe yarıyor?',
        A: 'Asena herkese açık tek botumuzdur. *(Detaylı bilgi için https://asena.xyz/ adresini ziyaret edebilirsiniz.)* Onun dışında ki botlar da sizi ilgilendiren herhangi bir şey bulunmuyor.'
    },
    {
        Q: 'Sunucuma botu ekledim fakat görünmüyor/çalışmıyor?',
        A: 'Botun çalışmaması veya eklenip görünmemesi gibi bir durum söz konusu değil. Kayıt kanalınız bulunuyorsa bot orada kalmış olabilir veya guard botunuz mevcutsa, guard botunuz tarafınızdan banlanmış olabilir. Eğer bot ban yemediyse botu sunucunun üyeler kısmında arayın. Botun izinlerini kontrol edin ve komutları doğru şekilde kullandığınızdan emin olun.'
    },
    {
        Q: 'Bu sunucunun amacı ne?',
        A: 'Sunucunun temel amacı Asena hakkında destek vermek ama yazılım gibi konularda da insanlara yardım ediyoruz. *Evet çok yardım severiz.*'
    },
    {
        Q: 'Yazılım ekibinize nasıl girebilirim?',
        A: 'Giremezsin.'
    },
    {
        Q: 'Sunucu masraflarını nasıl karşılıyorsunuz?',
        A: 'Bot tüm özellikleriyle tamamen ücretsiz olarak sunuluyor ve tüm masrafları tamamen kendi cebimizden karşılıyoruz. Bu durum ilerde bize sorun yaratmaya başlayacaktır bu sebepten ileride Premium gibi özellikler gelebilir. *Gelme yedebilir*'
    },
    {
        Q: 'Yöneticiler?!?',
        A: 'Gerekmedikçe yöneticileri etiketlemeyin. Amacınız yardım almak ise önceliğiniz moderatörlerdir. *Çünkü onların işi bu.*'
    },
    {
        Q: 'Botunuza oy verdim ödülüm nerede?',
        A: 'Her şeyden bir karşılık beklemeyin :blush:'
    },
    {
        Q: 'Bot neden Open Source? Kodlarını indirip kendim ürün ortamına alamaz mıyım?',
        A: 'Hayır bunu yapmamalısın. Botun Open Source olmasının amacı hizmet alanı dışında herhangi bir kod içermediğini göstermek, Dünya ‘daki bir çok geliştirici gibi Open Source kültürüne katkı sağlamak ve diğer geliştiricilerin bot hakkın da ki yazılım ve mimarisi hakkında ki soruları yanıtlamaktır. *Eğer bunu yapmaya çalışırsanız build edilmesi, çalıştırılması, environment dosyaları ve bilişim altyapısı hakkında en ufak bir yardım bile yapılmayacaktır. Bunun tespiti durumunda GitHub üzerinde sunulan repodan ve destek sunucusundan ban yersiniz.*'
    }
]

module.exports = {
    Roles: {
        STATUS_SUPPORTER: '744236569363218552',
        VOTE_SUPPORTER: '766789436997500950'
    },

    Prefixes: {
        SSS: 'sss',
        Shortcuts: '-'
    },

    DATABASES_DIR: './databases',

    URLMap: {
        TOP_GG_VOTE_URL: 'https://top.gg/bot/716259870910840832/vote',
        ASENA_PP_URL: 'https://cdn.discordapp.com/avatars/716259870910840832/cec4e60b4816baee503a4aee87a4517c.png',
        ANONYMOUS_PP_URL: 'https://cdn.discordapp.com/attachments/729930836857716747/766784877667811378/unknown.png'
    },

    QuestionMap: {
        '1': QuestionStore[0],
        'neden': QuestionStore[0],
        'neden biz': QuestionStore[0],
        '2': QuestionStore[1],
        'botlar': QuestionStore[1],
        'bot': QuestionStore[1],
        '3': QuestionStore[2],
        'bot yok': QuestionStore[2],
        '4': QuestionStore[3],
        'sunucu': QuestionStore[3],
        '5': QuestionStore[4],
        'yazılım': QuestionStore[4],
        'software': QuestionStore[4],
        'team': QuestionStore[4],
        '6': QuestionStore[5],
        'masraflar': QuestionStore[5],
        'sunucu masrafları': QuestionStore[5],
        '7': QuestionStore[6],
        'yöneticiler': QuestionStore[6],
        'admin': QuestionStore[6],
        '8': QuestionStore[7],
        'oy': QuestionStore[7],
        'vote': QuestionStore[7],
        '9': QuestionStore[8],
        'open source': QuestionStore[8],
        'github': QuestionStore[8]
    }
}
