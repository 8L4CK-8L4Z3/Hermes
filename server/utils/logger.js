import winston from 'winston';
import 'winston-daily-rotate-file';

const formatObject = (obj) => {
    return JSON.stringify(obj, null, 2);
};

const colorize = {
    green: (text) => `\x1b[32m${text}\x1b[0m`,
    yellow: (text) => `\x1b[33m${text}\x1b[0m`,
    red: (text) => `\x1b[31m${text}\x1b[0m`,
    blue: (text) => `\x1b[34m${text}\x1b[0m`,
    magenta: (text) => `\x1b[35m${text}\x1b[0m`,
    cyan: (text) => `\x1b[36m${text}\x1b[0m`,
};

const getStatusColor = (status) => {
    if (status >= 500) return colorize.red;
    if (status >= 400) return colorize.yellow;
    if (status >= 300) return colorize.cyan;
    if (status >= 200) return colorize.green;
    return colorize.blue;
};

// Create Winston logger
export const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.DailyRotateFile({
            filename: 'logs/error-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            maxFiles: '14d'
        }),
        new winston.transports.DailyRotateFile({
            filename: 'logs/combined-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxFiles: '14d'
        })
    ]
});

// Add console transport in development
if (process.env.NODE_ENV === 'development') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

// Request logger middleware
const requestLogger = (isDev = false) => (req, res, next) => {
    const start = Date.now();
    
    if (isDev) {
        // Log request details
        console.log('\n' + colorize.magenta('🔸 Request:'));
        console.log(colorize.blue('URL:'), `${req.method} ${req.url}`);
        console.log(colorize.blue('Headers:'), '\n' + formatObject(req.headers));
        
        // Safely check query parameters
        if (req.query && Object.keys(req.query).length > 0) {
            console.log(colorize.blue('Query Parameters:'), '\n' + formatObject(req.query));
        }
        
        // Safely check request body
        if (req.body && Object.keys(req.body).length > 0) {
            // Mask sensitive data
            const sanitizedBody = { ...req.body };
            if (sanitizedBody.password) sanitizedBody.password = '********';
            if (sanitizedBody.password_hash) sanitizedBody.password_hash = '********';
            console.log(colorize.blue('Body:'), '\n' + formatObject(sanitizedBody));
        }
    }

    // Capture the original response methods
    const originalJson = res.json;
    const originalSend = res.send;

    // Override response methods to log the response
    res.json = function (body) {
        if (isDev) {
            console.log(colorize.magenta('\n🔸 Response:'));
            console.log(colorize.blue('Body:'), '\n' + formatObject(body));
        }
        return originalJson.call(this, body);
    };

    res.send = function (body) {
        if (isDev) {
            console.log(colorize.magenta('\n🔸 Response:'));
            console.log(colorize.blue('Body:'), '\n' + (typeof body === 'string' ? body : formatObject(body)));
        }
        return originalSend.call(this, body);
    };

    // Log when the response is finished
    res.on('finish', () => {
        const duration = Date.now() - start;
        const statusColor = getStatusColor(res.statusCode);
        const logMessage = `${req.method} ${req.url} ${statusColor(res.statusCode)} ${duration}ms`;
        
        if (isDev) {
            console.log(colorize.magenta('\n🔸 Request completed:'));
            console.log(logMessage);
            console.log('─'.repeat(50) + '\n');
        } else {
            logger.info(logMessage);
        }
    });

    next();
};

export default requestLogger; 