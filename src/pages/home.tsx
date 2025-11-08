import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { ref, onValue, push, update } from 'firebase/database';
import { BrutalistBackground } from '../components/BrutalistBackground';
import { SpinWheel } from '../components/SpinWheel';

// --- Interfaces ---
interface Game {
  id: string;
  title:string;
  price: string;
  platform: string;
  isAlreadyPlayed: boolean;
}

// --- Styles ---
const palette = {
  background: '#FFFFFF',
  primary: '#FF00FF',
  secondary: '#FFFF00',
  accent: '#00FFFF',
  black: '#000000',
};

const styles = {
  container: {
    backgroundColor: palette.background,
    color: palette.black,
    minHeight: '100vh',
    padding: '2rem',
    fontFamily: '"IBM Plex Mono", monospace',
    position: 'relative' as const,
    zIndex: 1,
  },
  header: {
    border: `3px solid ${palette.black}`,
    backgroundColor: palette.primary,
    padding: '1rem',
    marginBottom: '2rem',
    textAlign: 'center' as const,
  },
  title: {
    fontSize: '3rem',
    margin: 0,
    color: palette.background,
    textShadow: `3px 3px 0 ${palette.black}`,
  },
  button: {
    backgroundColor: palette.secondary,
    border: `3px solid ${palette.black}`,
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
    boxShadow: `5px 5px 0 ${palette.black}`,
    transition: 'all 0.1s ease-in-out',
    margin: '0.5rem',
    color: palette.black,
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap' as const,
  },
  section: {
    border: `3px solid ${palette.black}`,
    padding: '1.5rem',
    marginBottom: '2rem',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(2px)',
  },
  gameItem: {
    borderBottom: `2px solid ${palette.black}`,
    padding: '1rem 0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modal: {
    position: 'fixed' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: palette.background,
    border: `3px solid ${palette.black}`,
    boxShadow: `10px 10px 0 ${palette.accent}`,
    padding: '2rem',
    zIndex: 10,
    width: '80%',
    maxWidth: '500px',
    textAlign: 'center' as const,
  },
  formInput: {
    border: `2px solid ${palette.black}`,
    padding: '0.75rem',
    width: 'calc(100% - 1.5rem)',
    marginBottom: '1rem',
    fontFamily: 'inherit',
    fontSize: '1rem',
  },
};

export const HomePage = () => {
  const [unplayedGames, setUnplayedGames] = useState<Game[]>([]);
  const [playedGames, setPlayedGames] = useState<Game[]>([]);
  const [showAddGameForm, setShowAddGameForm] = useState(false);
  const [newGame, setNewGame] = useState({ title: '', price: '', platform: '' });
  const [showSpinModal, setShowSpinModal] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  useEffect(() => {
    const gamesRef = ref(db, 'games');
    onValue(gamesRef, (snapshot) => {
      const data = snapshot.val();
      const allGames = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      setUnplayedGames(allGames.filter(game => !game.isAlreadyPlayed));
      setPlayedGames(allGames.filter(game => game.isAlreadyPlayed));
    });
  }, []);

  const handleAddGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGame.title) return alert('Title is required.');
    push(ref(db, 'games'), { ...newGame, isAlreadyPlayed: false });
    setNewGame({ title: '', price: '', platform: '' });
    setShowAddGameForm(false);
  };

  const handleSpinEnd = async (game: Game) => {
    const gameRef = ref(db, `games/${game.id}`);
    await update(gameRef, { isAlreadyPlayed: true, playedAt: new Date().toISOString() });
    setSelectedGame(game);
    setIsSpinning(false);
  };

  const handleMoveToUnplayed = async (game: Game) => {
    const gameRef = ref(db, `games/${game.id}`);
    await update(gameRef, { isAlreadyPlayed: false });
  };

  const handleSpinIt = () => {
    if (unplayedGames.length === 0) return alert("No games to spin!");
    setShowSpinModal(true);
    setIsSpinning(true);
    setSelectedGame(null);
  };

  return (
    <div style={styles.container}>
      <BrutalistBackground />
      <header style={styles.header}>
        <h1 style={styles.title}>GAME SELECTOR</h1>
      </header>

      <div style={styles.buttonGroup}>
        <button style={styles.button} onClick={() => setShowAddGameForm(true)}>+ ADD GAME</button>
        <button style={{...styles.button, backgroundColor: palette.accent}} onClick={handleSpinIt}>SPIN IT!</button>
      </div>

      {showAddGameForm && (
        <div style={styles.modal}>
          <h2>Add New Game</h2>
          <form onSubmit={handleAddGame}>
            <input style={styles.formInput} value={newGame.title} onChange={(e) => setNewGame({...newGame, title: e.target.value})} placeholder="Title" />
            <input style={styles.formInput} value={newGame.price} onChange={(e) => setNewGame({...newGame, price: e.target.value})} placeholder="Price" />
            <input style={styles.formInput} value={newGame.platform} onChange={(e) => setNewGame({...newGame, platform: e.target.value})} placeholder="Platform" />
            <button type="submit" style={styles.button}>Save</button>
            <button type="button" style={{...styles.button, backgroundColor: 'transparent', color: palette.black}} onClick={() => setShowAddGameForm(false)}>Cancel</button>
          </form>
        </div>
      )}

      {showSpinModal && (
        <div style={styles.modal}>
          {isSpinning && unplayedGames.length > 0 ? (
            // @ts-expect-error typing
            <SpinWheel games={unplayedGames} onSpinEnd={handleSpinEnd} />
          ) : selectedGame ? (
            <div>
              <h2 style={{ marginTop: 0 }}>You're Playing:</h2>
              <h3 style={{ fontSize: '2.5rem', margin: '1rem 0', color: palette.primary }}>{selectedGame.title}</h3>
              <p>({selectedGame.platform})</p>
              <button style={styles.button} onClick={() => setShowSpinModal(false)}>AWESOME!</button>
            </div>
          ) : null}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div style={styles.section}>
          <h2 style={{ marginTop: 0 }}>Your Games ({unplayedGames.length})</h2>
          {unplayedGames.map((game) => (
            <div key={game.id} style={styles.gameItem}>
              <span>{game.title}</span>
            </div>
          ))}
        </div>

        <div style={styles.section}>
          <h2 style={{ marginTop: 0 }}>Already Played ({playedGames.length})</h2>
          {playedGames.map((game) => (
            <div key={game.id} style={styles.gameItem}>
              <span>{game.title}</span>
              <button style={{...styles.button, padding: '0.25rem 0.5rem', boxShadow: `2px 2px 0 ${palette.black}`, backgroundColor: palette.accent}} onClick={() => handleMoveToUnplayed(game)}>Play Again</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
