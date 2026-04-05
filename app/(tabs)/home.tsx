import { useUser } from "@clerk/expo";
import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import ListHeading from "@/components/ListHeading";
import { ScreenContainer } from "@/components/screen-container";
import { useSubscriptions } from "@/contexts/subscriptions-context";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import {
  HOME_BALANCE,
  UPCOMING_SUBSCRIPTIONS,
} from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import { formatCurrency } from "@/lib/utils";

import dayjs from "dayjs";
import type { ImageSourcePropType } from "react-native";
import { useCallback, useMemo, useState } from "react";

import { FlatList, Image, Pressable, Text, View } from "react-native";
import { usePostHog } from "posthog-react-native";

interface HomeListHeaderProps {
  userName: string;
  avatarSource: ImageSourcePropType;
  onCreatePress: () => void;
}

const HomeListHeader = ({
  userName,
  avatarSource,
  onCreatePress,
}: HomeListHeaderProps) => (
  <>
    <View className="home-header">
      <View className="home-user">
        <Image source={avatarSource} className="home-avatar" />
        <Text className="home-user-name">{userName}</Text>
      </View>
      <Pressable
        onPress={onCreatePress}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="Criar assinatura"
      >
        <Image source={icons.add} className="home-add-icon" />
      </Pressable>
    </View>

    <View className="home-balance-card">
      <Text className="home-balance-label">Saldo</Text>
      <View className="home-balance-row">
        <Text className="home-balance-amount">
          {formatCurrency(HOME_BALANCE.amount)}
        </Text>
        <Text className="home-balance-date">
          {dayjs(HOME_BALANCE.nextRenewalDate).format("DD/MM")}
        </Text>
      </View>
    </View>

    <View className="mb-5">
      <ListHeading title="Próximas cobranças" />

      <FlatList
        data={UPCOMING_SUBSCRIPTIONS}
        keyExtractor={(item) => item.id ?? item.name}
        renderItem={({ item }) => <UpcomingSubscriptionCard {...item} />}
        horizontal
        showsHorizontalScrollIndicator={false}
        className="home-upcoming-list"
        ListEmptyComponent={<Text>Ainda não há cobranças próximas. 🙁 </Text>}
      />
    </View>

    <ListHeading title="Todas as assinaturas" />
  </>
);

export default function Home() {
  const { user } = useUser();
  const { subscriptions, addSubscription } = useSubscriptions();
  const posthog = usePostHog();
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

  const userName =
    user?.fullName?.trim() ||
    user?.firstName?.trim() ||
    user?.username?.trim() ||
    user?.primaryEmailAddress?.emailAddress
      ?.split("@")[0]
      ?.trim() ||
    "Sua conta";
  const avatarSource = useMemo(
    () => (user?.imageUrl ? { uri: user.imageUrl } : images.avatar),
    [user?.imageUrl],
  );
  const handleOpenCreateModal = useCallback(() => {
    setIsCreateModalVisible(true);
  }, []);
  const handleCreateSubscription = (subscription: Subscription) => {
    addSubscription(subscription);
    setExpandedSubscriptionId(subscription.id);
    setIsCreateModalVisible(false);
  };
  const listHeader = useMemo(
    () => (
      <HomeListHeader
        userName={userName}
        avatarSource={avatarSource}
        onCreatePress={handleOpenCreateModal}
      />
    ),
    [avatarSource, handleOpenCreateModal, userName],
  );

  return (
    <ScreenContainer>
      <CreateSubscriptionModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onCreate={handleCreateSubscription}
      />

      <FlatList
        ListHeaderComponent={listHeader}
        data={subscriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() => {
              const isExpanding = expandedSubscriptionId !== item.id;
              setExpandedSubscriptionId(isExpanding ? item.id : null);

              if (isExpanding) {
                const eventProperties = {
                  subscription_id: item.id,
                  subscription_name: item.name,
                  ...(item.category
                    ? { subscription_category: item.category }
                    : {}),
                  ...(item.status ? { subscription_status: item.status } : {}),
                };

                posthog.capture("subscription_card_expanded", eventProperties);
              }
            }}
          />
        )}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text>Ainda não há assinaturas. 🙁 </Text>}
        contentContainerClassName="pb-20"
      />
    </ScreenContainer>
  );
}
