export type Shell = 'live' | 'blank';
export type Actor = 'player' | 'dealer';
export type Target = 'player' | 'dealer';
export type Phase = 'ready' | 'playing' | 'won' | 'lost';
export type GameModeId = 'classic' | 'double';

export type ItemId =
  | 'beer'
  | 'cigarettes'
  | 'saw'
  | 'magnifier'
  | 'handcuffs'
  | 'burnerPhone'
  | 'inverter'
  | 'adrenaline'
  | 'expiredMedicine';

export type Combatant = {
  hp: number;
  items: ItemId[];
};

export type FutureHint = {
  position: number;
  shell: Shell;
};

export type GameState = {
  phase: Phase;
  mode: GameModeId;
  duel: number;
  streak: number;
  round: number;
  maxHp: number;
  player: Combatant;
  dealer: Combatant;
  turn: Actor;
  shells: Shell[];
  liveCount: number;
  blankCount: number;
  knownShell: Shell | null;
  futureHint: FutureHint | null;
  pendingAdrenaline: Actor | null;
  doubleDamage: boolean;
  skipPlayerTurn: boolean;
  skipDealerTurn: boolean;
  log: string[];
};

export type RandomSource = () => number;

export const GAME_MODES: Record<GameModeId, { label: string; initialHp: number; itemsPerRound: number }> = {
  classic: {
    label: 'Classic',
    initialHp: 3,
    itemsPerRound: 2,
  },
  double: {
    label: 'Double',
    initialHp: 6,
    itemsPerRound: 4,
  },
};

const MAX_ITEMS = 8;

export const ITEM_LABELS: Record<ItemId, string> = {
  beer: 'Beer',
  cigarettes: 'Cigarette Pack',
  saw: 'Hand Saw',
  magnifier: 'Magnifying Glass',
  handcuffs: 'Handcuffs',
  burnerPhone: 'Burner Phone',
  inverter: 'Inverter',
  adrenaline: 'Adrenaline',
  expiredMedicine: 'Expired Medicine',
};

const ITEM_POOL: ItemId[] = [
  'beer',
  'cigarettes',
  'saw',
  'magnifier',
  'handcuffs',
  'burnerPhone',
  'inverter',
  'adrenaline',
  'expiredMedicine',
];

const roundLoads = [
  { live: 1, blank: 2 },
  { live: 2, blank: 2 },
  { live: 3, blank: 3 },
  { live: 4, blank: 3 },
];

export const createGame = (mode: GameModeId = 'classic'): GameState => {
  const maxHp = GAME_MODES[mode].initialHp;

  return {
    phase: 'ready',
    mode,
    duel: 1,
    streak: 0,
    round: 0,
    maxHp,
    player: { hp: maxHp, items: [] },
    dealer: { hp: maxHp, items: [] },
    turn: 'player',
    shells: [],
    liveCount: 0,
    blankCount: 0,
    knownShell: null,
    futureHint: null,
    pendingAdrenaline: null,
    doubleDamage: false,
    skipPlayerTurn: false,
    skipDealerTurn: false,
    log: ['Press Start Deal to load the shotgun.'],
  };
};

export const startRound = (state: GameState, random: RandomSource = Math.random): GameState => {
  const round = state.round + 1;
  const load = roundLoads[Math.min(round - 1, roundLoads.length - 1)];
  const shells = shuffle([...Array<Shell>(load.live).fill('live'), ...Array<Shell>(load.blank).fill('blank')], random);
  const mode = GAME_MODES[state.mode];
  const maxHp = mode.initialHp;

  return {
    ...state,
    phase: 'playing',
    round,
    maxHp,
    player: {
      hp: Math.min(maxHp, state.player.hp),
      items: replenishItems(state.player.items, mode.itemsPerRound, random),
    },
    dealer: {
      hp: Math.min(maxHp, state.dealer.hp),
      items: replenishItems(state.dealer.items, mode.itemsPerRound, random),
    },
    turn: 'player',
    shells,
    liveCount: load.live,
    blankCount: load.blank,
    knownShell: null,
    futureHint: null,
    pendingAdrenaline: null,
    doubleDamage: false,
    skipPlayerTurn: false,
    skipDealerTurn: false,
    log: [
      `Round ${round}: loaded ${load.live} live and ${load.blank} blank shells.`,
      ...state.log,
    ],
  };
};

