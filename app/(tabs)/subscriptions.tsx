import { ScreenContainer } from "@/components/screen-container";
import { useSubscriptions } from "@/contexts/subscriptions-context";
import SubscriptionCard from "@/components/SubscriptionCard";
import { colors } from "@/constants/theme";
import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";

const Subscriptions = () => {
  const { subscriptions } = useSubscriptions();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);

  const normalizedSearchTerm = searchTerm.trim().toLocaleLowerCase("pt-BR");
  const hasActiveSearch = normalizedSearchTerm.length > 0;

  const clearSearch = () => {
    setSearchTerm("");
    setExpandedSubscriptionId(null);
  };

  const filteredSubscriptions = useMemo(() => {
    if (!normalizedSearchTerm) {
      return subscriptions;
    }

    return subscriptions.filter((subscription) => {
      const searchableFields = [
        subscription.name,
        subscription.plan,
        subscription.category,
        subscription.paymentMethod,
        subscription.status,
      ];

      return searchableFields.some((field) =>
        field?.toLocaleLowerCase("pt-BR").includes(normalizedSearchTerm),
      );
    });
  }, [normalizedSearchTerm, subscriptions]);

  const resultsCopy =
    filteredSubscriptions.length === subscriptions.length && !hasActiveSearch
      ? `${subscriptions.length} assinaturas cadastradas`
      : `${filteredSubscriptions.length} resultado${
          filteredSubscriptions.length === 1 ? "" : "s"
        } encontrado${filteredSubscriptions.length === 1 ? "" : "s"}`;

  return (
    <ScreenContainer>
      <View className="subscriptions-header">
        <Text className="subscriptions-title">Minhas assinaturas</Text>
        <Text className="subscriptions-subtitle">
          Busque por serviço, plano, categoria ou forma de pagamento.
        </Text>
      </View>

      <View className="subscriptions-search-shell">
        <TextInput
          className="subscriptions-search-input"
          value={searchTerm}
          onChangeText={(value) => {
            setSearchTerm(value);
            setExpandedSubscriptionId(null);
          }}
          placeholder="Buscar assinatura"
          placeholderTextColor={colors.mutedForeground}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
          returnKeyType="search"
          underlineColorAndroid="transparent"
          selectionColor={colors.primary}
          cursorColor={colors.primary}
        />
      </View>

      <View className="subscriptions-results-row">
        <Text className="subscriptions-results">{resultsCopy}</Text>

        {hasActiveSearch ? (
          <Pressable onPress={clearSearch} hitSlop={8}>
            <Text className="subscriptions-clear-action">Limpar busca</Text>
          </Pressable>
        ) : null}
      </View>

      <FlatList
        data={filteredSubscriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() =>
              setExpandedSubscriptionId((currentExpandedId) =>
                currentExpandedId === item.id ? null : item.id,
              )
            }
          />
        )}
        ItemSeparatorComponent={() => <View className="h-4" />}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-20"
        ListEmptyComponent={
          <View className="rounded-2xl border border-border bg-card p-5">
            <Text className="subscriptions-empty-title">
              Nenhuma assinatura encontrada
            </Text>
            <Text className="subscriptions-empty-copy">
              Tente buscar pelo nome do serviço, plano ou categoria.
            </Text>
          </View>
        }
      />
    </ScreenContainer>
  );
};

export default Subscriptions;
