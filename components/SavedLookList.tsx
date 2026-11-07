import { StyleSheet, Text, View } from 'react-native';
import QueryStatus from './QueryStatus';

export type SavedLook = {
  id: string;
  nome: string;
};

type SavedLookListProps = {
  looks: SavedLook[] | undefined;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
};

export default function SavedLookList({
  looks,
  isPending,
  isError,
  error,
}: SavedLookListProps) {
  return (
    <>
      <QueryStatus
        isPending={isPending}
        isError={isError}
        error={error}
        empty={looks?.length === 0}
        emptyMessage="Nenhum look salvo."
      />
      {looks?.map((look) => (
        <View key={look.id} style={styles.card}>
          <Text style={styles.title}>{look.nome}</Text>
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D8DED9',
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  title: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600',
  },
});