export const startNextDuel = (state: GameState, random: RandomSource = Math.random): GameState => {
  const mode = GAME_MODES[state.mode];
  return startRound(
    {
      ...state,
      phase: 'ready',
      duel: state.duel + 1,
      round: 0,
      maxHp: mode.initialHp,
      player: { hp: mode.initialHp, items: [] },
      dealer: { hp: mode.initialHp, items: [] },
      shells: [],
      liveCount: 0,
      blankCount: 0,
      knownShell: null,
      futureHint: null,
      pendingAdrenaline: null,
      doubleDamage: false,
      skipPlayerTurn: false,
      skipDealerTurn: false,
      log: [`Duel ${state.duel + 1} begins.`, ...state.log],
    },
    random,
  );
};

export const applyItem = (
  state: GameState,
  item: ItemId,
  random: RandomSource = Math.random,
  forcedActor?: Actor,
): GameState => {
  if (state.phase !== 'playing') {
    return addLog(state, 'Items can only be used while a round is active.');
  }

  const actor = forcedActor ?? state.turn;
  if (state.pendingAdrenaline && !forcedActor) {
    return addLog(state, 'Resolve Adrenaline before taking another action.');
  }
  if (!hasItem(state, actor, item) && !forcedActor) {
    return addLog(state, `${actorName(actor)} does not have ${ITEM_LABELS[item]}.`);
  }

  const consumed = forcedActor ? state : removeItem(state, actor, item);

  if (item === 'magnifier') {
    return addLog(
      { ...consumed, knownShell: consumed.shells[0] ?? null },
      `${actorName(actor)} checks the chamber: ${shellName(consumed.shells[0])}.`,
    );
  }

  if (item === 'burnerPhone') {
    if (consumed.shells.length === 0) {
      return addLog(consumed, 'The phone rings, but the shotgun is empty.');
    }
    const index = Math.floor(random() * consumed.shells.length);
    const hint = { position: index + 1, shell: consumed.shells[index] };
    return addLog(
      { ...consumed, futureHint: hint },
      `${actorName(actor)} hears: shell ${hint.position} is ${shellName(hint.shell)}.`,
    );
  }

  if (item === 'inverter') {
    const [current, ...rest] = consumed.shells;
    if (!current) {
      return addLog(consumed, 'The inverter clicks against an empty chamber.');
    }
    const inverted: Shell = current === 'live' ? 'blank' : 'live';
    return addLog(
      recalculateShells({ ...consumed, shells: [inverted, ...rest], knownShell: inverted }),
      `${actorName(actor)} flips the current shell to ${shellName(inverted)}.`,
    );
  }

  if (item === 'beer') {
    const [ejected, ...remaining] = consumed.shells;
    if (!ejected) {
      return addLog(consumed, 'Beer racks nothing; the shotgun is empty.');
    }
    return addLog(
      recalculateShells({ ...consumed, shells: remaining, knownShell: null, futureHint: null }),
      `${actorName(actor)} racks the shotgun and ejects a ${shellName(ejected)} shell.`,
    );
  }

  if (item === 'cigarettes') {
    return addLog(
      heal(consumed, actor, 1),
      actor === 'player' ? 'You regain 1 charge.' : 'Dealer regains 1 charge.',
    );
  }

  if (item === 'expiredMedicine') {
    const success = random() < 0.5;
    const next = checkEnd(success ? heal(consumed, actor, 2) : damageActor(consumed, actor, 1));
    return addLog(
      next,
      success
        ? medicineMessage(actor, 'regains 2 charges')
        : medicineMessage(actor, 'loses 1 charge'),
    );
  }

  if (item === 'handcuffs') {
    const skipKey = actor === 'player' ? 'skipDealerTurn' : 'skipPlayerTurn';
    return addLog(
      { ...consumed, [skipKey]: true },
      `${actorName(actor)} cuffs the opponent's next turn.`,
    );
  }

  if (item === 'saw') {
    return addLog(
      { ...consumed, doubleDamage: true },
      `${actorName(actor)} saws the barrel. The next live shot deals 2 damage.`,
    );
  }

  if (consumed[otherActor(actor)].items.length === 0) {
    return addLog(consumed, `${actorName(actor)} uses Adrenaline, but there is nothing to steal.`);
  }

  return addLog(
    { ...consumed, pendingAdrenaline: actor },
    `${actorName(actor)} uses Adrenaline. Choose an opponent item to steal.`,
  );
};

