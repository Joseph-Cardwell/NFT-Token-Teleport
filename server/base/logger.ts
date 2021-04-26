var winston = require("winston");
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