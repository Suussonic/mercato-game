'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Layout, Select, Space, Typography } from 'antd';
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
        <Link href="/" aria-label="Retour à l'accueil" className="ui-flex-center" style={{ minWidth: 0 }}>
          <Image
            src="/logo.png"
            alt="Mercato logo"
            width={36}
            height={36}
            priority
          />
          <Title
            level={2}
            className="ui-header-title"
            style={{ minWidth: 0, marginBottom: 0, marginLeft: 8 }}
          >
            <span className="ui-truncate-block">{t('appName')}</span>
          </Title>
        </Link>
        
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
