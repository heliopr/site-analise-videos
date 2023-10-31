module.exports = (f) => {
    return (req, res) => {
        try {
            f(req, res)
        }
        catch (e) {
            res.status(400).json({ sucesso: false, mensagem: "Um erro inesperado ocorreu" })
            if (config.mostrarErros) console.log(e)
        }
    }
}