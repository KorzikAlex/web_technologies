/**
 * @file posts-page.ts
 * @fileoverview Роут для отдачи собранной клиентской страницы новостей
 */
import express, { type Router } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const router: Router = express.Router();

router.get('/:id', (req, res) => {
    const filePath = path.join(__dirname, '..', '..', '..', 'dist', 'client', 'webpack', 'posts.html');
    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(500).send('Error sending posts page');
        }
    });
});

export default router;