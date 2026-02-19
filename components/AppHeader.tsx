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
    <Header className="ui-header">
      <div className="ui-header-inner">
        <Title
          level={2}
          className="ui-header-title"
          style={{ minWidth: 0 }}
        >
          <TrophyOutlined className="ui-icon-leading" />
          <span className="ui-truncate-block">{t('appName')}</span>
        </Title>
        
        <Space size="middle" className="ui-flex-center">
          <Space size="small" className="ui-flex-center">
            <Select
              value={i18n.language}
              onChange={handleLanguageChange}
              size="middle"
              className="ui-select-compact"
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

/* Ajoute dans le fichier tailwind.css ou tailwind.config.js :
@media (max-width: 340px) {
  .xs\:inline { display: none !important; }
}
*/
