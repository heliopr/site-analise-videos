module.exports = (f) => {
    return async (req, res) => {
        try {
            await f(req, res)
        }
        catch (e) {
            res.status(400).json({ sucesso: false, mensagem: "Um erro inesperado ocorreu" })
            if (config.mostrarErros) console.log(e)
        }
    }
}