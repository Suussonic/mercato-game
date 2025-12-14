'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Space, Typography, Tag, App } from 'antd';
import { Room, Player } from '@/types';
import { ClientGameState } from '@/lib/clientGameState';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

interface WaitingRoomProps {
  room: Room;
  currentPlayer: Player;
  onStartConfig: () => void;
}

export default function WaitingRoom({ room, currentPlayer, onStartConfig }: WaitingRoomProps) {
  const [localRoom, setLocalRoom] = useState(room);
  const { message } = App.useApp();
  const { t } = useTranslation();

  useEffect(() => {
    // Poll for room updates (waiting room is less time-critical)
    const interval = setInterval(async () => {
      const updatedRoom = await ClientGameState.getRoom(room.code);
      if (updatedRoom) {
        setLocalRoom(updatedRoom);
      }
    }, 3000); // 3 seconds - less frequent for waiting room

    return () => clearInterval(interval);
  }, [room.code]);

  const isHost = currentPlayer.id === room.hostId;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.code);
    message.success(t('codeCopied'));
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <Space orientation="vertical" className="w-full" size="large">
          <div className="text-center">
            <Title level={2}>{t('waitingRoom')}</Title>
            <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mb-4">
              <Text type="secondary" className="block mb-2">{t('shareCode')}</Text>
              <Space>
                <Text className="text-2xl font-bold tracking-wider">{room.code}</Text>
                <Button type="primary" onClick={handleCopyCode}>{t('copyCode')}</Button>
              </Space>
              {room.isPrivate && (
                <div className="mt-2">
                  <Tag color="red">{t('privateRoomTag')}</Tag>
                  <Text type="secondary" className="text-sm block mt-1">{t('needPassword')}</Text>
                </div>
              )}
            </div>
          </div>

          <Card title={`${t('players')} (${localRoom.players.length})`}>
            <div className="space-y-2">
              {localRoom.players.map((player) => (
                <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <Space>
                    <Text strong>{player.name}</Text>
                    {player.id === room.hostId && <Tag color="gold">{t('host')}</Tag>}
                  </Space>
                </div>
              ))}
            </div>
          </Card>

          {isHost ? (
            <>
              <Button 
                type="primary" 
                size="large" 
                block 
                onClick={onStartConfig}
                disabled={localRoom.players.length < 2}
              >
                {t('configureGame')}
              </Button>
              {localRoom.players.length < 2 && (
                <Text type="secondary" className="text-center block text-sm">
                  Au moins 2 joueurs sont nécessaires pour commencer
                </Text>
              )}
            </>
          ) : (
            <Text type="secondary" className="text-center block">
              {t('waitingForHost')}
            </Text>
          )}
        </Space>
      </Card>
    </div>
  );
}
