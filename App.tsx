import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import PieceList, { type Piece } from './components/PieceList';
import QueryStatus from './components/QueryStatus';
import SavedLookList, { type SavedLook } from './components/SavedLookList';

const queryClient = new QueryClient();
const apiUrl = process.env.EXPO_PUBLIC_API_URL;
const apiToken = process.env.EXPO_PUBLIC_API_TOKEN;

async function getFromApi<T>(path: string): Promise<T> {
  if (!apiUrl) {
    throw new Error('Defina EXPO_PUBLIC_API_URL em .env.local.');
  }

  if (!apiToken) {
    throw new Error('Defina EXPO_PUBLIC_API_TOKEN em .env.local.');
  }

  const response = await fetch(`${apiUrl.replace(/\/+$/, '')}${path}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${apiToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`A solicitação falhou (HTTP ${response.status}).`);
  }

  return (await response.json()) as T;
}

async function postToApi<T>(path: string, body: unknown): Promise<T> {
  if (!apiUrl) {
    throw new Error('Defina EXPO_PUBLIC_API_URL em .env.local.');
  }

  if (!apiToken) {
    throw new Error('Defina EXPO_PUBLIC_API_TOKEN em .env.local.');
  }

  const response = await fetch(`${apiUrl.replace(/\/+$/, '')}${path}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`A solicitação falhou (HTTP ${response.status}).`);
  }

  return (await response.json()) as T;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ListsScreen />
    </QueryClientProvider>
  );
}

function ListsScreen() {
  const queryClient = useQueryClient();
  const [selectedPieceIds, setSelectedPieceIds] = useState<string[]>([]);
  const piecesQuery = useQuery({
    queryKey: ['pecas'],
    queryFn: () => getFromApi<Piece[]>('/pecas'),
  });
  const looksQuery = useQuery({
    queryKey: ['looks'],
    queryFn: () => getFromApi<SavedLook[]>('/looks'),
  });
  const saveLookMutation = useMutation({
    mutationFn: (pecaIds: string[]) =>
      postToApi<SavedLook>('/looks', {
        pecaIds,
        nome: `Look com ${pecaIds.length} peças`,
      }),
    onSuccess: async () => {
      setSelectedPieceIds([]);
      await queryClient.invalidateQueries({ queryKey: ['looks'] });
    },
  });

  function togglePieceSelection(pieceId: string) {
    setSelectedPieceIds((currentIds) =>
      currentIds.includes(pieceId)
        ? currentIds.filter((id) => id !== pieceId)
        : [...currentIds, pieceId],
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>ZYRA</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Minhas peças</Text>
          <PieceList
            pieces={piecesQuery.data}
            selectedPieceIds={selectedPieceIds}
            onTogglePiece={togglePieceSelection}
            isPending={piecesQuery.isPending}
            isError={piecesQuery.isError}
            error={piecesQuery.error}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => saveLookMutation.mutate(selectedPieceIds)}
          style={({ pressed }) => [styles.saveButton, pressed && styles.saveButtonPressed]}
        >
          <Text style={styles.saveButtonText}>Salvar look</Text>
        </Pressable>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Looks salvos</Text>
          <SavedLookList
            looks={looksQuery.data}
            isPending={looksQuery.isPending}
            isError={looksQuery.isError}
            error={looksQuery.error}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F5',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 32,
  },
  title: {
    color: '#1F2937',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    color: '#1F2937',
    fontSize: 21,
    fontWeight: '700',
    marginBottom: 12,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: '#315C50',
    borderRadius: 10,
    marginBottom: 28,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  saveButtonPressed: {
    opacity: 0.8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
