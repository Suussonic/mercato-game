'use client';

import { Layout, Typography } from 'antd';
import { GithubOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Footer } = Layout;
const { Text } = Typography;

export default function AppFooter() {
  const { t } = useTranslation();
  return (
    <Footer className="ui-footer">
      <div className="ui-footer-inner">
        <a
          href="https://github.com/Suussonic/mercato-game"
          target="_blank"
          rel="noopener noreferrer"
          className="ui-footer-link"
        >
          <GithubOutlined className="ui-footer-icon" />
          <Text className="ui-footer-text">
            {t('githubRepository')}
          </Text>
        </a>
      </div>
    </Footer>
  );
}
