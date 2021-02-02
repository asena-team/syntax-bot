const MONTH_ARRAY = [
    'Ocak', 'Şubat', 'Mart',
    'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül',
    'Ekim', 'Kasım', 'Aralık'
]

module.exports = {
    findTurkishMonthName: (month) => {
        return MONTH_ARRAY[month] || 'Bilinmeyen'
    }
}
