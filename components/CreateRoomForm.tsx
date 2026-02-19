'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Form, Input, Button, Switch, App } from 'antd';
import { ClientGameState } from '@/lib/clientGameState';
import { useTranslation } from 'react-i18next';

interface CreateRoomFormProps {
  onRoomCreated: () => void;
}

export default function CreateRoomForm({ onRoomCreated }: CreateRoomFormProps) {
  const router = useRouter();
  const [form] = Form.useForm();
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();
  const { t } = useTranslation();

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const result = await ClientGameState.createRoom(
        values.playerName,
        isPrivate,
        values.password
      );
      
      if (!result) {
        message.error(t('errorCreatingRoom'));
        return;
      }
      
      const { room, player } = result;
      ClientGameState.savePlayer(player);
      
      message.success(`${t('roomCreated')} ${room.code}`);
      router.push(`/room/${room.code}`);
      onRoomCreated();
    } catch (error) {
      message.error(t('errorCreatingRoom'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={t('createRoom')} className="ui-panel-md">
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="playerName"
          label={t('yourName')}
          rules={[
            { required: true, message: t('enterYourName') },
            { min: 2, message: 'Le nom doit contenir au moins 2 caractères' },
            { max: 20, message: 'Le nom ne peut pas dépasser 20 caractères' },
            { 
              pattern: /^[a-zA-Z0-9À-ſ\s]+$/, 
              message: 'Le nom ne peut contenir que des lettres et chiffres' 
            }
          ]}
        >
          <Input placeholder={t('enterYourName')} size="large" maxLength={20} />
        </Form.Item>

        <Form.Item label={t('privateRoom')}>
          <Switch checked={isPrivate} onChange={setIsPrivate} />
        </Form.Item>

        {isPrivate && (
          <Form.Item
            name="password"
            label={t('password')}
            rules={[{ required: true, message: t('password') }]}
          >
            <Input.Password placeholder={t('password')} size="large" />
          </Form.Item>
        )}

        <Form.Item>
          <Button type="primary" htmlType="submit" block size="large" loading={loading}>
            {t('createRoomButton')}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
