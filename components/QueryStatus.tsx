import { ActivityIndicator, StyleSheet, Text } from 'react-native';

type QueryStatusProps = {
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  empty: boolean;
  emptyMessage: string;
};

export default function QueryStatus({
  isPending,
  isError,
  error,
  empty,
  emptyMessage,
}: QueryStatusProps) {
  if (isPending) {
    return <ActivityIndicator accessibilityLabel="Carregando" color="#315C50" />;
  }

  if (isError) {
    return (
      <Text accessibilityRole="alert" style={styles.message}>
        {error?.message ?? 'Não foi possível carregar os dados.'}
      </Text>
    );
  }

  if (empty) {
    return <Text style={styles.message}>{emptyMessage}</Text>;
  }

  return null;
}

const styles = StyleSheet.create({
  message: {
    color: '#475569',
    fontSize: 14,
    marginBottom: 12,
  },
});
