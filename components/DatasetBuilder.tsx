'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, Form, Input, Button, Space, Flex, Modal, Typography, App, Tag, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ArrowLeftOutlined, SaveOutlined, DownloadOutlined, FolderOpenOutlined, UploadOutlined } from '@ant-design/icons';
import { Theme, Arc, Character } from '@/types';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface DatasetBuilderProps {
  onClose: () => void;
}

type View = 'themes' | 'arcs' | 'characters';

export default function DatasetBuilder({ onClose }: DatasetBuilderProps) {
  const [view, setView] = useState<View>('themes');
  const [themes, setThemes] = useState<Theme[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [selectedThemeIndex, setSelectedThemeIndex] = useState<number | null>(null);
  const [currentArc, setCurrentArc] = useState<Arc | null>(null);
  const [currentArcIndex, setCurrentArcIndex] = useState<number | null>(null);
  const [editingCharIndex, setEditingCharIndex] = useState<number | null>(null);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isArcModalOpen, setIsArcModalOpen] = useState(false);
  const [isCharModalOpen, setIsCharModalOpen] = useState(false);
  const [editingThemeIndex, setEditingThemeIndex] = useState<number | null>(null);
  const [editingArcIndex, setEditingArcIndex] = useState<number | null>(null);
  const [themeForm] = Form.useForm();
  const [arcForm] = Form.useForm();
  const [charForm] = Form.useForm();
  const { message, modal } = App.useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load all themes from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('customDatasets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setThemes(parsed);
      } catch (e) {
        console.error('Failed to load datasets:', e);
      }
    }
  }, []);

  // Save all themes to localStorage whenever they change
  useEffect(() => {
    if (themes.length > 0) {
      localStorage.setItem('customDatasets', JSON.stringify(themes));
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('customDatasetsChanged'));
    }
  }, [themes]);

  // Theme management
  const handleAddTheme = () => {
    setEditingThemeIndex(null);
    themeForm.resetFields();
    setIsThemeModalOpen(true);
  };

  const handleEditTheme = (index: number) => {
    setEditingThemeIndex(index);
    themeForm.setFieldsValue({ themeName: themes[index].name });
    setIsThemeModalOpen(true);
  };

  const handleDeleteTheme = (index: number) => {
    modal.confirm({
      title: 'Supprimer ce thème ?',
      content: 'Cette action est irréversible.',
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: () => {
        const newThemes = [...themes];
        newThemes.splice(index, 1);
        setThemes(newThemes);
        if (newThemes.length === 0) {
          localStorage.removeItem('customDatasets');
        }
        message.success('Thème supprimé');
      },
    });
  };

  const handleSaveTheme = (values: any) => {
    const newThemes = [...themes];
    if (editingThemeIndex !== null) {
      newThemes[editingThemeIndex] = { ...newThemes[editingThemeIndex], name: values.themeName };
      message.success('Thème modifié');
    } else {
      newThemes.push({ name: values.themeName, arcs: [] });
      message.success('Thème ajouté');
    }
    setThemes(newThemes);
    setIsThemeModalOpen(false);
  };

  const handleOpenTheme = (theme: Theme, index: number) => {
    setSelectedTheme(theme);
    setSelectedThemeIndex(index);
    setView('arcs');
  };

  const handleBackToThemes = () => {
    setSelectedTheme(null);
    setSelectedThemeIndex(null);
    setView('themes');
  };

  // Arc management
  const handleAddArc = () => {
    setEditingArcIndex(null);
    arcForm.resetFields();
    setIsArcModalOpen(true);
  };

  const handleEditArc = (index: number) => {
    if (!selectedTheme) return;
    setEditingArcIndex(index);
    arcForm.setFieldsValue({ arcName: selectedTheme.arcs[index].name });
    setIsArcModalOpen(true);
  };

  const handleDeleteArc = (index: number) => {
    if (selectedThemeIndex === null) return;
    modal.confirm({
      title: 'Supprimer cet arc ?',
      content: 'Cette action est irréversible.',
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: () => {
        const newThemes = [...themes];
        const newArcs = [...newThemes[selectedThemeIndex].arcs];
        newArcs.splice(index, 1);
        newThemes[selectedThemeIndex] = { ...newThemes[selectedThemeIndex], arcs: newArcs };
        setThemes(newThemes);
        setSelectedTheme({ ...selectedTheme!, arcs: newArcs });
        message.success('Arc supprimé');
      },
    });
  };

  const handleSaveArc = (values: any) => {
    if (selectedThemeIndex === null || !selectedTheme) return;
    const newThemes = [...themes];
    const newArcs = [...newThemes[selectedThemeIndex].arcs];
    
    if (editingArcIndex !== null) {
      newArcs[editingArcIndex] = { ...newArcs[editingArcIndex], name: values.arcName };
      message.success('Arc modifié');
    } else {
      newArcs.push({ name: values.arcName, characters: [] });
      message.success('Arc ajouté');
    }
    
    newThemes[selectedThemeIndex] = { ...newThemes[selectedThemeIndex], arcs: newArcs };
    setThemes(newThemes);
    setSelectedTheme({ ...selectedTheme, arcs: newArcs });
    setIsArcModalOpen(false);
  };

  const handleOpenArc = (arc: Arc, index: number) => {
    setCurrentArc(arc);
    setCurrentArcIndex(index);
    setView('characters');
  };

  const handleBackToArcs = () => {
    setCurrentArc(null);
    setCurrentArcIndex(null);
    setView('arcs');
  };

  // Character management
  const handleAddCharacter = () => {
    setEditingCharIndex(null);
    charForm.resetFields();
    setIsCharModalOpen(true);
  };

  const handleEditCharacter = (index: number) => {
    if (!currentArc) return;
    const char = currentArc.characters[index];
    setEditingCharIndex(index);
    charForm.setFieldsValue({ charName: char.name, charUrl: char.imageUrl });
    setIsCharModalOpen(true);
  };

  const handleDeleteCharacter = (index: number) => {
    if (!currentArc || selectedThemeIndex === null || currentArcIndex === null) return;
    
    modal.confirm({
      title: 'Supprimer ce personnage ?',
      content: 'Cette action est irréversible.',
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: () => {
        const newThemes = [...themes];
        const newArcs = [...newThemes[selectedThemeIndex].arcs];
        const characters = [...newArcs[currentArcIndex].characters];
        characters.splice(index, 1);
        newArcs[currentArcIndex] = { ...newArcs[currentArcIndex], characters };
        newThemes[selectedThemeIndex] = { ...newThemes[selectedThemeIndex], arcs: newArcs };
        setThemes(newThemes);
        setCurrentArc({ ...currentArc, characters });
        setSelectedTheme({ ...selectedTheme!, arcs: newArcs });
        message.success('Personnage supprimé');
      },
    });
  };

  const handleSaveCharacter = (values: any) => {
    if (!currentArc || selectedThemeIndex === null || currentArcIndex === null) return;

    const newThemes = [...themes];
    const newArcs = [...newThemes[selectedThemeIndex].arcs];
    const characters = [...newArcs[currentArcIndex].characters];
    
    if (editingCharIndex !== null) {
      characters[editingCharIndex] = { name: values.charName, imageUrl: values.charUrl };
      message.success('Personnage modifié');
    } else {
      characters.push({ name: values.charName, imageUrl: values.charUrl });
      message.success('Personnage ajouté');
    }
    
    newArcs[currentArcIndex] = { ...newArcs[currentArcIndex], characters };
    newThemes[selectedThemeIndex] = { ...newThemes[selectedThemeIndex], arcs: newArcs };
    setThemes(newThemes);
    setCurrentArc({ ...currentArc, characters });
    setSelectedTheme({ ...selectedTheme!, arcs: newArcs });
    setIsCharModalOpen(false);
  };

  const handleDownloadTheme = (themeIndex: number) => {
    const theme = themes[themeIndex];
    const dataStr = JSON.stringify(theme, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${theme.name}.json`;
    link.click();
    URL.revokeObjectURL(url);
    message.success('Thème téléchargé !');
  };

  const handleClearAll = () => {
    modal.confirm({
      title: 'Effacer tous les thèmes ?',
      content: 'Cette action supprimera toutes vos données.',
      okText: 'Effacer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: () => {
        localStorage.removeItem('customDatasets');
        setThemes([]);
        setSelectedTheme(null);
        setCurrentArc(null);
        setView('themes');
        message.success('Tous les thèmes effacés');
        // Notify other components
        window.dispatchEvent(new CustomEvent('customDatasetsChanged'));
      },
    });
  };

  const validateThemeJSON = (data: any): data is Theme => {
    if (!data || typeof data !== 'object') return false;
    if (typeof data.name !== 'string' || !data.name) return false;
    if (!Array.isArray(data.arcs)) return false;
    
    for (const arc of data.arcs) {
      if (!arc || typeof arc !== 'object') return false;
      if (typeof arc.name !== 'string' || !arc.name) return false;
      if (!Array.isArray(arc.characters)) return false;
      
      for (const char of arc.characters) {
        if (!char || typeof char !== 'object') return false;
        if (typeof char.name !== 'string' || !char.name) return false;
        if (typeof char.imageUrl !== 'string' || !char.imageUrl) return false;
      }
    }
    
    return true;
  };

  const handleImportJSON = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        if (!validateThemeJSON(json)) {
          message.error('JSON incompatible. Le fichier doit contenir un thème valide avec name, arcs, et characters.');
          return;
        }

        // Check if theme already exists
        const existingIndex = themes.findIndex(t => t.name === json.name);
        if (existingIndex !== -1) {
          modal.confirm({
            title: 'Thème existant',
            content: `Un thème nommé "${json.name}" existe déjà. Voulez-vous le remplacer ?`,
            okText: 'Remplacer',
            cancelText: 'Annuler',
            onOk: () => {
              const newThemes = [...themes];
              newThemes[existingIndex] = json;
              setThemes(newThemes);
              message.success('Thème remplacé avec succès !');
            },
          });
        } else {
          setThemes([...themes, json]);
          message.success('Thème importé avec succès !');
        }
      } catch (error) {
        message.error('JSON incompatible. Erreur de parsing du fichier.');
      }
    };
    
    reader.readAsText(file);
    
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // View: Character management
  if (view === 'characters' && currentArc) {
    return (
      <Card 
        title={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={handleBackToArcs}>
              Retour aux arcs
            </Button>
            <Text strong>{selectedTheme?.name}</Text>
            <Text type="secondary">›</Text>
            <Text strong>{currentArc.name}</Text>
            <Tag color="blue">{currentArc.characters.length} personnages</Tag>
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCharacter}>
            Ajouter un personnage
          </Button>
        }
      >
        {currentArc.characters.length === 0 ? (
          <div className="text-center py-8 text-gray-400">Aucun personnage. Ajoutez-en un !</div>
        ) : (
          <Flex vertical gap="small">
            {currentArc.characters.map((char, index) => (
              <Card key={index} size="small">
                <Flex justify="space-between" align="center">
                  <div className="flex-1">
                    <Text strong className="block">{char.name}</Text>
                    <Text type="secondary" ellipsis style={{ maxWidth: 400, display: 'block' }}>
                      {char.imageUrl}
                    </Text>
                    {char.imageUrl && (
                      <img 
                        src={char.imageUrl} 
                        alt={char.name} 
                        style={{ width: 50, height: 50, objectFit: 'cover', marginTop: 8 }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                  </div>
                  <Space>
                    <Button icon={<EditOutlined />} onClick={() => handleEditCharacter(index)} />
                    <Button danger icon={<DeleteOutlined />} onClick={() => handleDeleteCharacter(index)} />
                  </Space>
                </Flex>
              </Card>
            ))}
          </Flex>
        )}

        <Modal
          title={editingCharIndex !== null ? 'Modifier le personnage' : 'Ajouter un personnage'}
          open={isCharModalOpen}
          onCancel={() => setIsCharModalOpen(false)}
          onOk={() => charForm.submit()}
        >
          <Form form={charForm} layout="vertical" onFinish={handleSaveCharacter}>
            <Form.Item
              name="charName"
              label="Nom du personnage"
              rules={[{ required: true, message: 'Requis' }]}
            >
              <Input placeholder="Ex: Goku (Super Saiyan)" />
            </Form.Item>
            <Form.Item
              name="charUrl"
              label="URL de l'image"
              rules={[{ required: true, message: 'Requis' }]}
            >
              <TextArea 
                rows={3} 
                placeholder="https://exemple.com/image.png" 
              />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    );
  }

  // View: Arc management
  if (view === 'arcs' && selectedTheme) {
    return (
      <Card 
        title={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={handleBackToThemes}>
              Retour aux thèmes
            </Button>
            <Text strong>{selectedTheme.name}</Text>
            <Tag color="purple">{selectedTheme.arcs.length} arcs</Tag>
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddArc}>
            Ajouter un arc
          </Button>
        }
      >
        {selectedTheme.arcs.length === 0 ? (
          <div className="text-center py-8 text-gray-400">Aucun arc. Commencez par en ajouter un !</div>
        ) : (
          <Flex vertical gap="small">
            {selectedTheme.arcs.map((arc, index) => (
              <Card key={index} size="small">
                <Flex justify="space-between" align="center">
                  <div>
                    <Text strong className="block">{arc.name}</Text>
                    <Text type="secondary">{arc.characters.length} personnage(s)</Text>
                  </div>
                  <Space>
                    <Button icon={<FolderOpenOutlined />} onClick={() => handleOpenArc(arc, index)}>
                      Gérer ({arc.characters.length})
                    </Button>
                    <Button icon={<EditOutlined />} onClick={() => handleEditArc(index)} />
                    <Button danger icon={<DeleteOutlined />} onClick={() => handleDeleteArc(index)} />
                  </Space>
                </Flex>
              </Card>
            ))}
          </Flex>
        )}

        <Modal
          title={editingArcIndex !== null ? 'Modifier l\'arc' : 'Ajouter un arc'}
          open={isArcModalOpen}
          onCancel={() => setIsArcModalOpen(false)}
          onOk={() => arcForm.submit()}
        >
          <Form form={arcForm} layout="vertical" onFinish={handleSaveArc}>
            <Form.Item
              name="arcName"
              label="Nom de l'arc"
              rules={[{ required: true, message: 'Le nom de l\'arc est requis' }]}
            >
              <Input placeholder="Ex: Saiyan Saga, East Blue, etc." />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    );
  }

  // View: Theme list
  return (
    <Card 
      title={
        <Space>
          <FolderOpenOutlined />
          <span>Mes Thèmes</span>
          <Tag>{themes.length}</Tag>
        </Space>
      }
      extra={
        <Space>
          <Button icon={<UploadOutlined />} onClick={handleImportJSON}>
            Importer JSON
          </Button>
          <Button danger onClick={handleClearAll} disabled={themes.length === 0}>
            Effacer tout
          </Button>
          <Button onClick={onClose}>Fermer</Button>
        </Space>
      }
    >
      <Space orientation="vertical" className="w-full" size="large">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        
        <div className="flex justify-between items-center">
          <Title level={4} className="!mb-0">Liste des thèmes</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddTheme}>
            Créer un thème
          </Button>
        </div>

        {themes.length === 0 ? (
          <div className="text-center py-8 text-gray-400">Aucun thème. Créez-en un pour commencer !</div>
        ) : (
          <Flex vertical gap="small">
            {themes.map((theme, index) => (
              <Card key={index} size="small">
                <Flex justify="space-between" align="center">
                  <div>
                    <Text strong className="block">{theme.name}</Text>
                    <Text type="secondary">
                      {theme.arcs.length} arc(s) • {theme.arcs.reduce((sum, arc) => sum + arc.characters.length, 0)} personnage(s)
                    </Text>
                  </div>
                  <Space>
                    <Button icon={<DownloadOutlined />} onClick={() => handleDownloadTheme(index)}>
                      Télécharger
                    </Button>
                    <Button type="primary" icon={<FolderOpenOutlined />} onClick={() => handleOpenTheme(theme, index)}>
                      Ouvrir
                    </Button>
                    <Button icon={<EditOutlined />} onClick={() => handleEditTheme(index)} />
                    <Button danger icon={<DeleteOutlined />} onClick={() => handleDeleteTheme(index)} />
                  </Space>
                </Flex>
              </Card>
            ))}
          </Flex>
        )}

        <Modal
          title={editingThemeIndex !== null ? 'Modifier le thème' : 'Créer un thème'}
          open={isThemeModalOpen}
          onCancel={() => setIsThemeModalOpen(false)}
          onOk={() => themeForm.submit()}
        >
          <Form form={themeForm} layout="vertical" onFinish={handleSaveTheme}>
            <Form.Item
              name="themeName"
              label="Nom du thème"
              rules={[{ required: true, message: 'Le nom du thème est requis' }]}
            >
              <Input placeholder="Ex: Dragon Ball, One Piece, Naruto..." />
            </Form.Item>
          </Form>
        </Modal>
      </Space>
    </Card>
  );
}
