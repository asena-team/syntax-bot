const isValidSnowflake = s => /^(\d{17,19})$/ig.test((s || "").trim())

module.exports = {
    isValidSnowflake
}
