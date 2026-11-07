import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
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

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ListsScreen />
    </QueryClientProvider>
  );
}

function ListsScreen() {
  const piecesQuery = useQuery({
    queryKey: ['pecas'],
    queryFn: () => getFromApi<Piece[]>('/pecas'),
  });
  const looksQuery = useQuery({
    queryKey: ['looks'],
    queryFn: () => getFromApi<SavedLook[]>('/looks'),
  });

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>ZYRA</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Minhas peças</Text>
          <PieceList
            pieces={piecesQuery.data}
            isPending={piecesQuery.isPending}
            isError={piecesQuery.isError}
            error={piecesQuery.error}
          />
        </View>

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
});
