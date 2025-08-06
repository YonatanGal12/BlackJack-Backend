import express from 'express';
import { startGame } from '../logic/blackjack';

const router = express.Router();

router.get("/start", startGame);

export default router;