'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Space, Button, Modal } from 'antd';
import { DatabaseOutlined } from '@ant-design/icons';
import AppHeader from '@/components/AppHeader';
import AppFooter from '@/components/AppFooter';
import WelcomeSection from '@/components/WelcomeSection';
import CreateRoomForm from '@/components/CreateRoomForm';
import JoinRoomForm from '@/components/JoinRoomForm';
import DatasetBuilder from '@/components/DatasetBuilder';
import { ClientGameState } from '@/lib/clientGameState';

const { Content } = Layout;

export default function Home() {
  const router = useRouter();
  const [isDatasetBuilderOpen, setIsDatasetBuilderOpen] = useState(false);

  // No auto-redirect - let users stay on home page

  const handleRoomCreated = () => {
    // Navigation is handled in CreateRoomForm
  };

  const handleRoomJoined = () => {
    // Navigation is handled in JoinRoomForm
  };

  return (
    <Layout className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
      <AppHeader />

      <Content className="p-4 md:p-6 flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="w-full max-w-6xl mx-auto">
          <Space orientation="vertical" size="large" className="w-full" style={{ display: 'flex', alignItems: 'center' }}>
            <WelcomeSection />
            
            <Button 
              type="dashed" 
              size="large" 
              icon={<DatabaseOutlined />}
              onClick={() => setIsDatasetBuilderOpen(true)}
            >
              Créer son propre Dataset
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <CreateRoomForm onRoomCreated={handleRoomCreated} />
              <JoinRoomForm onRoomJoined={handleRoomJoined} />
            </div>
          </Space>
        </div>
      </Content>

      <AppFooter />

      <Modal
        open={isDatasetBuilderOpen}
        onCancel={() => setIsDatasetBuilderOpen(false)}
        footer={null}
        width={900}
        destroyOnHidden
      >
        <DatasetBuilder onClose={() => setIsDatasetBuilderOpen(false)} />
      </Modal>
    </Layout>
  );
}
