import { useEffect, useMemo, useState } from 'react';
import {
  Beer,
  Cigarette,
  Eye,
  HeartPulse,
  Phone,
  RefreshCcw,
  Scissors,
  Syringe,
  Unlink,
} from 'lucide-react';
import './App.css';
import {
  ITEM_LABELS,
  GAME_MODES,
  applyItem,
  applyStolenItem,
  createGame,
  dealerAct,
  resolveShot,
  startNextDuel,
  startRound,
  type GameState,
  type GameModeId,
  type ItemId,
  type Shell,
  type Target,
} from './game/buckshot';

const itemDescriptions: Record<ItemId, string> = {
  beer: 'Rack the shotgun and eject the current shell.',
  cigarettes: 'Regain 1 charge.',
  saw: 'Next live shot deals 2 damage.',
  magnifier: 'Reveal the current shell.',
  handcuffs: 'The dealer skips the next turn.',
  burnerPhone: 'Reveal one future shell position.',
  inverter: 'Flip the current shell between live and blank.',
  adrenaline: 'Steal one dealer item and use it immediately.',
  expiredMedicine: '50% heal 2 charges, otherwise lose 1 charge.',
};

const itemIcons: Record<ItemId, React.ComponentType<{ size?: number }>> = {
  beer: Beer,
  cigarettes: Cigarette,
  saw: Scissors,
  magnifier: Eye,
  handcuffs: Unlink,
  burnerPhone: Phone,
  inverter: RefreshCcw,
  adrenaline: Syringe,
  expiredMedicine: HeartPulse,
};

const itemOrder = Object.keys(ITEM_LABELS) as ItemId[];

