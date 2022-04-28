import express, { Request, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import bodyParser from 'body-parser';
import { body, query } from 'express-validator';

import HARService, { CaptureOptions, ResourceUnreachableException } from './har';

export interface GetRequestBody {
    url: string;
}
export interface PostRequestBody {
    url: string;
    headers?: string[];
}

export default function serve(port: number, harService: HARService): void {
    const app = express();

    app.get('/har',
        query('url').isURL(),
        async (req: Request<ParamsDictionary, unknown, unknown, GetRequestBody>, res) => {
            const url = req.query.url;

            try {
                const har = await harService.captureWebpage(url);
                res.status(200).json(har);
            } catch(e) {
                if (e instanceof ResourceUnreachableException) {
                    return respondWithError(res, "Resource unreachable.");
                }

                return respondWithError(res, "Internal server error", 500);
            }
        }
    );

    app.post('/har',
        bodyParser.json(),
        body('url').isURL(),
        body('headers').isArray().optional(),
        body('headers.*').isString(),
        async (req: Request<ParamsDictionary, unknown, PostRequestBody>, res) => {
            const { url, headers } = req.body;

            try {
                const captureOptions: CaptureOptions = {};
                if (headers && Array.isArray(headers)) {
                    captureOptions.request = {
                        headers: headers
                    };
                }

                const har = await harService.captureWebpage(url, captureOptions);
                res.status(200).json(har);
            } catch(e) {
                if (e instanceof ResourceUnreachableException) {
                    return respondWithError(res, "Resource unreachable.");
                }

                return respondWithError(res, "Internal server error", 500);
            }
        }
    );

    app.listen(port, () => {
        console.log(`Listening on ${port}`);
    });
}

function respondWithError(res: Response, message: string, statusCode = 422): void {
    res.status(statusCode)
        .json({
            message
        });
}
