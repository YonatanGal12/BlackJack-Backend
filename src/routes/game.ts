import express from 'express';
import { startGame, hit, stand, double, /*resumeGame */} from '../logic/gameLogic';
import { checkGameOver } from '../logic/gameLogic';
const router = express.Router();

router.get("/start", startGame);

router.get("/hit", checkGameOver, hit);

router.get("/stand", checkGameOver, stand);

router.get("/double",checkGameOver, double);

//router.post("/resume", resumeGame);

export default router;