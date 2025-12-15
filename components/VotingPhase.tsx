'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Space, Typography, Tag, Avatar, Progress, App } from 'antd';
import { TrophyOutlined, ClockCircleOutlined, CheckCircleOutlined, CrownOutlined, DollarOutlined, TeamOutlined, HomeOutlined, ReloadOutlined, SettingOutlined } from '@ant-design/icons';
import { Room, Player } from '@/types';
import { ClientGameState } from '@/lib/clientGameState';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

interface VotingPhaseProps {
  room: Room;
  currentPlayer: Player;
}

export default function VotingPhase({ room, currentPlayer }: VotingPhaseProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [localRoom, setLocalRoom] = useState(room);
  const [hasVoted, setHasVoted] = useState(false);
  const { message } = App.useApp();
  const { t } = useTranslation();
  const router = useRouter();
  const isHost = currentPlayer.id === room.hostId;

  useEffect(() => {
    setLocalRoom(room);
  }, [room]);

  useEffect(() => {
    if (!localRoom.gameState?.voteTimerEndTime || localRoom.status === 'finished') return;

    let hasEnded = false;

    const interval = setInterval(async () => {
      const remaining = Math.max(0, Math.floor((localRoom.gameState!.voteTimerEndTime! - Date.now()) / 1000));
      setTimeRemaining(remaining);

      // When time runs out, force end the voting (only once)
      if (remaining === 0 && localRoom.status === 'voting' && !hasEnded) {
        hasEnded = true;
        const updatedRoom = await ClientGameState.endVote(room.code);
        if (updatedRoom) {
          setLocalRoom(updatedRoom);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [localRoom.gameState?.voteTimerEndTime, localRoom.status, room.code]);

  const handleVote = async () => {
    if (!selectedPlayer) {
      message.error(t('selectPlayer'));
      return;
    }

    const updatedRoom = await ClientGameState.vote(room.code, currentPlayer.id, selectedPlayer);
    if (updatedRoom) {
      message.success(t('voted'));
      setHasVoted(true);
      setLocalRoom(updatedRoom);
    }
  };

  const handleGoHome = () => {
    ClientGameState.clearPlayer();
    router.push('/');
  };

  const handleRestartGame = async () => {
    if (!localRoom.config) return;
    
    // Reset game with same config
    const updatedRoom = await ClientGameState.configureGame(room.code, localRoom.config);
    if (updatedRoom) {
      const startedRoom = await ClientGameState.startGame(room.code);
      if (startedRoom) {
        message.success('Nouvelle partie lancée !');
        window.location.reload();
      }
    }
  };

  const handleReconfigure = () => {
    router.push(`/room/${room.code}`);
    window.location.reload();
  };

  const getVoteCount = (playerId: string): number => {
    return Object.values(localRoom.gameState?.votes || {}).filter(id => id === playerId).length;
  };

  const sortedPlayers = [...localRoom.players].sort((a, b) => {
    // First by votes
    const voteDiff = getVoteCount(b.id) - getVoteCount(a.id);
    if (voteDiff !== 0) return voteDiff;
    
    // Then by number of characters
    const charDiff = b.characters.length - a.characters.length;
    if (charDiff !== 0) return charDiff;
    
    // Finally by remaining balance
    return b.balance - a.balance;
  });

  const winner = localRoom.status === 'finished' ? sortedPlayers[0] : null;
  const totalVotes = Object.keys(localRoom.gameState?.votes || {}).length;
  const voteProgress = (totalVotes / localRoom.players.length) * 100;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <div className="flex justify-between items-center flex-wrap gap-4">
          <Title level={2} className="!mb-0">
            {localRoom.status === 'finished' ? (
              <><TrophyOutlined className="mr-2" />{t('results')}</>
            ) : (
              <><CheckCircleOutlined className="mr-2" />{t('votingPhase')}</>
            )}
          </Title>
          
          {localRoom.status === 'voting' && (
            <Tag icon={<ClockCircleOutlined />} color="blue" className="text-lg px-4 py-2">
              {timeRemaining}s
            </Tag>
          )}
        </div>

        {localRoom.status === 'voting' && (
          <div className="mt-4">
            <Text>{t('votes')}: {totalVotes} / {localRoom.players.length}</Text>
            <Progress percent={voteProgress} status="active" />
          </div>
        )}
      </Card>

      {/* Winner Announcement */}
      {localRoom.status === 'finished' && winner && (
        <Card className="text-center bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800">
          <Space orientation="vertical" size="large" className="w-full">
            <TrophyOutlined className="text-6xl text-yellow-500" />
            <Title level={2}><CrownOutlined className="mr-2" />{winner.name} {t('winner')}<CrownOutlined className="ml-2" /></Title>
            <Text className="text-lg">
              {getVoteCount(winner.id)} {t('votes')}
            </Text>
          </Space>
        </Card>
      )}

      {/* Voting Interface */}
      {localRoom.status === 'voting' && !hasVoted && (
        <Card title={t('voteForWinner')}>
          <Space orientation="vertical" className="w-full" size="large">
            <Text>{t('selectPlayer')}</Text>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {localRoom.players
                .map(player => (
                  <Card
                    key={player.id}
                    hoverable
                    className={selectedPlayer === player.id ? 'border-2 border-blue-500' : ''}
                    onClick={() => setSelectedPlayer(player.id)}
                  >
                    <Space orientation="vertical" className="w-full">
                      <Text strong className="text-lg">{player.name}</Text>
                      <Text><DollarOutlined className="mr-1" />{t('finalBalance')}: {player.balance}</Text>
                      <Text><TeamOutlined className="mr-1" />{t('charactersLabel')}: {player.characters.length}</Text>
                      
                      <div className="flex flex-wrap gap-2">
                        {player.characters.map((char, idx) => (
                          <div key={idx} title={char.name}>
                            <Avatar
                              src={char.imageUrl}
                              size={48}
                              shape="square"
                            />
                          </div>
                        ))}
                      </div>
                    </Space>
                  </Card>
                ))}
            </div>

            <Button
              type="primary"
              size="large"
              block
              onClick={handleVote}
              disabled={!selectedPlayer}
            >
              {t('confirmVote')}
            </Button>
          </Space>
        </Card>
      )}

      {hasVoted && localRoom.status === 'voting' && (
        <Card>
          <Text className="text-lg"><CheckCircleOutlined className="mr-2 text-green-500" />{t('voted')}</Text>
        </Card>
      )}

      {/* Leaderboard */}
      <Card title={t('leaderboard')}>
        <Space orientation="vertical" className="w-full" size="middle">
          {sortedPlayers.map((player, index) => (
            <Card key={player.id} size="small">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <Space orientation="vertical">
                  <Space>
                    <Text strong className="text-xl">
                      #{index + 1} {player.name}
                    </Text>
                    {player.id === room.hostId && <Tag color="gold">Chef</Tag>}
                    {localRoom.status === 'finished' && index === 0 && (
                      <TrophyOutlined className="text-2xl text-yellow-500" />
                    )}
                  </Space>
                  
                  <div className="flex gap-4 flex-wrap">
                    <Text><DollarOutlined className="mr-1" />{player.balance}</Text>
                    <Text><TeamOutlined className="mr-1" />{player.characters.length} {t('charactersCount')}</Text>
                    {localRoom.status === 'finished' && (
                      <Text><CheckCircleOutlined className="mr-1" />{getVoteCount(player.id)} {t('votes')}</Text>
                    )}
                  </div>
                </Space>

                {player.characters.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {player.characters.map((char, idx) => (
                      <div key={idx} title={char.name}>
                        <Avatar
                          src={char.imageUrl}
                          size={48}
                          shape="square"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </Space>
      </Card>

      {/* Actions after game ends */}
      {localRoom.status === 'finished' && (
        <Card>
          <Space orientation="vertical" className="w-full" size="large">
            {isHost ? (
              <>
                <Title level={4}>Actions du Chef</Title>
                <Space wrap className="w-full">
                  <Button 
                    type="primary" 
                    icon={<ReloadOutlined />}
                    size="large"
                    onClick={handleRestartGame}
                  >
                    Recommencer avec la même config
                  </Button>
                  <Button 
                    icon={<SettingOutlined />}
                    size="large"
                    onClick={handleReconfigure}
                  >
                    Changer la configuration
                  </Button>
                  <Button 
                    icon={<HomeOutlined />}
                    size="large"
                    onClick={handleGoHome}
                  >
                    Retour à l'accueil
                  </Button>
                </Space>
              </>
            ) : (
              <Button 
                icon={<HomeOutlined />}
                size="large"
                block
                onClick={handleGoHome}
              >
                Retour à l'accueil
              </Button>
            )}
          </Space>
        </Card>
      )}
    </div>
  );
}
