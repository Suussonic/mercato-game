'use client';

import { useState, useEffect } from 'react';
import { Card, Button, InputNumber, Space, Typography, Tag, Progress, Avatar, App } from 'antd';
import { TrophyOutlined, ClockCircleOutlined, DollarOutlined } from '@ant-design/icons';
import { Room, Player } from '@/types';
import { ClientGameState } from '@/lib/clientGameState';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

interface GameBoardProps {
  room: Room;
  currentPlayer: Player;
  onGameEnd: () => void;
}

export default function GameBoard({ room, currentPlayer, onGameEnd }: GameBoardProps) {
  const [betAmount, setBetAmount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [localRoom, setLocalRoom] = useState(room);
  const { message } = App.useApp();
  const { t } = useTranslation();

  useEffect(() => {
    setLocalRoom(room);
  }, [room]);

  useEffect(() => {
    if (!localRoom.gameState?.timerEndTime) return;

    let hasAutoResolved = false;

    const interval = setInterval(async () => {
      const remaining = Math.max(0, Math.floor((localRoom.gameState!.timerEndTime! - Date.now()) / 1000));
      setTimeRemaining(remaining);
      
      // Auto-resolve turn when timer reaches 0 (only once)
      if (remaining === 0 && !hasAutoResolved && localRoom.status === 'playing') {
        hasAutoResolved = true;
        const updatedRoom = await ClientGameState.resolveTurn(room.code);
        if (updatedRoom) {
          setLocalRoom(updatedRoom);
          setBetAmount(0);
          if (updatedRoom.status === 'voting') {
            onGameEnd();
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [localRoom.gameState?.timerEndTime, localRoom.status, room.code, onGameEnd]);

  const handlePlaceBet = async () => {
    // Validate bet amount is a valid number
    if (!Number.isFinite(betAmount) || betAmount <= 0) {
      message.error('Veuillez entrer une mise valide');
      return;
    }

    if (betAmount > currentPlayer.balance) {
      message.error('Mise trop élevée');
      return;
    }

    // Check if player is trying to lower their current bet
    if (currentPlayerData && currentPlayerData.currentBet > 0 && betAmount < currentPlayerData.currentBet) {
      message.error(`Vous ne pouvez pas miser moins que votre mise actuelle (${currentPlayerData.currentBet})`);
      return;
    }

    // Check if player has reached character limit
    if (currentPlayerData && localRoom.config && 
        currentPlayerData.characters.length >= localRoom.config.charactersPerPlayer) {
      message.error(`Vous avez atteint la limite de ${localRoom.config.charactersPerPlayer} personnages`);
      return;
    }

    const updatedRoom = await ClientGameState.placeBet(room.code, currentPlayer.id, betAmount);
    if (updatedRoom) {
      message.success(`Mise de ${betAmount} placée`);
      setLocalRoom(updatedRoom);
    } else {
      message.error('Impossible de placer la mise');
    }
  };

  const handleFold = async () => {
    const updatedRoom = await ClientGameState.foldPlayer(room.code, currentPlayer.id);
    if (updatedRoom) {
      message.info('Vous vous êtes couché');
      setLocalRoom(updatedRoom);
    }
  };

  const handleEndTurn = async () => {
    const updatedRoom = await ClientGameState.resolveTurn(room.code);
    if (updatedRoom) {
      setLocalRoom(updatedRoom);
      setBetAmount(0);

      if (updatedRoom.status === 'voting') {
        onGameEnd();
      }
    }
  };

  const handleEndGame = async () => {
    // First resolve the current turn to process all bets
    const resolvedRoom = await ClientGameState.resolveTurn(room.code);
    if (!resolvedRoom) {
      message.error('Impossible de résoudre le tour');
      return;
    }
    
    // Check if we're still in playing phase (not already moved to voting)
    if (resolvedRoom.status === 'playing') {
      // Now end the game and go to voting
      const updatedRoom = await ClientGameState.endGame(resolvedRoom.code);
      if (updatedRoom) {
        message.success('Partie terminée, passage au vote');
        setLocalRoom(updatedRoom);
        onGameEnd();
      }
    } else {
      // Already in voting phase after resolve
      message.success('Passage au vote');
      setLocalRoom(resolvedRoom);
      onGameEnd();
    }
  };

  const isHost = currentPlayer.id === room.hostId;
  const currentPlayerData = localRoom.players.find(p => p.id === currentPlayer.id);
  const hasFolded = currentPlayerData?.hasFolded || false;
  const maxBet = Math.max(...localRoom.players.map(p => p.currentBet));

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <Title level={3} className="!mb-0">
              Tour {localRoom.gameState?.currentTurn} / {localRoom.config?.numberOfTurns}
            </Title>
            <Text type="secondary">Room: {room.code}</Text>
          </div>
          
          <div className="flex items-center gap-4">
            <Tag icon={<ClockCircleOutlined />} color="blue" className="text-lg px-4 py-2">
              {timeRemaining}s
            </Tag>
            {isHost && (
              <Button type="primary" danger onClick={handleEndGame}>
                Terminer la Partie
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Current Character */}
      {localRoom.gameState?.currentCharacter && (
        <Card className="text-center">
          <div className="flex flex-col items-center gap-4">
            <img
              src={localRoom.gameState.currentCharacter.imageUrl}
              alt={localRoom.gameState.currentCharacter.name}
              className="w-full max-w-md h-64 object-contain"
            />
            <Title level={2}>{localRoom.gameState.currentCharacter.name}</Title>
            {maxBet > 0 && (
              <Tag color="gold" className="text-lg px-4 py-2">
                Mise la plus haute: {maxBet}
              </Tag>
            )}
          </div>
        </Card>
      )}

      {/* Betting Interface */}
      {!hasFolded && (
        <Card title="Votre Mise">
          <Space orientation="vertical" className="w-full" size="large">
            <div>
              <Text strong>Solde disponible: </Text>
              <Text className="text-xl">{currentPlayerData?.balance || 0}</Text>
            </div>
            
            <div className="flex gap-4 flex-wrap">
              <InputNumber
                min={currentPlayerData?.currentBet || 0}
                max={currentPlayerData?.balance || 0}
                value={betAmount}
                onChange={(value) => {
                  const newValue = value || 0;
                  // Ensure value doesn't exceed balance and isn't below current bet
                  const minValue = currentPlayerData?.currentBet || 0;
                  const maxValue = currentPlayerData?.balance || 0;
                  setBetAmount(Math.max(minValue, Math.min(newValue, maxValue)));
                }}
                size="large"
                className="flex-1 min-w-[200px]"
                placeholder="Entrez votre mise"
              />
              <Button 
                type="primary" 
                size="large" 
                onClick={handlePlaceBet}
                disabled={betAmount <= 0 || betAmount > (currentPlayerData?.balance || 0)}
              >
                Placer la Mise
              </Button>
              <Button size="large" onClick={handleFold}>
                Se Coucher
              </Button>
            </div>

            {currentPlayerData?.currentBet && currentPlayerData.currentBet > 0 && (
              <Tag color="green" className="text-lg px-4 py-2">
                Mise actuelle: {currentPlayerData.currentBet}
              </Tag>
            )}
          </Space>
        </Card>
      )}

      {hasFolded && (
        <Card>
          <Text type="secondary" className="text-lg">
            Vous vous êtes couché pour ce tour
          </Text>
        </Card>
      )}

      {/* Players */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {localRoom.players.map(player => (
          <Card
            key={player.id}
            className={player.id === currentPlayer.id ? 'border-2 border-blue-500' : ''}
          >
            <Space orientation="vertical" className="w-full">
              <div className="flex justify-between items-center">
                <Text strong className="text-lg">
                  {player.name}
                  {player.id === room.hostId && <Tag color="gold" className="ml-2">Chef</Tag>}
                </Text>
                <Text><DollarOutlined className="mr-1" />{player.balance}</Text>
              </div>

              {player.currentBet > 0 && (
                <Tag color="blue">Mise: {player.currentBet}</Tag>
              )}

              {player.hasFolded && (
                <Tag color="red">Couché</Tag>
              )}

              {player.characters.length > 0 && (
                <div>
                  <Text type="secondary" className="block mb-2">Personnages:</Text>
                  <div className="flex flex-wrap gap-2">
                    {player.characters.map((char, idx) => (
                      <div key={`${player.id}-${idx}-${char.name}`} title={char.name}>
                        <Avatar
                          src={char.imageUrl}
                          size={48}
                          shape="square"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Space>
          </Card>
        ))}
      </div>

      {isHost && (
        <Card>
          <Button type="default" block size="large" onClick={handleEndTurn}>
            Passer au Tour Suivant
          </Button>
        </Card>
      )}
    </div>
  );
}
