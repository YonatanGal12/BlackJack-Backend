import { Request, Response } from "express";


type Card = {
    suit: "spades" | "hearts" | "diamonds" | "clubs",
    value: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A'
};


function shuffleDeck(deck: Card[])
{
    const suits: Card["suit"][] = ["spades" , "hearts" , "diamonds" , "clubs"];
    const values: Card["value"][] = ['2' , '3' , '4' , '5' , '6' , '7' , '8' , '9' , '10' , 'J' , 'Q' , 'K' , 'A'];
    
    for(const suit of suits)
    {
        for(const value of values)
        {
            const card: Card = {suit,value};
            deck.push(card);
        }
    }

    for(let i = deck.length -1; i > 0; i--)
    {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

export function startGame(req: Request, res: Response){

    const deck: Card[] = [];
    shuffleDeck(deck);

    const playerHand: Card[] = [];
    const dealerHand: Card[] = [];

    for(let i = 0; i < 2; i++)
    {
        playerHand.push(deck.pop()!);
        dealerHand.push(deck.pop()!);
    }

    res.status(200).json({
        message: "Game Started!",
        playerHand,
        dealerHand: [
            dealerHand[0],
            {suit: "hidden", value: "hidden"}
        ],
        remainingCards: deck.length
    });
}