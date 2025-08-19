import express from 'express';
import { startGame, hit, stand, double, resumeGame, betting, resetMoney, restartAll} from '../logic/gameLogic';
import { checkGameOver } from '../logic/gameLogic';
const router = express.Router();

router.post("/start", startGame);

router.get("/hit", checkGameOver, hit);

router.get("/stand", checkGameOver, stand);

router.get("/double",checkGameOver, double);

router.patch("/betting", betting);

router.patch("/resume", resumeGame);

router.patch("/resetMoney", resetMoney);

router.patch("/restartAll", restartAll);

export default router;