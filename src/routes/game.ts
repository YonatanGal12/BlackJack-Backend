import express from 'express';
import { startGame, hit, stand } from '../logic/blackjack';
import { checkGameOver } from '../Middleware/checkGameOver';
const router = express.Router();

router.get("/start", startGame);

router.get("/hit", checkGameOver, hit);

router.get("/stand", checkGameOver, stand);

export default router;