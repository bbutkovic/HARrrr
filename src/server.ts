import express, { Request, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import bodyParser from 'body-parser';
import { body, query, ValidationError, validationResult } from 'express-validator';

import HARService, { CaptureOptions, ResourceUnreachableException } from './har';
import { Duration, LifeCycleEvent, Selector } from './puppeteer';
import { TimeoutError } from 'puppeteer';

export interface GetRequestBody {
    url: string;
    timeout?: number;
}

export interface PostRequestBody {
    url: string;
    headers?: string[];
    timeout?: Duration;
    waitUntil?: LifeCycleEvent;
    waitForSelector?: Selector;
    waitForDuration?: Duration;
}

export default function serve(port: number, harService: HARService): void {
    const app = express();

    app.get('/har',
        query('url').isURL(),
        query('timeout').isInt({ min: 1, max: 60000 }).optional(),
        async (req: Request<ParamsDictionary, unknown, unknown, GetRequestBody>, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return validationError(res, errors.array());
            }

            try {
                const { url, timeout } = req.query;

                const captureOptions: CaptureOptions = {
                    waitUntil: 'networkidle2'
                };

                if (timeout) {
                    captureOptions.timeout = timeout;
                }

                const har = await harService.captureWebpage(url);
                res.status(200).json(har);
            } catch(e) {
                if (e instanceof ResourceUnreachableException) {
                    return respondWithError(res, "Resource unreachable.", 422);
                }

                if (e instanceof TimeoutError) {
                    return respondWithError(res, "Timeout reached.", 400);
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
        body('waitUntil').isString().isIn([
            'load', 'domcontentloaded', 'networkidle0', 'networkidle2'
        ]).optional(),
        body('waitForSelector').custom(waitForSelectorValidation).optional(),
        body('waitForDuration').isInt({ min: 1, max: 60000 }).optional(),
        async (req: Request<ParamsDictionary, unknown, PostRequestBody>, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return validationError(res, errors.array());
            }

            const {
                url,
                headers,
                timeout,
                waitUntil,
                waitForSelector,
                waitForDuration,
            } = req.body;

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

                if (!waitUntil && !waitForSelector && !waitForDuration) {
                    // if no wait options are specified, default to networkidle2
                    captureOptions.waitUntil = 'networkidle2';
                } else {
                    if (waitUntil) {
                        captureOptions.waitUntil = waitUntil;
                    }

                    if (waitForSelector) {
                        captureOptions.waitForSelector = waitForSelector;
                    }

                    if (waitForDuration) {
                        captureOptions.waitForDuration = waitForDuration;
                    }
                }

                const har = await harService.captureWebpage(url, captureOptions);
                res.status(200).json(har);
            } catch(e) {
                if (e instanceof ResourceUnreachableException) {
                    return respondWithError(res, "Resource unreachable.", 422);
                }

                if (e instanceof TimeoutError) {
                    return respondWithError(res, "Timeout reached.", 400);
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function waitForSelectorValidation(value: any): boolean {
    if (typeof value === 'string') {
        return true;
    }

    return typeof value === 'object' &&
        typeof value.selector === 'string' &&
        (typeof value.visible === 'undefined' || typeof value.visible === 'boolean') &&
        (typeof value.hidden === 'undefined' || typeof value.hidden === 'boolean');
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
