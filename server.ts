import 'zone.js/dist/zone-node';

require('dotenv').config();
import express from 'express';
import { join } from 'path';
import cookieParser from 'cookie-parser';
import apiRouter from './server/api/router_api';
import { init } from './server/init';

export function app(): express.Express
{
    const server = express();
    const distFolder = join(process.cwd(), 'dist/scotty-beam-app/browser');

    server.use(express.json());
    server.use(cookieParser());

    server.use((req, res, next) =>
    {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, PATCH, PUT, POST, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    });

    server.options('*', (req, res) => {
        // allowed XHR methods
        res.header('Access-Control-Allow-Methods', 'GET, PATCH, PUT, POST, DELETE, OPTIONS');
        res.send();
    });

    server.use('/api', apiRouter);

    server.get('*.*', express.static(distFolder, {
        maxAge: '1y'
    }));

    server.get('*', function (req, res)
    {
        res.sendFile(distFolder + '/index.html');
    });

    return server;
}

async function run()
{
    const port = process.env.PORT || 4000;

    // Start up the Node server
    const server = app();

    await init();

    server.listen(port, () =>
    {
        console.log(`Node Express server listening on http://localhost:${port}`);
    });
}

run();
