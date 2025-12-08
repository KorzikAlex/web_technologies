/**
 * @file friends.ts
 * @fileoverview Роут для отдачи собранной клиентской страницы друзей
 */
import express, { type Router } from 'express';
import path from 'node:path';
import { staticPath } from '../server';

export const router: Router = express.Router();

router.get('/:id', (req, res) => {
    const filePath = path.join(staticPath, 'friends.html');
    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(500).send('Error sending friends page');
        }
    });
});

export default router;
