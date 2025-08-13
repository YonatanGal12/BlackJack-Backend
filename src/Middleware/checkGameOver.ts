import { Request, Response, NextFunction } from "express";
import { isGameOver } from "../types/types";

export function checkGameOver(req: Request, res: Response, next: NextFunction)
{
    if(isGameOver)
    {
        return res.status(400).json({error: "Game is already over."});
    }
    next();
}