export const applyStolenItem = (
  state: GameState,
  stolen: ItemId,
  random: RandomSource = Math.random,
): GameState => {
  const actor = state.pendingAdrenaline;
  if (!actor) {
    return addLog(state, 'Adrenaline is not active.');
  }

  const opponent = otherActor(actor);
  if (!state[opponent].items.includes(stolen)) {
    return addLog(state, `${actorName(opponent)} does not have ${ITEM_LABELS[stolen]}.`);
  }

  const withoutStolen: GameState = removeItem(
    { ...state, pendingAdrenaline: null },
    opponent,
    stolen,
  );
  return applyItem(
    addLog(withoutStolen, `${actorName(actor)} steals ${ITEM_LABELS[stolen]} with Adrenaline.`),
    stolen,
    random,
    actor,
  );
};

export const resolveShot = (state: GameState, target: Target): GameState => {
  if (state.phase !== 'playing') {
    return state;
  }
  if (state.pendingAdrenaline) {
    return addLog(state, 'Resolve Adrenaline before taking another action.');
  }

  const shooter = state.turn;
  const [shell, ...remaining] = state.shells;
  if (!shell) {
    return startRound(addLog(state, 'The shotgun is empty. A new round begins.'));
  }

  const damage = shell === 'live' ? (state.doubleDamage ? 2 : 1) : 0;
  const afterShot = recalculateShells({
    ...state,
    shells: remaining,
    knownShell: null,
    futureHint: null,
    doubleDamage: false,
  });
  const damaged = damage > 0 ? damageActor(afterShot, target, damage) : afterShot;
  const ended = checkEnd(damaged);
  if (ended.phase !== 'playing') {
    return addLog(ended, `${actorName(target)} was hit by a ${shellName(shell)} shell for ${damage} damage.`);
  }

  const nextTurn = chooseNextTurn(ended, shooter, target, shell);
  return addLog(
    maybeStartNextRound({ ...nextTurn, turn: nextTurn.turn }),
    shell === 'live'
      ? `${actorName(shooter)} fires at ${actorName(target)}: live shell, ${damage} damage.`
      : `${actorName(shooter)} fires at ${actorName(target)}: blank shell.`,
  );
};

export const dealerAct = (state: GameState, random: RandomSource = Math.random): GameState => {
  if (state.phase !== 'playing' || state.turn !== 'dealer') {
    return state;
  }

  let next = state;
  const itemPlan = chooseDealerItems(next);
  for (const item of itemPlan) {
    if (next.turn === 'dealer' && next.dealer.items.includes(item)) {
      next = applyItem(next, item, random);
      if (next.pendingAdrenaline === 'dealer') {
        const stolen = chooseDealerStolenItem(next);
        if (stolen) {
          next = applyStolenItem(next, stolen, random);
        }
      }
    }
  }

  const current = next.knownShell ?? next.shells[0] ?? null;
  const target: Target = current === 'blank' ? 'dealer' : 'player';
  return resolveShot(next, target);
};

const chooseDealerItems = (state: GameState): ItemId[] => {
  const items = state.dealer.items;
  const plan: ItemId[] = [];
  const current = state.knownShell ?? state.shells[0] ?? null;

  if (items.includes('adrenaline') && state.player.items.length > 0) {
    plan.push('adrenaline');
  }
  if (state.dealer.hp <= state.maxHp - 2 && items.includes('expiredMedicine')) {
    plan.push('expiredMedicine');
  }
  if (state.dealer.hp < state.maxHp && items.includes('cigarettes')) {
    plan.push('cigarettes');
  }
  if (!current && items.includes('magnifier')) {
    plan.push('magnifier');
  }
  if (!current && items.includes('burnerPhone')) {
    plan.push('burnerPhone');
  }
  if (current === 'blank' && items.includes('inverter')) {
    plan.push('inverter');
  }
  if ((current === 'live' || items.includes('inverter')) && items.includes('saw')) {
    plan.push('saw');
  }
  if (items.includes('handcuffs')) {
    plan.push('handcuffs');
  }

  return plan;
};

