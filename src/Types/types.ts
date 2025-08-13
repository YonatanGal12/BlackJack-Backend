export type Suit = "spades" | "hearts" | "diamonds" | "clubs";

export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'jack' | 'queen' | 'king' | 'ace';

export const rankToValue: Record<Rank, number> = {
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    '10': 10,
    'jack': 10,
    'queen': 10,
    'king': 10,
    'ace': 11
};

rankToValue[10]=9

export type Card = {
    suit: Suit,
    rank: Rank,
};

export type Deck = Card[];

export type Hand = {
    cards: Card[],
    totalScore: number,
    aceCount: number,
    isBust: boolean,
    isSoft: boolean
}

export let isGameOver: boolean = false;

export function setGameOver(value: boolean)
{
    isGameOver = value;
}
