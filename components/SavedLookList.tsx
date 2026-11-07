import { Pressable, StyleSheet, Text, View } from 'react-native';
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
  onDeleteLook: (lookId: string) => void;
  deleteFailed: boolean;
};

export default function SavedLookList({
  looks,
  isPending,
  isError,
  error,
  onDeleteLook,
  deleteFailed,
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
      {deleteFailed && (
        <Text accessibilityRole="alert" style={styles.operationError}>
          Não foi possível apagar o look.
        </Text>
      )}
      {looks?.map((look) => (
        <View key={look.id} style={styles.card}>
          <Text style={styles.title}>{look.nome}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => onDeleteLook(look.id)}
            style={({ pressed }) => [styles.deleteButton, pressed && styles.pressedButton]}
          >
            <Text style={styles.deleteButtonText}>Apagar</Text>
          </Pressable>
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D8DED9',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  title: {
    color: '#1F2937',
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FCE8E6',
    borderRadius: 8,
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pressedButton: {
    opacity: 0.8,
  },
  deleteButtonText: {
    color: '#A12A22',
    fontSize: 14,
    fontWeight: '600',
  },
  operationError: {
    color: '#A12A22',
    fontSize: 14,
    marginBottom: 12,
  },
});
