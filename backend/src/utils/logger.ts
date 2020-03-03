import * as winston from 'winston'

//https://github.com/winstonjs/winston
export function createLogger(loggerName: string) {
    return winston.createLogger({
        level: 'info',
        format: winston.format.json(),
        defaultMeta: { name: loggerName },
        transports: [
            new winston.transports.Console()
        ]
    })
}
