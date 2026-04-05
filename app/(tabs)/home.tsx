import { useUser } from "@clerk/expo";
import ListHeading from "@/components/ListHeading";
import { ScreenContainer } from "@/components/screen-container";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import {
  HOME_BALANCE,
  HOME_SUBSCRIPTIONS,
  UPCOMING_SUBSCRIPTIONS,
} from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import { formatCurrency } from "@/lib/utils";

import dayjs from "dayjs";
import type { ImageSourcePropType } from "react-native";
import { useMemo, useState } from "react";

import { FlatList, Image, Text, View } from "react-native";

interface HomeListHeaderProps {
  userName: string;
  avatarSource: ImageSourcePropType;
}

const HomeListHeader = ({ userName, avatarSource }: HomeListHeaderProps) => (
  <>
    <View className="home-header">
      <View className="home-user">
        <Image source={avatarSource} className="home-avatar" />
        <Text className="home-user-name">{userName}</Text>
      </View>
      <Image source={icons.add} className="home-add-icon" />
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
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);

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
  const listHeader = useMemo(
    () => <HomeListHeader userName={userName} avatarSource={avatarSource} />,
    [avatarSource, userName],
  );

  return (
    <ScreenContainer>
      <FlatList
        ListHeaderComponent={listHeader}
        data={HOME_SUBSCRIPTIONS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() =>
              setExpandedSubscriptionId(
                expandedSubscriptionId === item.id ? null : item.id,
              )
            }
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
