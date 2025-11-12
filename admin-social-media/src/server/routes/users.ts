import express, {type Router} from 'express';
import {userManager} from "../managers/UserManager.js";
import type {User} from "../models/User.js";

const router: Router = express.Router();

router.get('/:id', async (req, res) => {
    const userId: number = Number(req.params.id);
    const user: User | null = await userManager.getUserById(userId);

    if (!user) {
        return res.status(404).json({message: 'User not found'});
    }
    res.json(user);
});


router.post('/:id', async (req, res) => {
    const userId: number = Number(req.params.id);
    const updates: Partial<User> = req.body;

    try {
        await userManager.updateUser(userId, updates);
        res.json({message: 'User updated successfully'});
    } catch (error) {
        res.status(404).json({message: 'User not found'});
    }
})

router.delete('/:id', async (req, res) => {
    const userId: number = Number(req.params.id);
    const success: boolean = await userManager.deleteUser(userId);

    if (!success) {
        return res.status(404).json({message: 'User not found'});
    }
    res.json({message: 'User deleted successfully'});
});

router.get('/', async (req, res) => {
    const users: User[] = await userManager.getAllUsers();
    res.json(users);
});

export default router;