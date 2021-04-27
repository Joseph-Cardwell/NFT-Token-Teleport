var winston = require("winston");
var azureBlobTransport = require("winston3-azureblob-transport");
import {CONSOLE_LOG_ON} from '../../config';

//**************************************************************************************************
class Logger
{
	private winstonLogger;
	private logDate;
	//==============================================================================================
	constructor() 
	{
		this.winstonLogger = null;
		this.logDate = new Date(Date.now());
		
		this._init();
	}
	//==============================================================================================
	public log(...args)
	{
		this._update();
	
		if(this.winstonLogger !== null)
		{
			this.winstonLogger.info(args);
		}
	}
	//==============================================================================================
	public warning(...args)
	{
		this._update();
	
		if(this.winstonLogger !== null)
		{
			this.winstonLogger.warn(args);
		}
	}
	//==============================================================================================
	public error(...args)
	{
		this._update();
	
		if(this.winstonLogger !== null)
		{
			this.winstonLogger.error(args);
		}
	}
	//==============================================================================================
	private _nextHour(): boolean
	{
		const date = new Date(Date.now());

		return this.logDate.getDate() !== date.getDate() 
			|| this.logDate.getMonth() !== date.getMonth() 
			|| this.logDate.getFullYear() !== date.getFullYear()
			|| this.logDate !== date.getHours();
	}
	//==============================================================================================
	private _update()
	{
		if(this._nextHour())
		{
			this._init();
		}
	}
	//==============================================================================================
	private _init()
	{
		const transports = [];

        if("AZURE_STORAGE_ACCOUNT_NAME" in process.env
            && "AZURE_STORAGE_ACCOUNT_KEY" in process.env
            && "AZURE_STORAGE_CONTAINER_NAME" in process.env
            && "AZURE_STORAGE_BLOB_NAME" in process.env)
        {
            const date = new Date(Date.now());

            const transportBlob = new (azureBlobTransport)
            ({
                account:
                {
                    name: (process.env.AZURE_STORAGE_ACCOUNT_NAME).toLowerCase(),
                    key: process.env.AZURE_STORAGE_ACCOUNT_KEY
                },
                containerName:((process.env.AZURE_STORAGE_CONTAINER_NAME).toLowerCase()),
                blobName: `${date.getFullYear()}`
                            + `_${Number(date.getMonth())+Number(1)}`
                            + `_${date.getDate()}/${(process.env.AZURE_STORAGE_BLOB_NAME).toLowerCase()}`
                            + `_${date.getFullYear()}`
                            + `_${Number(date.getMonth())+Number(1)}`
                            + `_${date.getDate()}`
                            + `_${date.getHours()}`
                            + `_.log`,
                level: "info",
                bufferLogSize : 250,
                syncTimeout : 10 * 1000,
                rotatePeriod : "",
                eol : "\n",
                format: winston.format.combine
                (
                    winston.format.simple(),
                    winston.format.timestamp({format: 'DD-MM-YYYY HH:mm:ss.SSS'}),
                    winston.format.printf(msg => `[${msg.timestamp}] [${msg.level}] ${msg.message}`)
                )
            })
            transports.push(transportBlob);
        }

		if(CONSOLE_LOG_ON)
		{
			const transportConsole = new winston.transports.Console
			({
				level: "info",
				format: winston.format.combine
				(
					winston.format.simple(),
					winston.format.colorize({all:true}),
					winston.format.timestamp({format:'DD-MM-YYYY HH:mm:ss.SSS'}),
					winston.format.printf(msg => `[${msg.timestamp}] [${msg.level}] ${msg.message}`)
				)
			});

			transports.push(transportConsole);
		}

		if(transports.length > 0)
		{
			this.winstonLogger =new winston.createLogger({transports: transports});
		}
	}
}

export const logger = new Logger();