function App() {
  const [game, setGame] = useState<GameState>(() => createGame());

  const canAct = game.phase === 'playing' && game.turn === 'player' && game.pendingAdrenaline !== 'player';
  const currentShellLabel = game.knownShell ? shellText(game.knownShell) : 'Unknown';
  const playerItemCounts = useMemo(() => countItems(game.player.items), [game.player.items]);
  const dealerItemCounts = useMemo(() => countItems(game.dealer.items), [game.dealer.items]);

  useEffect(() => {
    if (game.phase !== 'playing' || game.turn !== 'dealer') {
      return;
    }

    const timeout = window.setTimeout(() => {
      setGame((current) => dealerAct(current));
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [game.phase, game.turn, game.log]);

  const startNewGame = (mode: GameModeId = game.mode) => {
    setGame(startRound(createGame(mode)));
  };

  const continueRound = () => {
    setGame((current) => startRound(current));
  };

  const continueDuel = () => {
    setGame((current) => startNextDuel(current));
  };

  const shoot = (target: Target) => {
    if (!canAct) {
      return;
    }
    setGame((current) => resolveShot(current, target));
  };

  const useItem = (item: ItemId) => {
    if (!canAct || !game.player.items.includes(item)) {
      return;
    }
    setGame((current) => applyItem(current, item));
  };

  const useStolenItem = (item: ItemId) => {
    if (game.pendingAdrenaline !== 'player') {
      return;
    }
    setGame((current) => applyStolenItem(current, item));
  };

  return (
    <main className="game-shell">
      <section className="table" aria-label="Buckshot Roulette game table">
        <header className="table__header">
          <div>
            <p className="eyebrow">Browser rules prototype</p>
            <h1>Buckshot Roulette</h1>
          </div>
          <button type="button" className="button button--secondary" onClick={() => startNewGame()}>
            New Game
          </button>
        </header>

        <section className="mode-panel" aria-label="mode selection">
          {(Object.keys(GAME_MODES) as GameModeId[]).map((mode) => (
            <button
              key={mode}
              type="button"
              className={`mode-button ${game.mode === mode ? 'mode-button--active' : ''}`}
              disabled={game.phase === 'playing'}
              onClick={() => startNewGame(mode)}
            >
              <span>{GAME_MODES[mode].label}</span>
              <strong>HP {GAME_MODES[mode].initialHp} / Items {GAME_MODES[mode].itemsPerRound}</strong>
            </button>
          ))}
        </section>

        <section className="combatants" aria-label="health">
          <CombatantPanel title="You" hp={game.player.hp} maxHp={game.maxHp} active={game.turn === 'player'} />
          <div className="round-readout">
            <span>Duel {game.duel} / Streak {game.streak}</span>
            <span>Round {game.round || '-'}</span>
            <strong>{phaseText(game)}</strong>
          </div>
          <CombatantPanel title="Dealer" hp={game.dealer.hp} maxHp={game.maxHp} active={game.turn === 'dealer'} />
        </section>

        <section className="shotgun-panel" aria-label="shotgun">
          <div className="shell-counts">
            <ShellCount label="Live" value={game.liveCount} tone="danger" />
            <ShellCount label="Blank" value={game.blankCount} tone="safe" />
            <ShellCount label="Chamber" value={currentShellLabel} tone="neutral" />
          </div>

          {game.futureHint ? (
            <p className="hint">Burner Phone: shell {game.futureHint.position} is {shellText(game.futureHint.shell)}.</p>
          ) : (
            <p className="hint">Shell order is hidden. Count the live and blank shells before you pull the trigger.</p>
          )}

          <div className="actions">
            {game.phase === 'ready' ? (
              <button type="button" className="button button--primary" onClick={() => startNewGame()}>
                Start Deal
              </button>
            ) : null}
            {game.phase === 'won' ? (
              <button type="button" className="button button--primary" onClick={continueDuel}>
                Next Duel
              </button>
            ) : null}
            {game.phase === 'won' || game.phase === 'lost' ? (
              <button type="button" className="button button--secondary" onClick={() => startNewGame()}>
                Restart
              </button>
            ) : null}
            {game.phase === 'playing' && game.shells.length === 0 ? (
              <button type="button" className="button button--primary" onClick={continueRound}>
                Reload
              </button>
            ) : null}
            <button type="button" className="button button--danger" disabled={!canAct} onClick={() => shoot('dealer')}>
              Shoot Dealer
            </button>
            <button type="button" className="button button--ghost" disabled={!canAct} onClick={() => shoot('player')}>
              Shoot Yourself
            </button>
          </div>
        </section>

        <section className="inventory-grid" aria-label="items">
          <InventoryPanel
            title="Your Items"
            counts={playerItemCounts}
            disabled={!canAct || game.pendingAdrenaline === 'player'}
            onUse={useItem}
            interactive
          />
          <InventoryPanel
            title={game.pendingAdrenaline === 'player' ? 'Choose Stolen Item' : 'Dealer Items'}
            counts={dealerItemCounts}
            disabled={game.pendingAdrenaline !== 'player'}
            onUse={useStolenItem}
            interactive={game.pendingAdrenaline === 'player'}
          />
        </section>

        <section className="log-panel" aria-label="log">
          <h2>Log</h2>
          <ol>
            {game.log.map((entry, index) => (
              <li key={`${entry}-${index}`}>{entry}</li>
            ))}
          </ol>
        </section>
      </section>
    </main>
  );
}

type CombatantPanelProps = {
  title: string;
  hp: number;
  maxHp: number;
  active: boolean;
};

const CombatantPanel = ({ title, hp, maxHp, active }: CombatantPanelProps) => (
  <article className={`combatant ${active ? 'combatant--active' : ''}`}>
    <div className="combatant__title">
      <h2>{title}</h2>
      <span>{active ? 'Turn' : 'Waiting'}</span>
    </div>
    <div className="charges" aria-label={`${title} charges`}>
      {Array.from({ length: maxHp }, (_, index) => (
        <span key={index} className={index < hp ? 'charge charge--filled' : 'charge'} />
      ))}
    </div>
  </article>
);

type ShellCountProps = {
  label: string;
  value: number | string;
  tone: 'danger' | 'safe' | 'neutral';
};

const ShellCount = ({ label, value, tone }: ShellCountProps) => (
  <div className={`shell-count shell-count--${tone}`}>
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

type InventoryPanelProps = {
  title: string;
  counts: Partial<Record<ItemId, number>>;
  disabled: boolean;
  interactive?: boolean;
  onUse: (item: ItemId) => void;
};

const InventoryPanel = ({ title, counts, disabled, interactive = false, onUse }: InventoryPanelProps) => (
  <section className="inventory">
    <h2>{title}</h2>
    <div className="items">
      {itemOrder.map((item) => {
        const count = counts[item] ?? 0;
        const Icon = itemIcons[item];
        const isDisabled = disabled || count === 0;

        return (
          <button
            key={item}
            type="button"
            className="item-button"
            disabled={isDisabled || !interactive}
            title={`${ITEM_LABELS[item]}: ${itemDescriptions[item]}`}
            onClick={() => onUse(item)}
          >
            <Icon size={18} />
            <span>{ITEM_LABELS[item]}</span>
            <strong>{count}</strong>
          </button>
        );
      })}
    </div>
  </section>
);

const countItems = (items: ItemId[]): Partial<Record<ItemId, number>> =>
  items.reduce<Partial<Record<ItemId, number>>>((counts, item) => {
    counts[item] = (counts[item] ?? 0) + 1;
    return counts;
  }, {});

const phaseText = (game: GameState): string => {
  if (game.phase === 'ready') {
    return 'Not loaded';
  }
  if (game.phase === 'won') {
    return 'Dealer down';
  }
  if (game.phase === 'lost') {
    return 'You are down';
  }
  return game.turn === 'player' ? 'Your move' : 'Dealer thinking';
};

const shellText = (shell: Shell): string => (shell === 'live' ? 'Live' : 'Blank');

export default App;
