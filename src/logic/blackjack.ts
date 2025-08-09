import { Request, Response } from "express";

import { Card, Deck, Hand, rankToValue } from "../Types/types";

const deck: Deck = [];
const playerHand: Hand = {cards: [], totalScore: 0, aceCount: 0, isBust: false, isSoft: false};
const dealerHand: Hand = {cards: [], totalScore: 0, aceCount: 0, isBust: false, isSoft: false};

function shuffleDeck(deck: Deck)
{
    const suits: Card["suit"][] = ["spades" , "hearts" , "diamonds" , "clubs"];
    const ranks: Card["rank"][] = ['2' , '3' , '4' , '5' , '6' , '7' , '8' , '9' , '10' , 'J' , 'Q' , 'K' , 'A'];

    for(const suit of suits)
    {
        for(const rank of ranks)
        {
            const card: Card = {suit,rank};
            deck.push(card);
        }
    }

    for(let i = deck.length -1; i > 0; i--)
    {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function findTotalScore(hand: Hand): number
{
    let totalScore = hand.cards.reduce((sum, card) => (sum + rankToValue[card.rank]), 0);

    if(totalScore <= 21) return totalScore;

    while(totalScore > 21 && hand.aceCount > 0)
    {
        totalScore -= 10;
        hand.aceCount--;
    }

    return totalScore;
}

function resetGame()
{
    while(deck.length > 0)
        deck.pop();
    while(playerHand.cards.length > 0)
        playerHand.cards.pop();
    while(dealerHand.cards.length > 0)
        dealerHand.cards.pop();

    playerHand.totalScore = 0;
    dealerHand.totalScore = 0;

    playerHand.aceCount = 0;
    dealerHand.aceCount = 0;

    playerHand.isBust = false;
    dealerHand.isBust = false;
}
export function startGame(req: Request, res: Response)
{
    if(deck.length > 0)
        resetGame();

    shuffleDeck(deck);

    for(let i = 0; i < 2; i++)
    {
        let card: Card = deck.pop()!;
        if(!card)
        {
            res.sendStatus(400);
            return;
        } 
        if(card.rank === 'A') playerHand.aceCount++;
        playerHand.cards.push(card);

        card = deck.pop()!;
        if(!card)
        {
            res.sendStatus(400);
            return;
        } 
        if(card.rank === 'A') dealerHand.aceCount++;
        dealerHand.cards.push(card);
    }

    playerHand.totalScore = findTotalScore(playerHand);
    dealerHand.totalScore = findTotalScore(dealerHand);
    
    return res.status(200).json({
        message: "Game Started!",
        playerHand: playerHand.cards,
        dealerHand: [
            dealerHand.cards[0],
            {suit: "hidden", value: "hidden"}
        ],
        playerScore: playerHand.totalScore,
        remainingCards: deck.length
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

    playerHand.cards.push(deck.pop()!);

    playerHand.totalScore = findTotalScore(playerHand);

    if(playerHand.totalScore > 21)
    {
        playerHand.isBust = true;

        return res.status(200).json({
            message: "You Busted! You Lose! Would you like to play again?",
            playerHand: playerHand.cards,
            dealerHand: dealerHand.cards,
            playerScore: playerHand.totalScore,
            dealerScore: dealerHand.totalScore,
            remainingCards: deck.length
        });
    }

    return res.status(200).json({
        message: "Hit Successful!",
        playerHand: playerHand.cards,
        playerScore: playerHand.totalScore,
        remainingCards: deck.length
    });
}

export function stand(req: Request, res: Response)
{
    if(deck.length === 0)
    {
        return res.status(400).json({
            error: "Deck is empty. Cannot draw more cards."
        });
    } 

    while(dealerHand.totalScore < 17)
    {
        dealerHand.cards.push(deck.pop()!);

        dealerHand.totalScore = findTotalScore(dealerHand);
    }

    if(dealerHand.totalScore > 21)
    {
        dealerHand.isBust = true;

        return res.status(200).json({
            message: "Dealer Busted! You Win! Would you like to play again?",
            playerHand: playerHand.cards,
            dealerHand: dealerHand.cards,
            playerScore: playerHand.totalScore,
            dealerScore: dealerHand.totalScore,
            remainingCards: deck.length
        });
    }

    if(playerHand.totalScore >= dealerHand.totalScore)
    {
        return res.status(200).json({
            message: "Game Over! You Win! Would you like to play again?",
            playerHand: playerHand.cards,
            dealerHand: dealerHand.cards,
            playerScore: playerHand.totalScore,
            dealerScore: dealerHand.totalScore,
            remainingCards: deck.length
        });
    }
    else if(playerHand.totalScore < dealerHand.totalScore)
    {
        return res.status(200).json({
            message: "Game Over! You Lose! Would you like to play again?",
            playerHand: playerHand.cards,
            dealerHand: dealerHand.cards,
            playerScore: playerHand.totalScore,
            dealerScore: dealerHand.totalScore,
            remainingCards: deck.length
        });
    }
    else
    {
        //Implement tie logic when there are bets, for now you win
    }
}