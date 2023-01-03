import express, { Request, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import bodyParser from 'body-parser';
import { body, query, ValidationError, validationResult } from 'express-validator';

import HARService, { CaptureOptions, ResourceUnreachableException } from './har';
import { PuppeteerLifeCycleEvent } from 'puppeteer';

export interface GetRequestBody {
    url: string;
    timeout?: number;
    waitUntil?: PuppeteerLifeCycleEvent;
}
export interface PostRequestBody {
    url: string;
    headers?: string[];
    timeout?: number;
    waitUntil?: PuppeteerLifeCycleEvent;
}

export default function serve(port: number, harService: HARService): void {
    const app = express();

    app.get('/har',
        query('url').isURL(),
        query('timeout').isInt({ min: 1, max: 60000 }).optional(),
        query('waitUntil').isString().isIn(['load', 'domcontentloaded', 'networkidle0', 'networkidle2']).optional(),
        async (req: Request<ParamsDictionary, unknown, unknown, GetRequestBody>, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return validationError(res, errors.array());
            }

            try {
                const { url, timeout, waitUntil } = req.query;

                const captureOptions: CaptureOptions = {};

                if (timeout) {
                    captureOptions.timeout = timeout;
                }

                if (waitUntil) {
                    captureOptions.waitUntil = waitUntil;
                }

                const har = await harService.captureWebpage(url);
                res.status(200).json(har);
            } catch(e) {
                if (e instanceof ResourceUnreachableException) {
                    return respondWithError(res, "Resource unreachable.");
                }

                console.error(`Unexpected error: ${e}`);

                return respondWithError(res, "Internal server error", 500);
            }
        }
    );

    app.post('/har',
        bodyParser.json(),
        body('url').isURL(),
        body('headers').isArray().optional(),
        body('headers.*').isString(),
        body('timeout').isInt({ min: 1, max: 60000 }).optional(),
        body('waitUntil').isString().isIn(['load', 'domcontentloaded', 'networkidle0', 'networkidle2']).optional(),
        async (req: Request<ParamsDictionary, unknown, PostRequestBody>, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return validationError(res, errors.array());
            }

            const { url, headers, timeout, waitUntil } = req.body;

            try {
                const captureOptions: CaptureOptions = {};
                if (headers && Array.isArray(headers)) {
                    captureOptions.request = {
                        headers: headers
                    };
                }

                if (timeout) {
                    captureOptions.timeout = timeout;
                }

                if (waitUntil) {
                    captureOptions.waitUntil = waitUntil;
                }

                const har = await harService.captureWebpage(url, captureOptions);
                res.status(200).json(har);
            } catch(e) {
                if (e instanceof ResourceUnreachableException) {
                    return respondWithError(res, "Resource unreachable.");
                }

                console.error(`Unexpected error: ${e}`);

                return respondWithError(res, "Internal server error", 500);
            }
        }
    );

    app.listen(port, () => {
        console.log(`Listening on ${port}`);
    });
}

function validationError(res: Response, errors: ValidationError[]): void {
    respondWithError(res, formatValidationErrors(errors), 400);
}

function respondWithError(res: Response, message: string | object, statusCode = 422): void {
    const responsePayload = typeof message === 'object' ?
        message :
        {
            message
        };

    res.status(statusCode)
        .json(responsePayload);
}

function formatValidationErrors(errors: ValidationError[]): string {
    return errors
        .map(({ msg, param }) => `${param}: ${msg}`)
        .join(', ');
}
