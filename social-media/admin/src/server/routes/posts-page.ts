/**
 * @file posts-page.ts
 * @fileoverview Роут для отдачи собранной клиентской страницы новостей
 */
import express, { type Router } from 'express';
import path from 'node:path';
import { staticPath } from '../server';

export const router: Router = express.Router();

router.get('/:id', (req, res) => {
    const filePath = path.join(staticPath, 'posts.html');
    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(500).send('Error sending posts page');
        }
    });
});

export default router;