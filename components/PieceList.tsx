import { Pressable, StyleSheet, Text } from 'react-native';
import QueryStatus from './QueryStatus';

export type Piece = {
  id: string;
  categoria: string;
  corNome: string;
};

type PieceListProps = {
  pieces: Piece[] | undefined;
  selectedPieceIds: string[];
  onTogglePiece: (pieceId: string) => void;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
};

export default function PieceList({
  pieces,
  selectedPieceIds,
  onTogglePiece,
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
        <Pressable
          key={piece.id}
          accessibilityRole="button"
          accessibilityState={{ selected: selectedPieceIds.includes(piece.id) }}
          onPress={() => onTogglePiece(piece.id)}
          style={({ pressed }) => [
            styles.card,
            selectedPieceIds.includes(piece.id) && styles.selectedCard,
            pressed && styles.pressedCard,
          ]}
        >
          <Text style={styles.title}>{piece.categoria}</Text>
          <Text style={styles.detail}>{piece.corNome}</Text>
        </Pressable>
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
  selectedCard: {
    backgroundColor: '#E4F0EA',
    borderColor: '#315C50',
    borderWidth: 2,
  },
  pressedCard: {
    opacity: 0.8,
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
