import { icons } from "@/constants/icons";
import { colors } from "@/constants/theme";
import { posthog } from "@/lib/posthog";
import { clsx } from "clsx";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

const FREQUENCY_OPTIONS = [
  { label: "Mensal", value: "Mensal" },
  { label: "Anual", value: "Anual" },
] as const;

const CATEGORY_OPTIONS = [
  "Entretenimento",
  "Ferramentas de IA",
  "Ferramentas de desenvolvimento",
  "Design",
  "Produtividade",
  "Cloud",
  "Música",
  "Outros",
] as const;

const CATEGORY_COLORS: Record<(typeof CATEGORY_OPTIONS)[number], string> = {
  Entretenimento: "#f5c542",
  "Ferramentas de IA": "#b8d4e3",
  "Ferramentas de desenvolvimento": "#e8def8",
  Design: "#b8e8d0",
  Produtividade: "#f2d6a2",
  Cloud: "#c7dfff",
  Música: "#ffd6cc",
  Outros: "#d9dccf",
};

interface CreateSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (subscription: Subscription) => void;
}

const buildSubscriptionId = (name: string) => {
  const normalizedName = name
    .toLocaleLowerCase("pt-BR")
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${normalizedName || "nova-assinatura"}-${Date.now()}`;
};

const buildRenewalDate = (frequency: "Mensal" | "Anual") => {
  const amount = frequency === "Mensal" ? 1 : 1;
  const unit = frequency === "Mensal" ? "month" : "year";

  return dayjs().add(amount, unit).toISOString();
};

export default function CreateSubscriptionModal({
  visible,
  onClose,
  onCreate,
}: CreateSubscriptionModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [frequency, setFrequency] = useState<"Mensal" | "Anual">("Mensal");
  const [category, setCategory] =
    useState<(typeof CATEGORY_OPTIONS)[number]>("Entretenimento");
  const [errors, setErrors] = useState<{
    name?: string;
    price?: string;
    paymentMethod?: string;
  }>({});

  const canSubmit = useMemo(() => {
    return (
      name.trim().length > 0 &&
      price.trim().length > 0 &&
      paymentMethod.trim().length > 0
    );
  }, [name, paymentMethod, price]);

  const resetForm = () => {
    setName("");
    setPrice("");
    setPaymentMethod("");
    setFrequency("Mensal");
    setCategory("Entretenimento");
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    const normalizedName = name.trim();
    const normalizedPrice = price.replace(",", ".").trim();
    const normalizedPaymentMethod = paymentMethod.trim();
    const parsedPrice = Number(normalizedPrice);

    const nextErrors = {
      name: normalizedName ? undefined : "Informe o nome da assinatura.",
      price:
        Number.isFinite(parsedPrice) && parsedPrice > 0
          ? undefined
          : "Informe um valor maior que zero.",
      paymentMethod: normalizedPaymentMethod
        ? undefined
        : "Informe a forma de pagamento.",
    };

    setErrors(nextErrors);

    if (nextErrors.name || nextErrors.price || nextErrors.paymentMethod) {
      return;
    }

    const startDate = dayjs().toISOString();
    const subscription: Subscription = {
      id: buildSubscriptionId(normalizedName),
      icon: icons.wallet,
      name: normalizedName,
      plan: category,
      category,
      paymentMethod: normalizedPaymentMethod,
      status: "ativa",
      startDate,
      price: parsedPrice,
      currency: "BRL",
      billing: frequency,
      renewalDate: buildRenewalDate(frequency),
      color: CATEGORY_COLORS[category],
    };

    onCreate(subscription);

    posthog.capture("subscription_created", {
      subscription_name: subscription.name,
      subscription_price: subscription.price,
      subscription_frequency: subscription.billing,
      subscription_category: subscription.category ?? null,
    });
    handleClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View className="modal-overlay">
        <Pressable className="absolute inset-0" onPress={handleClose} />

        <KeyboardAvoidingView
          className="flex-1 justify-end"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View className="modal-container">
            <View className="modal-header">
              <Text className="modal-title">Nova assinatura</Text>
              <Pressable className="modal-close" onPress={handleClose}>
                <Text className="modal-close-text">×</Text>
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View className="modal-body pb-8">
                <View className="auth-field">
                  <Text className="auth-label">Nome</Text>
                  <View
                    className={clsx(
                      "auth-input-shell",
                      errors.name && "auth-input-shell-error",
                    )}
                  >
                    <TextInput
                      className={clsx(
                        "auth-input",
                        errors.name && "auth-input-error",
                      )}
                      value={name}
                      onChangeText={(value) => {
                        setName(value);
                        setErrors((currentErrors) => ({
                          ...currentErrors,
                          name: undefined,
                        }));
                      }}
                      placeholder="Ex.: Spotify"
                      placeholderTextColor={colors.mutedForeground}
                      autoCapitalize="words"
                      returnKeyType="next"
                    />
                  </View>
                  {errors.name ? (
                    <Text className="auth-error">{errors.name}</Text>
                  ) : null}
                </View>

                <View className="auth-field">
                  <Text className="auth-label">Preço</Text>
                  <View
                    className={clsx(
                      "auth-input-shell",
                      errors.price && "auth-input-shell-error",
                    )}
                  >
                    <TextInput
                      className={clsx(
                        "auth-input",
                        errors.price && "auth-input-error",
                      )}
                      value={price}
                      onChangeText={(value) => {
                        setPrice(value);
                        setErrors((currentErrors) => ({
                          ...currentErrors,
                          price: undefined,
                        }));
                      }}
                      placeholder="Ex.: 29,90"
                      placeholderTextColor={colors.mutedForeground}
                      keyboardType="decimal-pad"
                      returnKeyType="done"
                    />
                  </View>
                  {errors.price ? (
                    <Text className="auth-error">{errors.price}</Text>
                  ) : null}
                </View>

                <View className="auth-field">
                  <Text className="auth-label">Forma de pagamento</Text>
                  <View
                    className={clsx(
                      "auth-input-shell",
                      errors.paymentMethod && "auth-input-shell-error",
                    )}
                  >
                    <TextInput
                      className={clsx(
                        "auth-input",
                        errors.paymentMethod && "auth-input-error",
                      )}
                      value={paymentMethod}
                      onChangeText={(value) => {
                        setPaymentMethod(value);
                        setErrors((currentErrors) => ({
                          ...currentErrors,
                          paymentMethod: undefined,
                        }));
                      }}
                      placeholder="Ex.: Visa final 8530"
                      placeholderTextColor={colors.mutedForeground}
                      autoCapitalize="words"
                      returnKeyType="next"
                    />
                  </View>
                  {errors.paymentMethod ? (
                    <Text className="auth-error">{errors.paymentMethod}</Text>
                  ) : null}
                </View>

                <View className="auth-field">
                  <Text className="auth-label">Frequência</Text>
                  <View className="picker-row">
                    {FREQUENCY_OPTIONS.map((option) => {
                      const isActive = frequency === option.value;

                      return (
                        <Pressable
                          key={option.value}
                          className={clsx(
                            "picker-option",
                            isActive && "picker-option-active",
                          )}
                          onPress={() => setFrequency(option.value)}
                        >
                          <Text
                            className={clsx(
                              "picker-option-text",
                              isActive && "picker-option-text-active",
                            )}
                          >
                            {option.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <View className="auth-field">
                  <Text className="auth-label">Categoria</Text>
                  <View className="category-scroll">
                    {CATEGORY_OPTIONS.map((option) => {
                      const isActive = category === option;

                      return (
                        <Pressable
                          key={option}
                          className={clsx(
                            "category-chip",
                            isActive && "category-chip-active",
                          )}
                          onPress={() => setCategory(option)}
                        >
                          <Text
                            className={clsx(
                              "category-chip-text",
                              isActive && "category-chip-text-active",
                            )}
                          >
                            {option}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <Pressable
                  className={clsx(
                    "auth-button",
                    !canSubmit && "auth-button-disabled",
                  )}
                  disabled={!canSubmit}
                  onPress={handleSubmit}
                >
                  <Text className="auth-button-text">Salvar assinatura</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
