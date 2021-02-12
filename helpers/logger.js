var winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    defaultMeta: { service: 'webapi' },
    transports: [
      //
      // - Write all logs with level `error` and below to `error.log`
      // - Write all logs with level `info` and below to `combined.log`
      //
    //   new winston.transports.File({ 
    //         filename: './logs/errors.log', 
    //         level: 'error', 
    //         timestamp: true,
    //         maxsize: 5242880, //5MB
    //         maxFiles: 5}),
      new winston.transports.File({ 
          filename: 'logs/api.log', 
          timestamp:true,
          maxsize: 5242880, //5MB
          maxFiles: 5 }),
    //   new winston.transports.File({ 
    //       filename: './logs/debug.log', 
    //       level: 'debug', 
    //       timestamp:true,
    //       maxsize: 5242880, //5MB
    //       maxFiles: 5 }),

    ],
  });


module.exports = logger;
