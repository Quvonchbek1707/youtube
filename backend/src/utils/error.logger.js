import fs from "fs"

export default async (error, req, res, next) => {
    if (error.status && error.status < 500) {
        return res.status(error.status).json({
            status: error.status,
            message: error.message,
            name: error.name
        })

    } else {
        let errorText = `\n[${new Date()}]---[${req.method}] --- ${req.url} === ${error}`
        try {
            fs.appendFileSync(join(process.cwd(), "src", "log", "logger.txt"), errorText)
        } catch (e) {
        }
        return res.status(500).json({
            status: 500,
            message: "INTERNALSERVERERROR",
            error: error.message
        })
    }

}