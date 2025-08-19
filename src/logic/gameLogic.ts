import { Request, Response, NextFunction } from "express";

import { Card, Deck, Hand, rankToValue, Suit, Rank} from "../types/types";

let deck: Deck = [];
let playerHand: Hand = {cards: [], totalScore: 0, aceCount: 0};
let dealerHand: Hand = {cards: [], totalScore: 0, aceCount: 0,};
let isGameGoing: boolean = false;
let totalMoney: number = 100;
let currentBet: number = 0;

export function checkGameOver(req: Request, res: Response, next: NextFunction)
{
    if(!isGameGoing)
    {
        return res.status(400).json({error: "Game is already over."});
    }
    next();
}

export function resumeGame(req: Request, res: Response) 
{
    const { playerHand: player, dealerHand: dealer, phase: phase, totalMoney: total, currentBet: current, message: msg } = req.body;

    deck = [];
    shuffleDeck(deck);

    playerHand.cards = [...player];
    playerHand.aceCount = 0;
    playerHand.cards.forEach((c) => {if(c.rank === "ace") playerHand.aceCount++;});
    playerHand.totalScore = findTotalScore(playerHand);


    dealerHand.cards = [...dealer];
    dealerHand.aceCount = 0;
    dealerHand.cards = dealerHand.cards.filter((card) => card.suit !== "hidden");

    if(phase === "playing")
    {
        isGameGoing = true;

        const c = deck.pop();
        if(!c)
        {
            return res.status(400).json("Something went wrong.");
        }
        dealerHand.cards.push(c);
        dealerHand.cards.forEach((c) => {if(c.rank === "ace") dealerHand.aceCount++});
        dealerHand.totalScore = findTotalScore(dealerHand);
    }
    
    
    deck = deck.filter(
        (card) => !player.some((u: Card) => u.rank === card.rank && u.suit === card.suit)
    );
    deck = deck.filter(
        (card) => !dealer.some((u: Card) => u.rank === card.rank && u.suit === card.suit)
    );

    if(phase === "betting")
    {
        deck = [];
        shuffleDeck(deck);
    }

    totalMoney = total;
    currentBet = current;

    return res.status(200).json({
        message: msg,
        playerHand: playerHand.cards,
        dealerHand: isGameGoing ? [
            dealerHand.cards[0],
            {suit: "hidden", rank: "hidden"}
        ] : dealerHand.cards,
        playerScore: playerHand.totalScore,
        dealerScore: isGameGoing ? "?" : dealerHand.totalScore,
        remainingCards: deck.length,
        totalMoney: totalMoney,
        currentBet: currentBet,
        phase: phase
    });
}

export function resetMoney(req: Request, res: Response)
{
    totalMoney = 100;
    currentBet = 50;

    return res.status(200).json({
        totalMoney: totalMoney,
        currentBet: currentBet
    })
}

export function betting(req: Request, res: Response)
{
    const {amount} = req.body;

    if (amount <= 0) 
    {
        totalMoney = 100;
        currentBet = 0;
        return res.status(400).json({ message: "Invalid bet" });
    }

    if (amount > totalMoney) 
    {
        return res.status(400).json({ message: "Not enough money" });
    }

    currentBet = amount;
    totalMoney -= amount;

    return res.status(200).json({
        message: "Bet placed",
        currentBet,
        totalMoney,
        phase: "playing"
  });
}

