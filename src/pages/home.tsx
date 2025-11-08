import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { ref, onValue, push, update, remove } from 'firebase/database';
import { BrutalistBackground } from '../components/BrutalistBackground';
import { SpinWheel } from '../components/SpinWheel';
import './home.css';

// --- Interfaces ---
interface Game {
  id: string;
  title:string;
  price: string;
  platform: string;
  isAlreadyPlayed: boolean;
}

export const HomePage = () => {
  const [unplayedGames, setUnplayedGames] = useState<Game[]>([]);
  const [playedGames, setPlayedGames] = useState<Game[]>([]);
  const [showGameForm, setShowGameForm] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [gameFormData, setGameFormData] = useState({ title: '', price: '', platform: '' });
  
  const [showSpinModal, setShowSpinModal] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  useEffect(() => {
    const gamesRef = ref(db, 'games');
    onValue(gamesRef, (snapshot) => {
      const data = snapshot.val();
      const allGames: Game[] = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      setUnplayedGames(allGames.filter(game => !game.isAlreadyPlayed));
      setPlayedGames(allGames.filter(game => game.isAlreadyPlayed));
    });
  }, []);

  const handleSaveGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameFormData.title) return alert('Title is required.');

    if (editingGame) {
      // Update existing game
      const gameRef = ref(db, `games/${editingGame.id}`);
      update(gameRef, { ...editingGame, ...gameFormData });
    } else {
      // Add new game
      push(ref(db, 'games'), { ...gameFormData, isAlreadyPlayed: false });
    }
    
    closeForm();
  };

  const handleDeleteGame = (gameId: string) => {
    if (window.confirm('Are you sure you want to delete this game?')) {
      remove(ref(db, `games/${gameId}`));
    }
  };

  const openFormForUpdate = (game: Game) => {
    setEditingGame(game);
    setGameFormData({ title: game.title, price: game.price, platform: game.platform });
    setShowGameForm(true);
  };

  const openFormForAdd = () => {
    setEditingGame(null);
    setGameFormData({ title: '', price: '', platform: '' });
    setShowGameForm(true);
  };

  const closeForm = () => {
    setEditingGame(null);
    setGameFormData({ title: '', price: '', platform: '' });
    setShowGameForm(false);
  };

  const handleSpinEnd = async (game: Game) => {
    const gameRef = ref(db, `games/${game.id}`);
    await update(gameRef, { isAlreadyPlayed: true, playedAt: new Date().toISOString() });
    setSelectedGame(game);
    setIsSpinning(false);

    setTimeout(() => {
      setShowSpinModal(false);
    }, 4000);
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
    <div className="container">
      <BrutalistBackground />
      <header className="header">
        <h1 className="title">GAME SELECTOR</h1>
      </header>

      <div className="buttonGroup">
        <button className="button" onClick={openFormForAdd}>+ ADD GAME</button>
        <button className="button accent" onClick={handleSpinIt}>SPIN IT!</button>
      </div>

      {showGameForm && (
        <div className="modal formModal">
          <h2 className="section-title">{editingGame ? 'Update Game' : 'Add New Game'}</h2>
          <form onSubmit={handleSaveGame}>
            <input className="formInput" value={gameFormData.title} onChange={(e) => setGameFormData({...gameFormData, title: e.target.value})} placeholder="Title" />
            <input className="formInput" value={gameFormData.price} onChange={(e) => setGameFormData({...gameFormData, price: e.target.value})} placeholder="Price" />
            <input className="formInput" value={gameFormData.platform} onChange={(e) => setGameFormData({...gameFormData, platform: e.target.value})} placeholder="Platform" />
            <button type="submit" className="button">Save</button>
            <button type="button" className="button transparent" onClick={closeForm}>Cancel</button>
          </form>
        </div>
      )}

      {showSpinModal && (
        <div className="modal spinModal">
          {isSpinning && unplayedGames.length > 0 ? (
            <SpinWheel games={unplayedGames} onSpinEnd={handleSpinEnd} />
          ) : selectedGame ? (
            <div>
              <h2 className="section-title">You're Playing:</h2>
              <h3 className="selected-game-title">{selectedGame.title}</h3>
              <p className="selected-game-platform">({selectedGame.platform})</p>
            </div>
          ) : null}
        </div>
      )}

      <div className="gameGrid">
        <div className="section">
          <h2 className="section-title">Your Games ({unplayedGames.length})</h2>
          {unplayedGames.map((game) => (
            <div key={game.id} className="gameItem">
              <span>{game.title}</span>
              <div className="gameItemActions">
                <button className="button small" onClick={() => openFormForUpdate(game)}>Update</button>
                <button className="button small danger" onClick={() => handleDeleteGame(game.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>

        <div className="section">
          <h2 className="section-title">Already Played ({playedGames.length})</h2>
          {playedGames.map((game) => (
            <div key={game.id} className="gameItem">
              <span>{game.title}</span>
              <button className="button small accent" onClick={() => handleMoveToUnplayed(game)}>Play Again</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
