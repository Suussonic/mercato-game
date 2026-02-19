'use client';

import { Card, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

const { Title, Paragraph } = Typography;

export default function WelcomeSection() {
  const { t } = useTranslation();
  
  return (
    <Card className="ui-welcome-card">
      <Title level={2} className="ui-title-center-lg">{t('welcomeTitle')}</Title>
      
      <Paragraph className="ui-text-lg">
        <strong>{t('howToPlay')}</strong>
      </Paragraph>
      
      <div className="ui-stack-y-4">
        <Paragraph>
          <strong>{t('step1Title')}</strong>
          <br />
          {t('step1Content').split(' • ').map((item, i) => (
            <span key={i}>
              • {item}
              <br />
            </span>
          ))}
        </Paragraph>
        
        <Paragraph>
          <strong>{t('step2Title')}</strong>
          <br />
          {t('step2Content').split(' • ').map((item, i) => (
            <span key={i}>
              • {item}
              <br />
            </span>
          ))}
        </Paragraph>
        
        <Paragraph>
          <strong>{t('step3Title')}</strong>
          <br />
          {t('step3Content').split(' • ').map((item, i) => (
            <span key={i}>
              • {item}
              <br />
            </span>
          ))}
        </Paragraph>
        
        <Paragraph>
          <strong>{t('step4Title')}</strong>
          <br />
          {t('step4Content').split(' • ').map((item, i) => (
            <span key={i}>
              • {item}
              <br />
            </span>
          ))}
        </Paragraph>
      </div>
    </Card>
  );
}
