'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Card, Checkbox, Button, Space, Typography, Spin, App, Tag, Divider, Flex } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { DragonBallCharacter } from '@/customdata/dragonballapi/types';
import { Character } from '@/types';

const { Title, Text } = Typography;

interface DragonBallSelectorProps {
  onSelectionComplete: (characters: Character[]) => void;
}

export default function DragonBallSelector({ onSelectionComplete }: DragonBallSelectorProps) {
  const [loading, setLoading] = useState(true);
  const [allCharacters, setAllCharacters] = useState<DragonBallCharacter[]>([]);
  const [races, setRaces] = useState<string[]>([]);
  const [affiliations, setAffiliations] = useState<string[]>([]);
  const [selectedRaces, setSelectedRaces] = useState<string[]>([]);
  const [selectedAffiliations, setSelectedAffiliations] = useState<string[]>([]);
  const [includeTransformations, setIncludeTransformations] = useState(true);
  const [selectedCharacters, setSelectedCharacters] = useState<Set<string>>(new Set());
  const { message } = App.useApp();
  const lastSelectionRef = useRef<string>('');

  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dragonball/characters');
      const data = await response.json();
      
      console.log('Loaded characters:', data.characters.length);
      console.log('First character:', data.characters[0]);
      console.log('Characters with transformations:', data.characters.filter((c: any) => c.transformations && c.transformations.length > 0).length);
      
      setAllCharacters(data.characters);
      setRaces(data.filters.races);
      setAffiliations(data.filters.affiliations);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load Dragon Ball characters:', error);
      message.error('Erreur lors du chargement des personnages');
      setLoading(false);
    }
  };

  const filteredCharacters = useMemo(() => {
    if (!allCharacters || allCharacters.length === 0) {
      return [];
    }

    let filtered = allCharacters;

    // Filter by race
    if (selectedRaces.length > 0) {
      filtered = filtered.filter(char => char && char.race && selectedRaces.includes(char.race));
    }

    // Filter by affiliation
    if (selectedAffiliations.length > 0) {
      filtered = filtered.filter(char => char && char.affiliation && selectedAffiliations.includes(char.affiliation));
    }

    // Flatten with transformations
    const result: { name: string; imageUrl: string }[] = [];
    let transformationsCount = 0;
    
    filtered.forEach(char => {
      if (!char) return;
      
      // Add base character only if transformations are not included
      if (!includeTransformations) {
        result.push({ name: char.name, imageUrl: char.image });
      } else {
        // When including transformations, add base + all transformations as separate characters
        result.push({ name: char.name, imageUrl: char.image });
        
        if (char.transformations && Array.isArray(char.transformations)) {
          console.log(`${char.name} has ${char.transformations.length} transformations:`, char.transformations.map(t => t?.name));
          char.transformations.forEach(trans => {
            if (trans && trans.name && trans.image) {
              result.push({ name: trans.name, imageUrl: trans.image });
              transformationsCount++;
            }
          });
        }
      }
    });

    console.log('Filtered characters:', result.length, 'base:', filtered.length, 'transformations added:', transformationsCount, 'includeTransformations:', includeTransformations);
    return result;
  }, [allCharacters, selectedRaces, selectedAffiliations, includeTransformations]);

  const totalAvailableCharacters = useMemo(() => {
    let count = allCharacters.length;
    if (includeTransformations) {
      allCharacters.forEach(char => {
        if (char.transformations && Array.isArray(char.transformations)) {
          count += char.transformations.length;
        }
      });
    }
    return count;
  }, [allCharacters, includeTransformations]);

  useEffect(() => {
    // Auto-select/deselect filtered characters when filters change
    const newSelected = new Set(selectedCharacters);
    
    // Build filtered characters list based on current filters
    let filtered = allCharacters;
    if (selectedRaces.length > 0) {
      filtered = filtered.filter(char => char && char.race && selectedRaces.includes(char.race));
    }
    if (selectedAffiliations.length > 0) {
      filtered = filtered.filter(char => char && char.affiliation && selectedAffiliations.includes(char.affiliation));
    }
    
    // Get current filtered character names (with transformations if enabled)
    const currentFilteredNames = new Set<string>();
    filtered.forEach(char => {
      if (!char) return;
      currentFilteredNames.add(char.name);
      if (includeTransformations && char.transformations && Array.isArray(char.transformations)) {
        char.transformations.forEach(trans => {
          if (trans && trans.name) {
            currentFilteredNames.add(trans.name);
          }
        });
      }
    });
    
    // Get all possible filterable characters (to know which to remove)
    const allFilterableChars = allCharacters.filter(char => {
      const matchesAnyRace = races.some(race => char.race === race);
      const matchesAnyAffiliation = affiliations.some(aff => char.affiliation === aff);
      return matchesAnyRace || matchesAnyAffiliation;
    });
    
    const allFilterableNames = new Set<string>();
    allFilterableChars.forEach(char => {
      allFilterableNames.add(char.name);
      if (includeTransformations && char.transformations) {
        char.transformations.forEach(trans => {
          if (trans && trans.name) allFilterableNames.add(trans.name);
        });
      }
    });
    
    // Remove characters that are filterable but not in current filter
    allFilterableNames.forEach(name => {
      if (!currentFilteredNames.has(name)) {
        newSelected.delete(name);
      }
    });
    
    // Add characters that match current filters
    if (selectedRaces.length > 0 || selectedAffiliations.length > 0) {
      currentFilteredNames.forEach(name => newSelected.add(name));
    }
    
    setSelectedCharacters(newSelected);
  }, [selectedRaces.join(','), selectedAffiliations.join(','), includeTransformations]);

  useEffect(() => {
    // Auto-update parent component whenever selection changes
    const selected = filteredCharacters.filter(char => selectedCharacters.has(char.name));
    const selectionKey = Array.from(selectedCharacters).sort().join(',');
    
    // Only call onSelectionComplete if the selection actually changed
    if (lastSelectionRef.current !== selectionKey) {
      lastSelectionRef.current = selectionKey;
      onSelectionComplete(selected);
    }
  }, [selectedCharacters, filteredCharacters]);

  const handleSelectAll = () => {
    const newSelected = new Set(filteredCharacters.map(c => c.name));
    setSelectedCharacters(newSelected);
  };

  const handleDeselectAll = () => {
    setSelectedCharacters(new Set());
  };

  const handleToggleCharacter = (name: string) => {
    const newSelected = new Set(selectedCharacters);
    if (newSelected.has(name)) {
      newSelected.delete(name);
    } else {
      newSelected.add(name);
    }
    setSelectedCharacters(newSelected);
  };

  if (loading) {
    return (
      <Card>
        <div className="text-center py-8">
          <Spin size="large" />
          <div className="mt-4">Chargement des personnages Dragon Ball...</div>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Sélection des personnages Dragon Ball">
      <Space orientation="vertical" className="w-full" size="middle">
        {/* Transformations toggle */}
        <div>
          <Checkbox
            checked={includeTransformations}
            onChange={(e) => setIncludeTransformations(e.target.checked)}
          >
            <Text strong>Inclure les transformations comme personnages distincts</Text>
          </Checkbox>
        </div>

        <Divider><Text strong>Filtres de sélection rapide</Text></Divider>

        {/* Race filter */}
        <div>
          <Text strong>Races</Text>
          <div className="mt-2">
            <Checkbox.Group
              value={selectedRaces}
              onChange={(values) => setSelectedRaces(values as string[])}
            >
              <Flex wrap="wrap" gap="small">
                {races.map(race => (
                  <Checkbox key={race} value={race}>
                    {race}
                  </Checkbox>
                ))}
              </Flex>
            </Checkbox.Group>
          </div>
        </div>

        {/* Affiliation filter */}
        <div>
          <Text strong>Affiliations</Text>
          <div className="mt-2">
            <Checkbox.Group
              value={selectedAffiliations}
              onChange={(values) => setSelectedAffiliations(values as string[])}
            >
              <Flex wrap="wrap" gap="small">
                {affiliations.map(affiliation => (
                  <Checkbox key={affiliation} value={affiliation}>
                    {affiliation}
                  </Checkbox>
                ))}
              </Flex>
            </Checkbox.Group>
          </div>
        </div>

        <Divider />

        {/* Quick actions */}
        <Flex justify="space-between" align="center">
          <Text type="secondary">
            {totalAvailableCharacters} personnages disponibles • {selectedCharacters.size} sélectionnés
          </Text>
          <Space>
            <Button icon={<CheckOutlined />} onClick={handleSelectAll}>
              Tout sélectionner
            </Button>
            <Button icon={<CloseOutlined />} onClick={handleDeselectAll}>
              Tout désélectionner
            </Button>
          </Space>
        </Flex>

        {/* Character selection */}
        <Checkbox.Group
          value={Array.from(selectedCharacters)}
          onChange={(values) => setSelectedCharacters(new Set(values as string[]))}
          className="w-full"
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {(() => {
              // Always show all characters, with or without transformations
              const allCharsToDisplay: { name: string; imageUrl: string }[] = [];
              allCharacters.forEach(char => {
                allCharsToDisplay.push({ name: char.name, imageUrl: char.image });
                if (includeTransformations && char.transformations && Array.isArray(char.transformations)) {
                  char.transformations.forEach(trans => {
                    if (trans && trans.name && trans.image) {
                      allCharsToDisplay.push({ name: trans.name, imageUrl: trans.image });
                    }
                  });
                }
              });
              return allCharsToDisplay;
            })().map((char) => (
              <Checkbox key={char.name} value={char.name}>
                {char.name}
              </Checkbox>
            ))}
          </div>
        </Checkbox.Group>
      </Space>
    </Card>
  );
}
