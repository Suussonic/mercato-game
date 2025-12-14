'use client';

import { useState, useEffect } from 'react';
import { Card, Form, Select, Checkbox, InputNumber, Button, Space, Typography, App, Tag } from 'antd';
import { GameConfig, Theme, Arc, Character } from '@/types';
import { gameStore } from '@/lib/gameStore';
import { useTranslation } from 'react-i18next';
import DragonBallSelector from './DragonBallSelector';

const { Title } = Typography;
const { Option } = Select;

interface GameConfigFormProps {
  onConfigComplete: (config: GameConfig) => void;
}

export default function GameConfigForm({ onConfigComplete }: GameConfigFormProps) {
  const [form] = Form.useForm();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [selectedArcs, setSelectedArcs] = useState<string[]>([]);
  const [availableCharacters, setAvailableCharacters] = useState<Character[]>([]);
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const { message } = App.useApp();
  const { t } = useTranslation();

  // Load themes on mount and listen for localStorage changes
  useEffect(() => {
    const loadThemes = async () => {
      setLoading(true);
      const loadedThemes = await gameStore.loadThemes();
      
      // Add special API themes
      const dragonBallAPITheme: Theme = {
        name: 'Dragon Ball API',
        arcs: [], // No arcs for API themes
      };
      
      setThemes([dragonBallAPITheme, ...loadedThemes]);
      gameStore.setThemes(loadedThemes);
      setLoading(false);
    };
    loadThemes();

    // Listen for storage events (when localStorage changes in another tab/window)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'customDatasets') {
        loadThemes();
      }
    };

    // Listen for custom event (when datasets change in same window)
    const handleCustomDatasetsChange = () => {
      loadThemes();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('customDatasetsChanged', handleCustomDatasetsChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('customDatasetsChanged', handleCustomDatasetsChange);
    };
  }, []);

  useEffect(() => {
    if (selectedTheme) {
      // Afficher tous les personnages de tous les arcs
      const allChars: Character[] = [];
      selectedTheme.arcs.forEach(arc => {
        allChars.push(...arc.characters);
      });
      setAvailableCharacters(allChars);
      
      // Auto-cocher les personnages des arcs sélectionnés
      if (selectedArcs.length > 0) {
        const charsFromSelectedArcs: Character[] = [];
        selectedTheme.arcs
          .filter(arc => selectedArcs.includes(arc.name))
          .forEach(arc => {
            charsFromSelectedArcs.push(...arc.characters);
          });
        const charNames = charsFromSelectedArcs.map(c => c.name);
        setSelectedCharacters(charNames);
        form.setFieldsValue({ characters: charNames });
      } else {
        setSelectedCharacters([]);
        form.setFieldsValue({ characters: [] });
      }
    } else {
      setAvailableCharacters([]);
      setSelectedCharacters([]);
    }
  }, [selectedTheme, selectedArcs, form]);

  const handleThemeChange = (themeName: string) => {
    const theme = themes.find(t => t.name === themeName);
    setSelectedTheme(theme || null);
    setSelectedArcs([]);
    form.setFieldsValue({ arcs: [], characters: [] });
  };

  const handleArcsChange = (arcs: string[]) => {
    setSelectedArcs(arcs);
    
    // Ne pas toucher au champ characters, laisser le useEffect gérer
    // L'update se fera automatiquement via le useEffect
  };

  const handleSubmit = (values: any) => {
    if (!selectedTheme) {
      message.error(t('selectThemeError'));
      return;
    }

    // For Dragon Ball API, use availableCharacters directly (already filtered by DragonBallSelector)
    // For regular themes, filter based on form values
    const selectedCharsList = selectedTheme.name === 'Dragon Ball API' 
      ? availableCharacters
      : availableCharacters.filter(c => values.characters && values.characters.includes(c.name));

    if (selectedCharsList.length === 0) {
      message.error(t('selectCharacterError'));
      return;
    }

    // Validate that we have enough characters for the game
    const minCharactersNeeded = values.numberOfTurns;
    if (selectedCharsList.length < minCharactersNeeded) {
      message.error(`Vous avez besoin d'au moins ${minCharactersNeeded} personnages pour ${values.numberOfTurns} tours`);
      return;
    }

    // Validate config values
    if (values.numberOfTurns <= 0 || values.charactersPerPlayer <= 0 || 
        values.turnDuration <= 0 || values.startingBalance <= 0) {
      message.error('Toutes les valeurs doivent être positives');
      return;
    }

    // Check if this is a custom theme (from localStorage)
    let customTheme: Theme | undefined;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('customDatasets');
      if (saved) {
        try {
          const customThemes = JSON.parse(saved) as Theme[];
          customTheme = customThemes.find(t => t.name === selectedTheme.name);
        } catch (e) {
          console.error('Failed to check custom themes:', e);
        }
      }
    }

    const config: GameConfig = {
      theme: selectedTheme.name,
      selectedArcs: values.arcs,
      selectedCharacters: selectedCharsList,
      numberOfTurns: values.numberOfTurns,
      charactersPerPlayer: values.charactersPerPlayer,
      turnDuration: values.turnDuration,
      startingBalance: values.startingBalance,
      customTheme: customTheme, // Include full theme data if it's custom
    };

    onConfigComplete(config);
  };

  if (loading) {
    return (
      <Card title={t('gameConfig')} className="w-full max-w-4xl shadow-lg">
        <div className="text-center py-8">Chargement des thèmes...</div>
      </Card>
    );
  }

  if (themes.length === 0) {
    return (
      <Card title={t('gameConfig')} className="w-full max-w-4xl shadow-lg">
        <div className="text-center py-8 text-red-500">
          Aucun thème disponible. Ajoutez des fichiers JSON dans le dossier data/
        </div>
      </Card>
    );
  }

  return (
    <Card title={t('gameConfig')} className="w-full max-w-4xl shadow-lg">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          numberOfTurns: 10,
          charactersPerPlayer: 5,
          turnDuration: 60,
          startingBalance: 1000,
        }}
      >
        <Form.Item
          name="theme"
          label={t('theme')}
          rules={[{ required: true, message: t('selectTheme') }]}
        >
          <Select size="large" onChange={handleThemeChange} placeholder={t('selectTheme')}>
            {themes.map(theme => {
              const isAPI = theme.name === 'Dragon Ball API';
              return (
                <Option key={theme.name} value={theme.name}>
                  <div className="flex items-center justify-between">
                    <span>{theme.name}</span>
                    <Tag color={isAPI ? 'blue' : 'green'}>
                      {isAPI ? 'API' : 'Dataset'}
                    </Tag>
                  </div>
                </Option>
              );
            })}
          </Select>
        </Form.Item>

        {selectedTheme && selectedTheme.name === 'Dragon Ball API' ? (
          <DragonBallSelector
            onSelectionComplete={(characters) => {
              setAvailableCharacters(characters);
              setSelectedCharacters(characters.map(c => c.name));
              form.setFieldsValue({ 
                arcs: ['Dragon Ball API'],
                characters: characters.map(c => c.name)
              });
            }}
          />
        ) : selectedTheme && (
          <>
            <Form.Item
              name="arcs"
              label={t('arcs')}
              rules={[{ required: true, message: t('arcs') }]}
            >
              <Checkbox.Group onChange={handleArcsChange as any}>
                <Space orientation="vertical">
                  {selectedTheme.arcs.map(arc => (
                    <Checkbox key={arc.name} value={arc.name}>
                      {arc.name} ({arc.characters.length} {t('charactersCount')})
                    </Checkbox>
                  ))}
                </Space>
              </Checkbox.Group>
            </Form.Item>

            {availableCharacters.length > 0 && (
              <Form.Item
                name="characters"
                label={t('characters')}
                rules={[{ required: true, message: t('selectCharacterError') }]}
              >
                <Checkbox.Group onChange={(values) => setSelectedCharacters(values as string[])}>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {availableCharacters.map(char => (
                      <Checkbox key={char.name} value={char.name}>
                        {char.name}
                      </Checkbox>
                    ))}
                  </div>
                </Checkbox.Group>
              </Form.Item>
            )}
          </>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="numberOfTurns"
            label={t('numberOfTurns')}
            rules={[{ required: true }]}
          >
            <InputNumber min={1} max={50} size="large" className="w-full" />
          </Form.Item>

          <Form.Item
            name="charactersPerPlayer"
            label={t('charactersPerPlayer')}
            rules={[{ required: true }]}
          >
            <InputNumber min={1} max={20} size="large" className="w-full" />
          </Form.Item>

          <Form.Item
            name="turnDuration"
            label={t('turnDuration')}
            rules={[{ required: true }]}
          >
            <InputNumber min={10} max={300} size="large" className="w-full" />
          </Form.Item>

          <Form.Item
            name="startingBalance"
            label={t('startingBalance')}
            rules={[{ required: true }]}
          >
            <InputNumber min={100} max={10000} size="large" className="w-full" />
          </Form.Item>
        </div>

        <Form.Item>
          <Button type="primary" htmlType="submit" block size="large">
            {t('startGame')}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
