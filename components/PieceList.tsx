import { StyleSheet, Text, View } from 'react-native';
import QueryStatus from './QueryStatus';

export type Piece = {
  id: string;
  categoria: string;
  corNome: string;
};

type PieceListProps = {
  pieces: Piece[] | undefined;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
};

export default function PieceList({
  pieces,
  isPending,
  isError,
  error,
}: PieceListProps) {
  return (
    <>
      <QueryStatus
        isPending={isPending}
        isError={isError}
        error={error}
        empty={pieces?.length === 0}
        emptyMessage="Nenhuma peça encontrada."
      />
      {pieces?.map((piece) => (
        <View key={piece.id} style={styles.card}>
          <Text style={styles.title}>{piece.categoria}</Text>
          <Text style={styles.detail}>{piece.corNome}</Text>
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
  detail: {
    color: '#475569',
    fontSize: 14,
    marginTop: 4,
  },
});
