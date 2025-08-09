import express from 'express';
import { startGame, hit, stand } from '../logic/blackjack';

const router = express.Router();

router.get("/start", startGame);

router.get("/hit", hit);

router.get("/stand", stand);

export default router;