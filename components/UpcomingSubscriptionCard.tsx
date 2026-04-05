import { formatCurrency } from "@/lib/utils";
import { Image, Text, View } from "react-native";

interface UpcomingSubscription {
  id: string;
  icon: any;
  name: string;
  price: number;
  currency: string;
  daysLeft: number;
}

const UpcomingSubscriptionCard = ({
  name,
  price,
  currency,
  daysLeft,
  icon,
}: UpcomingSubscription) => {
  const getDaysLeftText = () => {
    if (daysLeft > 1) return `${daysLeft} days left`;
    if (daysLeft === 1) return "Last day!";
    return "Expired!";
  };

  return (
    <View className="upcoming-card">
      <View className="upcoming-row">
        <Image source={icon} className="upcoming-icon" />
        <View>
          <Text className="upcoming-price">{formatCurrency(price, currency)}</Text>
          <Text className="upcoming-meta" numberOfLines={1}>
            {getDaysLeftText()}
          </Text>
        </View>
      </View>
      <View>
        <Text className="upcoming-name" numberOfLines={1}>
          {name}
        </Text>
      </View>
    </View>
  );
};

export default UpcomingSubscriptionCard;