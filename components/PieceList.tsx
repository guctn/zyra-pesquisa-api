import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import QueryStatus from './QueryStatus';

export type Piece = {
  id: string;
  categoria: string;
  corNome: string;
  imagemMiniUrl: string;
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
      <View style={styles.grid}>
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
            <Image
              source={{ uri: piece.imagemMiniUrl }}
              style={styles.thumbnail}
              resizeMode="cover"
              accessibilityLabel={`${piece.categoria}, ${piece.corNome}`}
            />
            <Text style={styles.title} numberOfLines={1}>
              {piece.categoria}
            </Text>
            <Text style={styles.detail} numberOfLines={1}>
              {piece.corNome}
            </Text>
          </Pressable>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D8DED9',
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
    padding: 6,
    width: '31%',
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
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  detail: {
    color: '#475569',
    fontSize: 11,
  },
  thumbnail: {
    aspectRatio: 1,
    borderRadius: 6,
    width: '100%',
  },
});
