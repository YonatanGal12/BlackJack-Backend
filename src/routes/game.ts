import express from 'express';
import { startGame, hit, stand, double } from '../logic/blackjack';
import { checkGameOver } from '../middleware/checkGameOver';
const router = express.Router();

router.get("/start", startGame);

router.get("/hit", checkGameOver, hit);

router.get("/stand", checkGameOver, stand);

router.get("/double",checkGameOver, double);

export default router;