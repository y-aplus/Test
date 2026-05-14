import { describe, expect, it } from 'vitest';
import {
  applyItem,
  applyStolenItem,
  createGame,
  dealerAct,
  resolveShot,
  startNextDuel,
  startRound,
  type GameState,
} from './buckshot';

const fixedRandom = (values: number[]) => {
  let index = 0;
  return () => values[index++ % values.length] ?? 0;
};

describe('buckshot roulette rules', () => {
  it('supports classic and double modes with different starting health and item counts', () => {
    const classic = startRound(createGame('classic'), fixedRandom([0]));
    const double = startRound(createGame('double'), fixedRandom([0]));

    expect(classic.mode).toBe('classic');
    expect(classic.maxHp).toBe(3);
    expect(classic.player.hp).toBe(3);
    expect(classic.player.items).toHaveLength(2);
    expect(classic.dealer.items).toHaveLength(2);

    expect(double.mode).toBe('double');
    expect(double.maxHp).toBe(6);
    expect(double.player.hp).toBe(6);
    expect(double.player.items).toHaveLength(4);
    expect(double.dealer.items).toHaveLength(4);
  });

  it('continues into the next duel after a win without changing mode', () => {
    const won: GameState = {
      ...createGame('double'),
      phase: 'won',
      duel: 1,
      streak: 1,
      round: 3,
      maxHp: 6,
      player: { hp: 2, items: ['beer'] },
      dealer: { hp: 0, items: ['saw'] },
    };

    const next = startNextDuel(won, fixedRandom([0]));

    expect(next.mode).toBe('double');
    expect(next.duel).toBe(2);
    expect(next.streak).toBe(1);
    expect(next.round).toBe(1);
    expect(next.player.hp).toBe(6);
    expect(next.dealer.hp).toBe(6);
    expect(next.player.items).toHaveLength(4);
  });

  it('adds four replenished items every round in double mode', () => {
    const first = startRound(createGame('double'), fixedRandom([0]));
    const second = startRound({
      ...first,
      player: { ...first.player, items: ['beer'] },
      dealer: { ...first.dealer, items: ['saw', 'beer'] },
    }, fixedRandom([0]));

    expect(second.mode).toBe('double');
    expect(second.round).toBe(2);
    expect(second.player.items).toHaveLength(5);
    expect(second.dealer.items).toHaveLength(6);
  });

  it('starts a round with a mixed hidden shell order and public counts', () => {
    const game = startRound(createGame(), fixedRandom([0.9, 0.1, 0.7, 0.2]));

    expect(game.round).toBe(1);
    expect(game.shells).toHaveLength(3);
    expect(game.liveCount).toBe(1);
    expect(game.blankCount).toBe(2);
    expect(game.log[0]).toContain('Round 1');
  });

  it('lets the player keep the turn after shooting self with a blank', () => {
    const state: GameState = {
      ...createGame(),
      phase: 'playing',
      shells: ['blank', 'live'],
      liveCount: 1,
      blankCount: 1,
      player: { hp: 3, items: [] },
      dealer: { hp: 3, items: [] },
      turn: 'player',
    };

    const next = resolveShot(state, 'player');

    expect(next.player.hp).toBe(3);
    expect(next.turn).toBe('player');
    expect(next.blankCount).toBe(0);
  });

  it('spends every solo item with its matching gameplay effect', () => {
    const state: GameState = {
      ...createGame(),
      phase: 'playing',
      shells: ['live', 'blank', 'blank'],
      liveCount: 1,
      blankCount: 2,
      player: {
        hp: 2,
        items: ['magnifier', 'burnerPhone', 'inverter', 'beer', 'cigarettes', 'expiredMedicine', 'handcuffs', 'saw'],
      },
      dealer: { hp: 3, items: [] },
      turn: 'player',
    };

    const revealed = applyItem(state, 'magnifier');
    expect(revealed.knownShell).toBe('live');
    expect(revealed.player.items).not.toContain('magnifier');

    const phone = applyItem(revealed, 'burnerPhone', fixedRandom([0.5]));
    expect(phone.futureHint).toEqual({ position: 2, shell: 'blank' });

    const inverted = applyItem(phone, 'inverter');
    expect(inverted.shells[0]).toBe('blank');
    expect(inverted.liveCount).toBe(0);
    expect(inverted.blankCount).toBe(3);

    const racked = applyItem(inverted, 'beer');
    expect(racked.shells).toEqual(['blank', 'blank']);
    expect(racked.blankCount).toBe(2);

    const healed = applyItem(racked, 'cigarettes');
    expect(healed.player.hp).toBe(3);

    const medicineSuccess = applyItem({ ...healed, player: { ...healed.player, hp: 1, items: ['expiredMedicine'] } }, 'expiredMedicine', fixedRandom([0.25]));
    expect(medicineSuccess.player.hp).toBe(3);

    const medicineFail = applyItem({ ...healed, player: { ...healed.player, hp: 3, items: ['expiredMedicine'] } }, 'expiredMedicine', fixedRandom([0.75]));
    expect(medicineFail.player.hp).toBe(2);

    const cuffed = applyItem({ ...healed, player: { ...healed.player, items: ['handcuffs', 'saw'] } }, 'handcuffs');
    expect(cuffed.skipDealerTurn).toBe(true);

    const sawed = applyItem(cuffed, 'saw');
    const shot = resolveShot({ ...sawed, shells: ['live'], liveCount: 1, blankCount: 0 }, 'dealer');

    expect(shot.dealer.hp).toBe(1);
    expect(shot.doubleDamage).toBe(false);
    expect(shot.turn).toBe('player');
  });

  it('uses adrenaline to choose and immediately resolve an opponent item', () => {
    const state: GameState = {
      ...createGame(),
      phase: 'playing',
      shells: ['live', 'blank'],
      liveCount: 1,
      blankCount: 1,
      player: { hp: 2, items: ['adrenaline'] },
      dealer: { hp: 3, items: ['saw', 'cigarettes'] },
      turn: 'player',
    };

    const stealing = applyItem(state, 'adrenaline');
    expect(stealing.pendingAdrenaline).toBe('player');
    expect(stealing.player.items).toEqual([]);
    expect(stealing.dealer.items).toEqual(['saw', 'cigarettes']);

    const next = applyStolenItem(stealing, 'cigarettes');

    expect(next.player.hp).toBe(3);
    expect(next.player.items).toEqual([]);
    expect(next.dealer.items).toEqual(['saw']);
    expect(next.pendingAdrenaline).toBeNull();
    expect(next.log.some((entry) => entry.includes('Adrenaline'))).toBe(true);
  });

  it('blocks shots until adrenaline is resolved', () => {
    const state: GameState = {
      ...createGame(),
      phase: 'playing',
      shells: ['live', 'blank'],
      liveCount: 1,
      blankCount: 1,
      pendingAdrenaline: 'player',
      player: { hp: 3, items: [] },
      dealer: { hp: 3, items: ['beer'] },
      turn: 'player',
    };

    const next = resolveShot(state, 'dealer');

    expect(next.shells).toEqual(['live', 'blank']);
    expect(next.dealer.hp).toBe(3);
    expect(next.log[0]).toContain('Resolve Adrenaline');
  });

  it('ends the game when expired medicine drops a combatant to zero', () => {
    const state: GameState = {
      ...createGame(),
      phase: 'playing',
      player: { hp: 1, items: ['expiredMedicine'] },
      dealer: { hp: 3, items: [] },
      turn: 'player',
    };

    const next = applyItem(state, 'expiredMedicine', fixedRandom([0.75]));

    expect(next.player.hp).toBe(0);
    expect(next.phase).toBe('lost');
  });

  it('lets the dealer use adrenaline to steal a useful player item', () => {
    const state: GameState = {
      ...createGame(),
      phase: 'playing',
      shells: ['live', 'blank'],
      liveCount: 1,
      blankCount: 1,
      player: { hp: 3, items: ['cigarettes', 'beer'] },
      dealer: { hp: 2, items: ['adrenaline'] },
      turn: 'dealer',
    };

    const next = dealerAct(state, fixedRandom([0]));

    expect(next.dealer.items).toEqual([]);
    expect(next.player.items).toEqual(['beer']);
    expect(next.dealer.hp).toBe(3);
    expect(next.log.some((entry) => entry.includes('Adrenaline'))).toBe(true);
  });
});
