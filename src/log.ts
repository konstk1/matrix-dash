import * as winston from 'winston';

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
        new winston.transports.File({ filename: 'log.txt' }),
        // new winston.transports.File({ filename: 'error.log', level: 'error' }),
    ],
});

log.info('Starting Winston logger...');

