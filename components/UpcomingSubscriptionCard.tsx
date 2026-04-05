import { formatCurrency } from "@/lib/utils";
import { Image, Text, View } from "react-native";

const UpcomingSubscriptionCard = ({
  name,
  price,
  daysLeft,
  icon,
  currency,
}: UpcomingSubscriptionCardProps) => {
  const getDaysLeftText = () => {
    if (daysLeft > 1) return `${daysLeft} dias restantes`;
    if (daysLeft === 1) return "Último dia!";
    return "Expirada!";
  };

  return (
    <View className="upcoming-card">
      <View className="upcoming-row">
        <Image source={icon} className="upcoming-icon" />
        <View>
          <Text className="upcoming-price">
            {formatCurrency(price, currency ?? "BRL")}
          </Text>
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
