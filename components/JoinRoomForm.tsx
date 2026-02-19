'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Form, Input, Button, App, Modal } from 'antd';
import { ClientGameState } from '@/lib/clientGameState';
import { useTranslation } from 'react-i18next';

interface JoinRoomFormProps {
  onRoomJoined: () => void;
}

export default function JoinRoomForm({ onRoomJoined }: JoinRoomFormProps) {
  const router = useRouter();
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingJoin, setPendingJoin] = useState<{ roomCode: string; playerName: string } | null>(null);
  const { message, modal } = App.useApp();
  const { t } = useTranslation();

  const handleCheckRoom = async () => {
    const roomCode = form.getFieldValue('roomCode')?.toUpperCase();
    if (!roomCode) {
      message.error(t('enterCode'));
      return;
    }

    const room = await ClientGameState.getRoom(roomCode);
    if (!room) {
      message.error(t('roomNotFound'));
      return;
    }

    message.success(t('roomFound'));
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const roomCode = values.roomCode?.toUpperCase();
      
      // Vérifier si la room est privée
      const room = await ClientGameState.getRoom(roomCode);
      if (!room) {
        message.error(t('roomNotFound'));
        return;
      }

      if (room.isPrivate) {
        // Afficher la modal pour le mot de passe
        setPendingJoin({ roomCode, playerName: values.playerName });
        setShowPasswordModal(true);
        setLoading(false);
        return;
      }

      // Rejoindre directement si pas privée
      const result = await ClientGameState.joinRoom(roomCode, values.playerName);
      
      if (!result) {
        message.error(t('roomNotFound'));
        return;
      }
      
      ClientGameState.savePlayer(result.player);
      
      message.success(t('joinedRoom'));
      router.push(`/room/${roomCode}`);
      onRoomJoined();
    } catch (error: any) {
      message.error(t('errorJoining'));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!pendingJoin) return;

    try {
      const values = await passwordForm.validateFields();
      setLoading(true);

      const result = await ClientGameState.joinRoom(
        pendingJoin.roomCode,
        pendingJoin.playerName,
        values.password
      );
      
      if (!result) {
        message.error(t('roomNotFound'));
        return;
      }
      
      ClientGameState.savePlayer(result.player);
      
      message.success(t('joinedRoom'));
      setShowPasswordModal(false);
      router.push(`/room/${pendingJoin.roomCode}`);
      onRoomJoined();
    } catch (error: any) {
      if (error.message?.includes('password')) {
        message.error('Mot de passe incorrect');
      } else {
        message.error(t('errorJoining'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={t('joinRoom')} className="ui-panel-md">
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="roomCode"
          label={t('roomCode')}
          rules={[
            { required: true, message: t('enterCode') },
            { len: 6, message: 'Le code doit contenir exactement 6 caractères' },
            { pattern: /^[A-Z0-9]+$/, message: 'Le code ne peut contenir que des lettres et chiffres' }
          ]}
        >
          <Input 
            placeholder={t('enterCode')} 
            size="large"
            maxLength={6}
            onBlur={handleCheckRoom}
            onChange={(e) => {
              const value = e.target.value.toUpperCase();
              form.setFieldValue('roomCode', value);
            }}
          />
        </Form.Item>

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

        <Form.Item>
          <Button type="primary" htmlType="submit" block size="large" loading={loading}>
            {t('joinButton')}
          </Button>
        </Form.Item>
      </Form>

      <Modal
        title="Mot de passe requis"
        open={showPasswordModal}
        onOk={handlePasswordSubmit}
        onCancel={() => {
          setShowPasswordModal(false);
          setPendingJoin(null);
          passwordForm.resetFields();
        }}
        okText="Rejoindre"
        cancelText="Annuler"
        confirmLoading={loading}
      >
        <Form form={passwordForm} layout="vertical">
          <Form.Item
            name="password"
            label="Mot de passe"
            rules={[{ required: true, message: 'Veuillez entrer le mot de passe' }]}
          >
            <Input.Password placeholder="Entrez le mot de passe" size="large" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
