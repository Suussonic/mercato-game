'use client';

import { Layout, Select, Space, Typography } from 'antd';
import { TrophyOutlined, GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Header } = Layout;
const { Title } = Typography;

export default function AppHeader() {
  const { t, i18n } = useTranslation();
  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <Header className="bg-gray-800 shadow-md sticky top-0 z-50 px-4 md:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-full">
        <Title
          level={2}
          className="!mb-0 !text-blue-600 dark:!text-blue-400 flex items-center whitespace-nowrap text-lg sm:text-2xl md:text-3xl w-full justify-center md:justify-start"
          style={{ minWidth: 0 }}
        >
          <TrophyOutlined className="mr-2" />
          <span className="truncate block">{t('appName')}</span>
        </Title>
        
        <Space size="middle" className="flex items-center">
          <Space size="small" className="flex items-center">
            <GlobalOutlined className="text-gray-600 dark:text-gray-300" />
            <Select
              value={i18n.language}
              onChange={handleLanguageChange}
              size="middle"
              className="w-20"
              options={[
                { value: 'fr', label: 'FR' },
                { value: 'en', label: 'EN' },
              ]}
            />
          </Space>
        </Space>
      </div>
    </Header>
  );
}

/* Ajoute dans le fichier globals.css ou tailwind.config.js :
@media (max-width: 340px) {
  .xs\:inline { display: none !important; }
}
*/
