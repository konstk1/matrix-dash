import * as winston from 'winston'
import * as fs from 'fs'

// Create logs directory if it does not exist
const logDir = 'logs'
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir)
}

export const log: winston.Logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss.SSS'
        }),
        winston.format.colorize({}),
        winston.format.splat(),
        winston.format.printf(msg => `${msg.timestamp} ${msg.level}: ${msg.message}`),
    ),
    level: 'silly',
    transports: [
        new winston.transports.Console({}),
        new winston.transports.File({
            filename: 'all.log',
            dirname: logDir,
            level: 'info',
            options: { flags: 'w' }, // overwrite log file on start 
        }),
        new winston.transports.File({
            filename: 'warn.log',
            dirname: logDir, 
            level: 'warn',
            options: { flags: 'w' }, // overwrite log file on start 
        }),
    ],
    exitOnError: false,
});

log.info('Starting Winston logger...')

