import express from 'express';
import obtainHAR from './har';
import { isValidUrl } from './util';

export default function serve(port: number): void {
    const app = express();

    app.get('/har', async (req, res) => {
        const url = req.query.url;
        if (!url || typeof url !== "string" || !isValidUrl(url)) {
            res.status(400).json({ error: "Missing URL parameter" });
            return;
        }

        const har = await obtainHAR(url);

        res.status(200).json(har);
    });

    app.listen(port, () => {
        console.log(`Listening on ${port}`);
    });
}