function shuffleDeck(deck: Deck): void
{
    const suits: Suit[] = ["spades" , "hearts" , "diamonds" , "clubs"];
    const ranks: Rank[] = ['2' , '3' , '4' , '5' , '6' , '7' , '8' , '9' , '10' , 'jack' , 'queen' , 'king' , 'ace'];
    
    for(const suit of suits)
    {
        for(const rank of ranks)
        {
            const card: Card = {suit,rank};
            deck.push(card);
        }
    }

    for(let i = deck.length - 1; i > 0; i--)
    {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function findTotalScore(hand: Hand): number
{
    let totalScore = hand.cards.reduce((sum, card) => (sum + rankToValue[card.rank]), 0);

    if(totalScore <= 21) return totalScore;

    let aceCount = hand.cards.filter(card => card.rank === "ace").length;

    while(totalScore > 21 && aceCount > 0)
    {
        totalScore -= 10;
        aceCount--;
    }

    return totalScore;
}

export function restartAll(req: Request, res: Response)
{
    deck = [];
    playerHand = {cards: [], totalScore: 0, aceCount: 0};
    dealerHand = {cards: [], totalScore: 0, aceCount: 0,};
    isGameGoing = false;
    totalMoney = 100;
    currentBet = 0;
}

function resetGame(): void
{
    deck = [];

    playerHand.cards = [];
    dealerHand.cards = [];

    playerHand.totalScore = 0;
    dealerHand.totalScore = 0;

    playerHand.aceCount = 0;
    dealerHand.aceCount = 0;

    isGameGoing = true;
}

function calculateBetting(isBlackJack: boolean = false, isWin: boolean = false, isTie: boolean = false)
{
    if(isWin && isBlackJack)
    {
        totalMoney += Math.floor(currentBet * (2.5));
    }
    else if(isWin)
    {
        totalMoney += currentBet * 2;
    }
    else if(isTie)
    {
        totalMoney += currentBet;
    }

    currentBet = 0;
}

export function startGame(req: Request, res: Response)
{
    resetGame();
    shuffleDeck(deck);

    for(let i = 0; i < 2; i++)
    {
        let card: Card | undefined = deck.pop();
        if(!card) return res.send("Something when wrong when giving out cards.");

        if(card.rank === 'ace') playerHand.aceCount++;
        playerHand.cards.push(card);

        card = deck.pop();
        if(!card) return res.send("Something when wrong when giving out cards.");

        if(card.rank === 'ace') dealerHand.aceCount++;
        dealerHand.cards.push(card);
    }

    playerHand.totalScore = findTotalScore(playerHand);
    dealerHand.totalScore = findTotalScore(dealerHand);
    
    if(playerHand.totalScore === 21)
    {   
        if(dealerHand.totalScore === 21)
        {
            //isBlackjack, isWin, isTie
            calculateBetting(true,false,true);
            return res.status(200).json({
                message: "Blackjack! It's a push! Would you like to play again?",
                playerHand: playerHand.cards,
                dealerHand: dealerHand.cards,
                playerScore: playerHand.totalScore,
                dealerScore: dealerHand.totalScore,
                remainingCards: deck.length,
                totalMoney: totalMoney,
            });
        }
        calculateBetting(true,true);
        return res.status(200).json({
            message: "Blackjack! You win! Would you like to play again?",
            playerHand: playerHand.cards,
            dealerHand: dealerHand.cards,
            playerScore: playerHand.totalScore,
            dealerScore: dealerHand.totalScore,
            remainingCards: deck.length,
            totalMoney: totalMoney
        });
    }
    else if(dealerHand.totalScore === 21)
    {
        calculateBetting();
        return res.status(200).json({
            message: "Dealer Blackjacked! You Lose! Would you like to play again?",
            playerHand: playerHand.cards,
            dealerHand: dealerHand.cards,
            playerScore: playerHand.totalScore,
            dealerScore: dealerHand.totalScore,
            remainingCards: deck.length,
            totalMoney: totalMoney
        });
    }

    return res.status(200).json({
        message: "Game Started!",
        playerHand: playerHand.cards,
        dealerHand: [
            dealerHand.cards[0],
            {suit: "hidden", rank: "hidden"}
        ],
        playerScore: playerHand.totalScore,
        remainingCards: deck.length,
        totalMoney: totalMoney
    });
}

export function hit(req: Request, res: Response)
{
    if(deck.length === 0)
    {
        return res.status(400).json({
            error: "Deck is empty. Cannot draw more cards."
        });
    } 

    const card: Card | undefined = deck.pop();
    if(!card) return res.send("Something went wrong when giving out cards.");   
        
    playerHand.cards.push(card);

    playerHand.totalScore = findTotalScore(playerHand);

    if(playerHand.totalScore > 21)
    {
        isGameGoing = false;
        calculateBetting();
        return res.status(200).json({
            message: "You Busted! You Lose! Would you like to play again?",
            playerHand: playerHand.cards,
            dealerHand: dealerHand.cards,
            playerScore: playerHand.totalScore,
            dealerScore: dealerHand.totalScore,
            remainingCards: deck.length,
            totalMoney: totalMoney
        });
    }
    else if(playerHand.totalScore === 21)
    {
        stand(req, res);
    }

    return res.status(200).json({
        message: "Hit Successful!",
        playerHand: playerHand.cards,
        dealerHand: [
            dealerHand.cards[0],
            {suit: "hidden", rank: "hidden"}
        ],
        playerScore: playerHand.totalScore,
        remainingCards: deck.length
    });
}

export function stand(req: Request, res: Response)
{
    if(deck.length === 0)
    {
        return res.send("Something went wrong when giving out cards.");
    } 

    isGameGoing = false;

    while(dealerHand.totalScore < 17)
    {
        const card = deck.pop();
        if(!card)
        {
            return res.send("Something went wrong.");
        }
        
        dealerHand.cards.push(card);

        dealerHand.totalScore = findTotalScore(dealerHand);
    }

    if(dealerHand.totalScore > 21)
    {
        calculateBetting(false,true,false);
        return res.status(200).json({
            message: "Dealer Busted! You Win! Would you like to play again?",
            playerHand: playerHand.cards,
            dealerHand: dealerHand.cards,
            playerScore: playerHand.totalScore,
            dealerScore: dealerHand.totalScore,
            remainingCards: deck.length,
            totalMoney: totalMoney
        });
    }

    if(playerHand.totalScore > dealerHand.totalScore)
    {
        calculateBetting(false,true,false);
        return res.status(200).json({
            message: "Game Over! You Win! Would you like to play again?",
            playerHand: playerHand.cards,
            dealerHand: dealerHand.cards,
            playerScore: playerHand.totalScore,
            dealerScore: dealerHand.totalScore,
            remainingCards: deck.length,
            totalMoney: totalMoney
        });
    }
    else if(playerHand.totalScore < dealerHand.totalScore)
    {
        calculateBetting();
        return res.status(200).json({
            message: "Game Over! You Lose! Would you like to play again?",
            playerHand: playerHand.cards,
            dealerHand: dealerHand.cards,
            playerScore: playerHand.totalScore,
            dealerScore: dealerHand.totalScore,
            remainingCards: deck.length,
            totalMoney: totalMoney
        });
    }
    else
    {
        calculateBetting(false,false,true);
        return res.status(200).json({
            message: "Game Over! It's a push! Would you like to play again?",
            playerHand: playerHand.cards,
            dealerHand: dealerHand.cards,
            playerScore: playerHand.totalScore,
            dealerScore: dealerHand.totalScore,
            remainingCards: deck.length,
            totalMoney: totalMoney
        });
    }
}

export function double(req: Request, res: Response)
{
    if(deck.length === 0)
    {
        return res.send("Something went wrong when giving out cards.");
    } 

    const doubledBet = currentBet * 2;
    if(doubledBet > totalMoney + currentBet)
    {
        return res.status(400).json("Not enough money to double.");
    }

    currentBet = doubledBet;

    const card: Card | undefined = deck.pop();
    if(!card) return res.send("Something went wrong when giving out cards.");   
    
    playerHand.cards.push(card);

    playerHand.totalScore = findTotalScore(playerHand);


    if(playerHand.totalScore > 21)
    {
        isGameGoing = false;
        calculateBetting();
        return res.status(200).json({
            message: "You Busted! You Lose! Would you like to play again?",
            playerHand: playerHand.cards,
            dealerHand: dealerHand.cards,
            playerScore: playerHand.totalScore,
            dealerScore: dealerHand.totalScore,
            remainingCards: deck.length,
            totalMoney: totalMoney
        });
    }

    if(deck.length === 0)
    {
        return res.send("Something went wrong when giving out cards.");
    } 

    isGameGoing = false;

    while(dealerHand.totalScore < 17)
    {
        const card = deck.pop();
        if(!card)
        {
            return res.send("Something went wrong.");
        }
        
        dealerHand.cards.push(card);

        dealerHand.totalScore = findTotalScore(dealerHand);
    }

    if(dealerHand.totalScore > 21)
    {
        calculateBetting(false,true,false);
        return res.status(200).json({
            message: "Dealer Busted! You Win! Would you like to play again?",
            playerHand: playerHand.cards,
            dealerHand: dealerHand.cards,
            playerScore: playerHand.totalScore,
            dealerScore: dealerHand.totalScore,
            remainingCards: deck.length,
            totalMoney: totalMoney
        });
    }

    if(playerHand.totalScore > dealerHand.totalScore)
    {
        calculateBetting(false, true, false);
        return res.status(200).json({
            message: "Game Over! You Win! Would you like to play again?",
            playerHand: playerHand.cards,
            dealerHand: dealerHand.cards,
            playerScore: playerHand.totalScore,
            dealerScore: dealerHand.totalScore,
            remainingCards: deck.length,
            totalMoney: totalMoney
        });
    }
    else if(playerHand.totalScore < dealerHand.totalScore)
    {
        calculateBetting();
        return res.status(200).json({
            message: "Game Over! You Lose! Would you like to play again?",
            playerHand: playerHand.cards,
            dealerHand: dealerHand.cards,
            playerScore: playerHand.totalScore,
            dealerScore: dealerHand.totalScore,
            remainingCards: deck.length,
            totalMoney: totalMoney
        });
    }
    else
    {
        calculateBetting(false, false, true);
        return res.status(200).json({
            message: "Game Over! It's a push! Would you like to play again?",
            playerHand: playerHand.cards,
            dealerHand: dealerHand.cards,
            playerScore: playerHand.totalScore,
            dealerScore: dealerHand.totalScore,
            remainingCards: deck.length,
            totalMoney: totalMoney
        });
    }
}