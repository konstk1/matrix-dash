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
        new winston.transports.File({ 
            filename: 'logs/all.log',
            options: { flags: 'w' }, // overwrite log file on start 
        }),
        new winston.transports.File({
            filename: 'logs/warn.log', 
            level: 'warn',
            options: { flags: 'w' }, // overwrite log file on start 
        }),
    ],
});

log.info('Starting Winston logger...');

