export interface GameModel{
    playerId: string,
    roomId: string
}

export interface Player {
    id: string;
    name: string;
    position: number;
    isActive: boolean;
}

export interface GameState {
    roomId: string;
    players: Player[];
    currentPlayerIndex: number;
    gameStatus: 'waiting' | 'playing' | 'finished';
    winner?: string;
    diceValue?: number;
    lastMove?: {
        playerId: string;
        fromPosition: number;
        toPosition: number;
        diceValue: number;
    };
}

export interface Snake {
    head: number;
    tail: number;
}

export interface Ladder {
    bottom: number;
    top: number;
}