const chooseDealerStolenItem = (state: GameState): ItemId | null => {
  const playerItems = state.player.items;
  const current = state.knownShell ?? state.shells[0] ?? null;
  const priority: ItemId[] = [];

  if (state.dealer.hp < state.maxHp) {
    priority.push('cigarettes', 'expiredMedicine');
  }
  if (current === 'live') {
    priority.push('saw', 'handcuffs', 'magnifier');
  }
  if (current === 'blank') {
    priority.push('inverter', 'beer');
  }
  priority.push('burnerPhone', 'beer', 'magnifier', 'handcuffs', 'saw', 'inverter', 'adrenaline');

  return priority.find((item) => playerItems.includes(item)) ?? null;
};

const chooseNextTurn = (state: GameState, shooter: Actor, target: Target, shell: Shell): GameState => {
  if (shell === 'blank' && shooter === target) {
    return { ...state, turn: shooter };
  }

  const candidate = otherActor(shooter);
  if (candidate === 'dealer' && state.skipDealerTurn) {
    return addLog({ ...state, turn: 'player', skipDealerTurn: false }, 'The dealer loses a turn.');
  }
  if (candidate === 'player' && state.skipPlayerTurn) {
    return addLog({ ...state, turn: 'dealer', skipPlayerTurn: false }, 'You lose a turn.');
  }
  return { ...state, turn: candidate };
};

const maybeStartNextRound = (state: GameState): GameState => {
  if (state.phase === 'playing' && state.shells.length === 0) {
    return startRound(addLog(state, 'The shotgun is empty.'), Math.random);
  }
  return state;
};

const checkEnd = (state: GameState): GameState => {
  if (state.player.hp <= 0) {
    return { ...state, phase: 'lost', player: { ...state.player, hp: 0 } };
  }
  if (state.dealer.hp <= 0) {
    return { ...state, phase: 'won', streak: state.streak + 1, dealer: { ...state.dealer, hp: 0 } };
  }
  return state;
};

const damageActor = (state: GameState, actor: Actor, amount: number): GameState => ({
  ...state,
  [actor]: {
    ...state[actor],
    hp: Math.max(0, state[actor].hp - amount),
  },
});

const heal = (state: GameState, actor: Actor, amount: number): GameState => ({
  ...state,
  [actor]: {
    ...state[actor],
    hp: Math.min(state.maxHp, state[actor].hp + amount),
  },
});

const recalculateShells = (state: GameState): GameState => ({
  ...state,
  liveCount: state.shells.filter((shell) => shell === 'live').length,
  blankCount: state.shells.filter((shell) => shell === 'blank').length,
});

const removeItem = (state: GameState, actor: Actor, item: ItemId): GameState => {
  let removed = false;
  return {
    ...state,
    [actor]: {
      ...state[actor],
      items: state[actor].items.filter((current) => {
        if (!removed && current === item) {
          removed = true;
          return false;
        }
        return true;
      }),
    },
  };
};

const hasItem = (state: GameState, actor: Actor, item: ItemId): boolean => state[actor].items.includes(item);

const drawItems = (count: number, random: RandomSource): ItemId[] =>
  Array.from({ length: count }, () => ITEM_POOL[Math.floor(random() * ITEM_POOL.length)]);

const replenishItems = (items: ItemId[], count: number, random: RandomSource): ItemId[] =>
  [...items, ...drawItems(count, random)].slice(0, MAX_ITEMS);

const shuffle = <T>(items: T[], random: RandomSource): T[] => {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
};

const addLog = (state: GameState, message: string): GameState => ({
  ...state,
  log: [message, ...state.log].slice(0, 12),
});

const otherActor = (actor: Actor): Actor => (actor === 'player' ? 'dealer' : 'player');

const actorName = (actor: Actor): string => (actor === 'player' ? 'You' : 'Dealer');

const medicineMessage = (actor: Actor, result: string): string =>
  actor === 'player'
    ? `You risk expired medicine and ${result.replace('regains', 'regain').replace('loses', 'lose')}.`
    : `Dealer risks expired medicine and ${result}.`;

const shellName = (shell: Shell | undefined): string => {
  if (!shell) {
    return 'empty';
  }
  return shell === 'live' ? 'live' : 'blank';
};
