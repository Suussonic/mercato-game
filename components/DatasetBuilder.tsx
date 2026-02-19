'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, Form, Input, Button, Space, Flex, Modal, Typography, App, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ArrowLeftOutlined, DownloadOutlined, FolderOpenOutlined, UploadOutlined } from '@ant-design/icons';
import { Arc, Character } from '@/types';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface DatasetBuilderProps {
  onClose: () => void;
}

type View = 'themes' | 'arcs' | 'characters';

interface Dataset {
  name: string;
  characters: Character[];
  arcs?: Arc[];
}

export default function DatasetBuilder({ onClose }: DatasetBuilderProps) {
  const [view, setView] = useState<View>('themes');
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [selectedDatasetIndex, setSelectedDatasetIndex] = useState<number | null>(null);
  const [currentArc, setCurrentArc] = useState<Arc | null>(null);
  const [currentArcIndex, setCurrentArcIndex] = useState<number | null>(null);
  const [editingCharIndex, setEditingCharIndex] = useState<number | null>(null);
  const [isDatasetModalOpen, setIsDatasetModalOpen] = useState(false);
  const [isArcModalOpen, setIsArcModalOpen] = useState(false);
  const [isCharModalOpen, setIsCharModalOpen] = useState(false);
  const [editingDatasetIndex, setEditingDatasetIndex] = useState<number | null>(null);
  const [editingArcIndex, setEditingArcIndex] = useState<number | null>(null);
  const [datasetForm] = Form.useForm();
  const [arcForm] = Form.useForm();
  const [charForm] = Form.useForm();
  const { message, modal } = App.useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load all datasets from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('customDatasets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const normalized = normalizeDatasets(parsed);
        setDatasets(normalized);
      } catch (e) {
        console.error('Failed to load datasets:', e);
      }
    }
  }, []);

  // Save all datasets to localStorage whenever they change
  useEffect(() => {
    if (datasets.length > 0) {
      localStorage.setItem('customDatasets', JSON.stringify(datasets));
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('customDatasetsChanged'));
    } else {
      localStorage.removeItem('customDatasets');
    }
  }, [datasets]);

  const normalizeDatasets = (raw: any): Dataset[] => {
    if (!Array.isArray(raw)) return [];

    return raw
      .map((item) => {
        if (!item || typeof item !== 'object') return null;

        if (typeof item.name === 'string' && Array.isArray(item.characters)) {
          const characters = parseCharactersArray(item.characters);
          if (!characters) return null;
          return { name: item.name, characters };
        }

        if (typeof item.name === 'string' && Array.isArray(item.arcs)) {
          const arcs = parseArcsArray(item.arcs);
          if (!arcs) return null;
          return { name: item.name, arcs, characters: flattenArcs(arcs) };
        }

        return null;
      })
      .filter((dataset): dataset is Dataset => Boolean(dataset));
  };

  const parseCharactersArray = (raw: any): Character[] | null => {
    if (!Array.isArray(raw)) return null;
    if (raw.length === 0) return [];

    const characters = raw.map((char) => {
      if (!char || typeof char !== 'object') return null;
      if (typeof char.name !== 'string' || typeof char.imageUrl !== 'string') {
        return null;
      }
      return { name: char.name, imageUrl: char.imageUrl } as Character;
    });

    if (characters.some((char) => char === null)) return null;
    return characters as Character[];
  };

  const parseArcsArray = (raw: any): Arc[] | null => {
    if (!Array.isArray(raw)) return null;

    const arcs = raw.map((arc) => {
      if (!arc || typeof arc !== 'object') return null;
      if (typeof arc.name !== 'string' || !Array.isArray(arc.characters)) return null;
      const characters = parseCharactersArray(arc.characters);
      if (!characters) return null;
      return { name: arc.name, characters } as Arc;
    });

    if (arcs.some((arc) => arc === null)) return null;
    return arcs as Arc[];
  };

  const flattenArcs = (arcs: Arc[]): Character[] => {
    return arcs.flatMap((arc) => arc.characters);
  };

  const getDatasetCharacters = (dataset: Dataset): Character[] => {
    if (dataset.arcs && dataset.arcs.length > 0) return flattenArcs(dataset.arcs);
    return dataset.characters;
  };

  const updateDatasetArcs = (datasetIndex: number, arcs: Arc[]) => {
    const newDatasets = [...datasets];
    const characters = flattenArcs(arcs);
    newDatasets[datasetIndex] = { ...newDatasets[datasetIndex], arcs, characters };
    setDatasets(newDatasets);
    setSelectedDataset({ ...newDatasets[datasetIndex] });
  };

  // Dataset management
  const handleAddDataset = () => {
    setEditingDatasetIndex(null);
    datasetForm.resetFields();
    setIsDatasetModalOpen(true);
  };

  const handleEditDataset = (index: number) => {
    setEditingDatasetIndex(index);
    datasetForm.setFieldsValue({ datasetName: datasets[index].name });
    setIsDatasetModalOpen(true);
  };

  const handleDeleteDataset = (index: number) => {
    modal.confirm({
      title: 'Supprimer ce dataset ?',
      content: 'Cette action est irréversible.',
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: () => {
        const newDatasets = [...datasets];
        newDatasets.splice(index, 1);
        setDatasets(newDatasets);
        message.success('Dataset supprimé');
      },
    });
  };

  const handleSaveDataset = (values: any) => {
    const newDatasets = [...datasets];
    if (editingDatasetIndex !== null) {
      newDatasets[editingDatasetIndex] = { ...newDatasets[editingDatasetIndex], name: values.datasetName };
      message.success('Dataset modifié');
    } else {
      newDatasets.push({ name: values.datasetName, characters: [] });
      message.success('Dataset ajouté');
    }
    setDatasets(newDatasets);
    setIsDatasetModalOpen(false);
  };

  const handleOpenDataset = (dataset: Dataset, index: number) => {
    setSelectedDataset(dataset);
    setSelectedDatasetIndex(index);
    if (dataset.arcs && dataset.arcs.length > 0) {
      setView('arcs');
    } else {
      setView('characters');
    }
  };

  const handleBackToDatasets = () => {
    setSelectedDataset(null);
    setSelectedDatasetIndex(null);
    setCurrentArc(null);
    setCurrentArcIndex(null);
    setView('themes');
  };

  // Arc management
  const handleAddArc = () => {
    setEditingArcIndex(null);
    arcForm.resetFields();
    setIsArcModalOpen(true);
  };

  const handleEditArc = (index: number) => {
    if (!selectedDataset?.arcs) return;
    setEditingArcIndex(index);
    arcForm.setFieldsValue({ arcName: selectedDataset.arcs[index].name });
    setIsArcModalOpen(true);
  };

  const handleDeleteArc = (index: number) => {
    if (!selectedDataset?.arcs || selectedDatasetIndex === null) return;

    modal.confirm({
      title: 'Supprimer cet arc ?',
      content: 'Cette action est irréversible.',
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: () => {
        const newArcs = [...selectedDataset.arcs!];
        newArcs.splice(index, 1);
        updateDatasetArcs(selectedDatasetIndex, newArcs);
        if (currentArcIndex === index) {
          setCurrentArc(null);
          setCurrentArcIndex(null);
        } else if (currentArcIndex !== null && currentArcIndex > index) {
          setCurrentArcIndex(currentArcIndex - 1);
        }
        message.success('Arc supprimé');
      },
    });
  };

  const handleSaveArc = (values: any) => {
    if (selectedDatasetIndex === null || !selectedDataset) return;
    const currentArcs = selectedDataset.arcs ? [...selectedDataset.arcs] : [];

    if (editingArcIndex !== null) {
      currentArcs[editingArcIndex] = { ...currentArcs[editingArcIndex], name: values.arcName };
      message.success('Arc modifié');
    } else {
      currentArcs.push({ name: values.arcName, characters: [] });
      message.success('Arc ajouté');
    }

    updateDatasetArcs(selectedDatasetIndex, currentArcs);
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
    if (!selectedDataset) return;
    const isArcMode = Boolean(selectedDataset.arcs && selectedDataset.arcs.length > 0);
    if (isArcMode) {
      if (!currentArc) return;
      const char = currentArc.characters[index];
      setEditingCharIndex(index);
      charForm.setFieldsValue({ charName: char.name, charUrl: char.imageUrl });
      setIsCharModalOpen(true);
      return;
    }

    const char = selectedDataset.characters[index];
    setEditingCharIndex(index);
    charForm.setFieldsValue({ charName: char.name, charUrl: char.imageUrl });
    setIsCharModalOpen(true);
  };

  const handleDeleteCharacter = (index: number) => {
    if (selectedDatasetIndex === null || !selectedDataset) return;

    modal.confirm({
      title: 'Supprimer ce personnage ?',
      content: 'Cette action est irréversible.',
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: () => {
        const isArcMode = Boolean(selectedDataset.arcs && selectedDataset.arcs.length > 0);
        if (isArcMode) {
          if (!currentArc || currentArcIndex === null) return;
          const newArcs = [...selectedDataset.arcs!];
          const characters = [...newArcs[currentArcIndex].characters];
          characters.splice(index, 1);
          newArcs[currentArcIndex] = { ...newArcs[currentArcIndex], characters };
          updateDatasetArcs(selectedDatasetIndex, newArcs);
          setCurrentArc({ ...newArcs[currentArcIndex] });
          message.success('Personnage supprimé');
          return;
        }

        const newDatasets = [...datasets];
        const characters = [...newDatasets[selectedDatasetIndex].characters];
        characters.splice(index, 1);
        newDatasets[selectedDatasetIndex] = { ...newDatasets[selectedDatasetIndex], characters };
        setDatasets(newDatasets);
        setSelectedDataset({ ...selectedDataset, characters });
        message.success('Personnage supprimé');
      },
    });
  };

  const handleSaveCharacter = (values: any) => {
    if (!selectedDataset || selectedDatasetIndex === null) return;

    const isArcMode = Boolean(selectedDataset.arcs && selectedDataset.arcs.length > 0);
    if (isArcMode) {
      if (!currentArc || currentArcIndex === null) return;
      const newArcs = [...selectedDataset.arcs!];
      const characters = [...newArcs[currentArcIndex].characters];

      if (editingCharIndex !== null) {
        characters[editingCharIndex] = { name: values.charName, imageUrl: values.charUrl };
        message.success('Personnage modifié');
      } else {
        characters.push({ name: values.charName, imageUrl: values.charUrl });
        message.success('Personnage ajouté');
      }

      newArcs[currentArcIndex] = { ...newArcs[currentArcIndex], characters };
      updateDatasetArcs(selectedDatasetIndex, newArcs);
      setCurrentArc({ ...newArcs[currentArcIndex] });
      setIsCharModalOpen(false);
      return;
    }

    const newDatasets = [...datasets];
    const characters = [...newDatasets[selectedDatasetIndex].characters];
    
    if (editingCharIndex !== null) {
      characters[editingCharIndex] = { name: values.charName, imageUrl: values.charUrl };
      message.success('Personnage modifié');
    } else {
      characters.push({ name: values.charName, imageUrl: values.charUrl });
      message.success('Personnage ajouté');
    }

    newDatasets[selectedDatasetIndex] = { ...newDatasets[selectedDatasetIndex], characters };
    setDatasets(newDatasets);
    setSelectedDataset({ ...selectedDataset, characters });
    setIsCharModalOpen(false);
  };

  const handleDownloadDataset = (datasetIndex: number) => {
    const dataset = datasets[datasetIndex];
    const hasArcs = Boolean(dataset.arcs && dataset.arcs.length > 0);
    const exportPayload = hasArcs
      ? { name: dataset.name, arcs: dataset.arcs }
      : dataset.characters;
    const dataStr = JSON.stringify(exportPayload, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${dataset.name}.json`;
    link.click();
    URL.revokeObjectURL(url);
    message.success('Dataset téléchargé !');
  };

  const handleClearAll = () => {
    modal.confirm({
      title: 'Effacer tous les datasets ?',
      content: 'Cette action supprimera toutes vos données.',
      okText: 'Effacer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: () => {
        setDatasets([]);
        setSelectedDataset(null);
        setView('themes');
        message.success('Tous les datasets effacés');
      },
    });
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
        const fileName = file.name.replace(/\.json$/i, '').trim() || 'Dataset';
        let datasetName = fileName;
        let characters: Character[] = [];
        let arcs: Arc[] | undefined;

        if (Array.isArray(json)) {
          const parsedCharacters = parseCharactersArray(json);
          if (!parsedCharacters) {
            message.error('JSON incompatible. Le fichier doit être un tableau de personnages { name, imageUrl }.');
            return;
          }
          characters = parsedCharacters;
        } else if (json && typeof json === 'object' && Array.isArray(json.arcs)) {
          const parsedArcs = parseArcsArray(json.arcs);
          if (!parsedArcs) {
            message.error('JSON incompatible. Le fichier doit contenir des arcs valides.');
            return;
          }
          arcs = parsedArcs;
          characters = flattenArcs(parsedArcs);
          if (typeof json.name === 'string' && json.name.trim().length > 0) {
            datasetName = json.name.trim();
          }
        } else {
          message.error('JSON incompatible. Le fichier doit être un tableau de personnages ou un objet avec arcs.');
          return;
        }

        // Check if dataset already exists
        const existingIndex = datasets.findIndex(d => d.name === datasetName);
        if (existingIndex !== -1) {
          modal.confirm({
            title: 'Dataset existant',
            content: `Un dataset nommé "${datasetName}" existe déjà. Voulez-vous le remplacer ?`,
            okText: 'Remplacer',
            cancelText: 'Annuler',
            onOk: () => {
              const newDatasets = [...datasets];
              newDatasets[existingIndex] = { name: datasetName, characters, arcs };
              setDatasets(newDatasets);
              message.success('Dataset remplacé avec succès !');
            },
          });
        } else {
          setDatasets([...datasets, { name: datasetName, characters, arcs }]);
          message.success('Dataset importé avec succès !');
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
  if (view === 'characters' && selectedDataset) {
    const isArcMode = Boolean(selectedDataset.arcs && selectedDataset.arcs.length > 0);
    if (isArcMode && !currentArc) return null;

    return (
      <Card 
        title={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={isArcMode ? handleBackToArcs : handleBackToDatasets}>
              {isArcMode ? 'Retour aux arcs' : 'Retour aux datasets'}
            </Button>
            <Text strong>{selectedDataset.name}</Text>
            {isArcMode && currentArc && (
              <>
                <Text type="secondary">›</Text>
                <Text strong>{currentArc.name}</Text>
              </>
            )}
            <Tag color="blue">
              {isArcMode ? currentArc!.characters.length : selectedDataset.characters.length} personnages
            </Tag>
          </Space>
        }
        extra={
          <Space>
            {!isArcMode && (
              <Button onClick={() => {
                if (selectedDatasetIndex === null) return;
                const arcs = [{ name: 'All', characters: [...selectedDataset.characters] }];
                updateDatasetArcs(selectedDatasetIndex, arcs);
                setCurrentArc(arcs[0]);
                setCurrentArcIndex(0);
                setView('arcs');
              }}>
                Activer les arcs
              </Button>
            )}
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCharacter}>
              Ajouter un personnage
            </Button>
          </Space>
        }
      >
        {(isArcMode ? currentArc!.characters.length : selectedDataset.characters.length) === 0 ? (
          <div className="ui-db-empty">Aucun personnage. Ajoutez-en un !</div>
        ) : (
          <Flex vertical gap="small">
            {(isArcMode ? currentArc!.characters : selectedDataset.characters).map((char, index) => (
              <Card key={index} size="small">
                <Flex justify="space-between" align="center">
                  <div className="ui-flex-1">
                    <Text strong className="ui-db-title">{char.name}</Text>
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
  if (view === 'arcs' && selectedDataset) {
    const arcs = selectedDataset.arcs || [];
    return (
      <Card
        title={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={handleBackToDatasets}>
              Retour aux datasets
            </Button>
            <Text strong>{selectedDataset.name}</Text>
            <Tag color="purple">{arcs.length} arcs</Tag>
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddArc}>
            Ajouter un arc
          </Button>
        }
      >
        {arcs.length === 0 ? (
          <div className="ui-db-empty">Aucun arc. Commencez par en ajouter un !</div>
        ) : (
          <Flex vertical gap="small">
            {arcs.map((arc, index) => (
              <Card key={index} size="small">
                <Flex justify="space-between" align="center">
                  <div>
                    <Text strong className="ui-db-title">{arc.name}</Text>
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
              <Input placeholder="Ex: Arc 1, Arc 2, etc." />
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
          <span>Mes Datasets</span>
          <Tag>{datasets.length}</Tag>
        </Space>
      }
      extra={
        <Space>
          <Button icon={<UploadOutlined />} onClick={handleImportJSON}>
            Importer JSON
          </Button>
          <Button danger onClick={handleClearAll} disabled={datasets.length === 0}>
            Effacer tout
          </Button>
          <Button onClick={onClose}>Fermer</Button>
        </Space>
      }
    >
      <Space orientation="vertical" className="ui-space-full" size="large">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        
        <div className="ui-db-list-head">
          <Title level={4} className="ui-db-list-title">Liste des datasets</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddDataset}>
            Créer un dataset
          </Button>
        </div>

        {datasets.length === 0 ? (
          <div className="ui-db-empty">Aucun dataset. Créez-en un pour commencer !</div>
        ) : (
          <Flex vertical gap="small">
            {datasets.map((dataset, index) => (
              <Card key={index} size="small">
                <Flex justify="space-between" align="center">
                  <div>
                    <Text strong className="ui-db-title">{dataset.name}</Text>
                    <Text type="secondary">
                      {getDatasetCharacters(dataset).length} personnage(s)
                      {dataset.arcs && dataset.arcs.length > 0 ? ` • ${dataset.arcs.length} arc(s)` : ''}
                    </Text>
                  </div>
                  <Space>
                    <Button icon={<DownloadOutlined />} onClick={() => handleDownloadDataset(index)}>
                      Télécharger
                    </Button>
                    <Button type="primary" icon={<FolderOpenOutlined />} onClick={() => handleOpenDataset(dataset, index)}>
                      Ouvrir
                    </Button>
                    <Button icon={<EditOutlined />} onClick={() => handleEditDataset(index)} />
                    <Button danger icon={<DeleteOutlined />} onClick={() => handleDeleteDataset(index)} />
                  </Space>
                </Flex>
              </Card>
            ))}
          </Flex>
        )}

        <Modal
          title={editingDatasetIndex !== null ? 'Modifier le dataset' : 'Créer un dataset'}
          open={isDatasetModalOpen}
          onCancel={() => setIsDatasetModalOpen(false)}
          onOk={() => datasetForm.submit()}
        >
          <Form form={datasetForm} layout="vertical" onFinish={handleSaveDataset}>
            <Form.Item
              name="datasetName"
              label="Nom du dataset"
              rules={[{ required: true, message: 'Le nom du dataset est requis' }]}
            >
              <Input placeholder="Ex: Dragon Ball, One Piece, Naruto..." />
            </Form.Item>
          </Form>
        </Modal>
      </Space>
    </Card>
  );
}
