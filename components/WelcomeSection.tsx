'use client';

import { Button, Card, Modal, Typography } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const { Title, Paragraph } = Typography;

export default function WelcomeSection() {
  const { t } = useTranslation();
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  
  return (
    <Card className="ui-welcome-card">
      <Title level={2} className="ui-title-center-lg">{t('welcomeTitle')}</Title>
      
      <div className="ui-rules-trigger-wrap">
        <Button
          type="primary"
          className="ui-rules-trigger-btn"
          onClick={() => setIsRulesModalOpen(true)}
        >
          {t('viewRules')}
        </Button>
      </div>

      <Modal
        open={isRulesModalOpen}
        closable={false}
        onCancel={() => setIsRulesModalOpen(false)}
        title={t('howToPlay')}
        footer={[
          <Button key="close" onClick={() => setIsRulesModalOpen(false)}>
            {t('close')}
          </Button>,
        ]}
        className="ui-rules-modal"
      >
        <div className="ui-stack-y-4 ui-rules-content">
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
      </Modal>
    </Card>
  );
}
