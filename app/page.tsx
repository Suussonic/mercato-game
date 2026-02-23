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
import { useTranslation } from 'react-i18next';

const { Content } = Layout;

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isDatasetBuilderOpen, setIsDatasetBuilderOpen] = useState(false);

  // No auto-redirect - let users stay on home page

  const handleRoomCreated = () => {
    // Navigation is handled in CreateRoomForm
  };

  const handleRoomJoined = () => {
    // Navigation is handled in JoinRoomForm
  };

  return (
    <Layout className="ui-page-home">
      <AppHeader />

      <Content className="ui-content-main">
        <div className="ui-container-6xl">
          <Space orientation="vertical" size="large" className="ui-stack-lg" style={{ display: 'flex', alignItems: 'center' }}>
            <WelcomeSection />
            
            <Button 
              type="dashed" 
              size="large" 
              icon={<DatabaseOutlined />}
              onClick={() => setIsDatasetBuilderOpen(true)}
            >
              {t('createOwnDataset')}
            </Button>

            <div className="ui-grid-forms">
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
