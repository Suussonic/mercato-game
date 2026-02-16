'use client';

import { Layout, Typography } from 'antd';
import { GithubOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Footer } = Layout;
const { Text } = Typography;

export default function AppFooter() {
  const { t } = useTranslation();
  return (
    <Footer className="bg-gray-800 shadow-md py-4 px-4 md:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-center">
        <a
          href="https://github.com/Suussonic/mercato-game"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:text-blue-600 transition-colors duration-200"
        >
          <GithubOutlined className="text-2xl !text-black" />
          <Text className="!text-gray-900 hover:!text-blue-600 transition-colors duration-200">
            {t('githubRepository')}
          </Text>
        </a>
      </div>
    </Footer>
  );
}
