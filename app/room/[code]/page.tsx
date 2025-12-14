'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Layout, Space, Spin, Result, Button } from 'antd';
import { LoadingOutlined, HomeOutlined } from '@ant-design/icons';
import AppHeader from '@/components/AppHeader';
import WaitingRoom from '@/components/WaitingRoom';
import GameConfigForm from '@/components/GameConfigForm';
import GameBoard from '@/components/GameBoard';
import VotingPhase from '@/components/VotingPhase';
import { ClientGameState } from '@/lib/clientGameState';
import { Room, Player, GameConfig } from '@/types';
import { useTranslation } from 'react-i18next';

const { Content } = Layout;

type GamePhase = 'loading' | 'waiting' | 'configuring' | 'playing' | 'voting' | 'finished' | 'not-found';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const roomCode = (params.code as string)?.toUpperCase();

  const [phase, setPhase] = useState<GamePhase>('loading');
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

  useEffect(() => {
    const init = async () => {
      if (!roomCode) {
        setPhase('not-found');
        return;
      }

      // Fetch room from API
      const room = await ClientGameState.getRoom(roomCode);
      
      if (!room) {
        setPhase('not-found');
        return;
      }

      // Get player from localStorage
      const savedPlayer = ClientGameState.getPlayer();
      if (!savedPlayer || savedPlayer.roomCode !== roomCode) {
        setPhase('not-found');
        return;
      }

      // Find player in room
      const playerInRoom = room.players.find(p => p.id === savedPlayer.id);
      if (!playerInRoom) {
        setPhase('not-found');
        return;
      }

      setCurrentRoom(room);
      setCurrentPlayer(playerInRoom);
      setPhase(room.status === 'waiting' ? 'waiting' : room.status);
    };

    init();
  }, [roomCode]);

  // Poll for room updates
  useEffect(() => {
    if (!roomCode || !currentRoom) return;

    // Don't poll if host is configuring (local state)
    if (phase === 'configuring' && currentPlayer?.id === currentRoom.hostId) {
      return;
    }

    const interval = setInterval(async () => {
      // Check API for updates
      const updatedRoom = await ClientGameState.getRoom(roomCode);
      if (updatedRoom) {
        setCurrentRoom(updatedRoom);
        
        // Update phase based on server status
        setPhase(updatedRoom.status === 'waiting' ? 'waiting' : updatedRoom.status);
        
        // Update player if they exist in the room
        const updatedPlayer = updatedRoom.players.find(p => p.id === currentPlayer?.id);
        if (updatedPlayer) {
          setCurrentPlayer(updatedPlayer);
        }
      }
    }, 2000); // Reduced from 1s to 2s

    return () => clearInterval(interval);
  }, [roomCode, currentRoom, currentPlayer, phase]);

  const handleStartConfig = () => {
    setPhase('configuring');
  };

  const handleConfigComplete = async (config: GameConfig) => {
    if (!currentRoom) return;
    
    await ClientGameState.configureGame(currentRoom.code, config);
    const updatedRoom = await ClientGameState.startGame(currentRoom.code);
    
    if (updatedRoom) {
      setCurrentRoom(updatedRoom);
      setPhase('playing');
    }
  };

  const handleGameEnd = async () => {
    const updatedRoom = await ClientGameState.getRoom(currentRoom!.code);
    if (updatedRoom) {
      setCurrentRoom(updatedRoom);
      setPhase(updatedRoom.status);
    }
  };

  const handleGoHome = () => {
    ClientGameState.clearPlayer();
    router.push('/');
  };

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <AppHeader />

      <Content className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {phase === 'loading' && (
            <div className="flex justify-center items-center min-h-[400px]">
              <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
            </div>
          )}

          {phase === 'not-found' && (
            <Result
              status="404"
              title={t('roomNotFound')}
              subTitle={t('roomNotFoundDescription')}
              extra={
                <Button type="primary" icon={<HomeOutlined />} onClick={handleGoHome}>
                  {t('backToHome')}
                </Button>
              }
            />
          )}

          {phase === 'waiting' && currentRoom && currentPlayer && (
            <WaitingRoom
              room={currentRoom}
              currentPlayer={currentPlayer}
              onStartConfig={handleStartConfig}
            />
          )}

          {phase === 'configuring' && (
            <div className="flex justify-center">
              <GameConfigForm onConfigComplete={handleConfigComplete} />
            </div>
          )}

          {phase === 'playing' && currentRoom && currentPlayer && (
            <GameBoard
              room={currentRoom}
              currentPlayer={currentPlayer}
              onGameEnd={handleGameEnd}
            />
          )}

          {(phase === 'voting' || phase === 'finished') && currentRoom && currentPlayer && (
            <VotingPhase
              room={currentRoom}
              currentPlayer={currentPlayer}
            />
          )}
        </div>
      </Content>
    </Layout>
  );
}
