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
    <div className="ui-game-wrapper">
      {/* Header */}
      <Card>
        <div className="ui-game-header-row">
          <Title level={2} className="ui-title-no-margin">
            {localRoom.status === 'finished' ? (
              <><TrophyOutlined className="ui-icon-leading" />{t('results')}</>
            ) : (
              <><CheckCircleOutlined className="ui-icon-leading" />{t('votingPhase')}</>
            )}
          </Title>
          
          {localRoom.status === 'voting' && (
            <Tag icon={<ClockCircleOutlined />} color="blue" className="ui-tag-lg">
              {timeRemaining}s
            </Tag>
          )}
        </div>

        {localRoom.status === 'voting' && (
          <div className="ui-vote-progress">
            <Text>{t('votes')}: {totalVotes} / {localRoom.players.length}</Text>
            <Progress percent={voteProgress} status="active" />
          </div>
        )}
      </Card>

      {/* Winner Announcement */}
      {localRoom.status === 'finished' && winner && (
        <Card className="ui-winner-card">
          <Space orientation="vertical" size="large" className="ui-space-full">
            <TrophyOutlined className="ui-trophy-large" />
            <Title level={2}><CrownOutlined className="ui-icon-leading" />{winner.name} {t('winner')}<CrownOutlined className="ui-icon-trailing" /></Title>
            <Text className="ui-text-lg">
              {getVoteCount(winner.id)} {t('votes')}
            </Text>
          </Space>
        </Card>
      )}

      {/* Voting Interface */}
      {localRoom.status === 'voting' && !hasVoted && (
        <Card title={t('voteForWinner')}>
          <Space orientation="vertical" className="ui-space-full" size="large">
            <Text>{t('selectPlayer')}</Text>
            
            <div className="ui-vote-grid">
              {localRoom.players
                .map(player => (
                  <Card
                    key={player.id}
                    hoverable
                    className={selectedPlayer === player.id ? 'ui-selected-card' : ''}
                    onClick={() => setSelectedPlayer(player.id)}
                  >
                    <Space orientation="vertical" className="ui-space-full">
                      <Text strong className="ui-text-lg">{player.name}</Text>
                      <Text><DollarOutlined className="ui-icon-inline" />{t('finalBalance')}: {player.balance}</Text>
                      <Text><TeamOutlined className="ui-icon-inline" />{t('charactersLabel')}: {player.characters.length}</Text>
                      
                      <div className="ui-avatars-row">
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
          <Text className="ui-voted-text"><CheckCircleOutlined className="ui-ok-icon" />{t('voted')}</Text>
        </Card>
      )}

      {/* Leaderboard */}
      <Card title={t('leaderboard')}>
        <Space orientation="vertical" className="ui-space-full" size="middle">
          {sortedPlayers.map((player, index) => (
            <Card key={player.id} size="small">
              <div className="ui-vote-card-head">
                <Space orientation="vertical">
                  <Space>
                    <Text strong className="ui-title-xl">
                      #{index + 1} {player.name}
                    </Text>
                    {player.id === room.hostId && <Tag color="gold">Chef</Tag>}
                    {localRoom.status === 'finished' && index === 0 && (
                      <TrophyOutlined className="ui-title-2xl-gold" />
                    )}
                  </Space>
                  
                  <div className="ui-vote-stats">
                    <Text><DollarOutlined className="ui-icon-inline" />{player.balance}</Text>
                    <Text><TeamOutlined className="ui-icon-inline" />{player.characters.length} {t('charactersCount')}</Text>
                    {localRoom.status === 'finished' && (
                      <Text><CheckCircleOutlined className="ui-icon-inline" />{getVoteCount(player.id)} {t('votes')}</Text>
                    )}
                  </div>
                </Space>

                {player.characters.length > 0 && (
                  <div className="ui-avatars-row">
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
          <Space orientation="vertical" className="ui-space-full" size="large">
            {isHost ? (
              <>
                <Title level={4}>Actions du Chef</Title>
                <Space wrap className="ui-space-full">
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
