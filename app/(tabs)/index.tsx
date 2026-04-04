import ListHeading from "@/components/ListHeading";
import { ScreenContainer } from "@/components/screen-container";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import {
  HOME_BALANCE,
  HOME_SUBSCRIPTIONS,
  HOME_USER,
  UPCOMING_SUBSCRIPTIONS,
} from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import { formatCurrency } from "@/lib/utils";

import dayjs from "dayjs";
import { useState } from "react";

import { FlatList, Image, Text, View } from "react-native";

const HomeListHeader = () => (
  <>
    <View className="home-header">
      <View className="home-user">
        <Image source={images.avatar} className="home-avatar" />
        <Text className="home-user-name">{HOME_USER.name}</Text>
      </View>
      <Image source={icons.add} className="home-add-icon" />
    </View>

    <View className="home-balance-card">
      <Text className="home-balance-label">Balance</Text>
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
      <ListHeading title="Upcoming" />

      <FlatList
        data={UPCOMING_SUBSCRIPTIONS}
        keyExtractor={(item) => item.id ?? item.name}
        renderItem={({ item }) => <UpcomingSubscriptionCard {...item} />}
        horizontal
        showsHorizontalScrollIndicator={false}
        className="home-upcoming-list"
        ListEmptyComponent={<Text>No upcoming renewals yet. 🙁 </Text>}
      />
    </View>

    <ListHeading title="All Subscriptions" />
  </>
);

export default function App() {
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);
  return (
    <ScreenContainer>
      <FlatList
        ListHeaderComponent={HomeListHeader}
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
        ListEmptyComponent={<Text>No subscriptions yet. 🙁 </Text>}
        contentContainerClassName="pb-20"
      />
    </ScreenContainer>
  );
}
