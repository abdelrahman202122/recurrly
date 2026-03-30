import {
  formatCurrency,
  formatStatusLabel,
  formatSubscriptionDateTime,
} from '@/lib/utils';
import { clsx } from 'clsx';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';

const SubscriptionCard = ({
  name,
  price,
  currency,
  icon,
  billing,
  color,
  category,
  plan,
  renewalDate,
  onPress,
  expanded,
  paymentMethod,
  startDate,
  status,
}: SubscriptionCardProps) => {
  return (
    <Pressable
      onPress={onPress}
      className={clsx('sub-card', expanded ? 'sub-card-expanded' : 'bg-card')}
      style={!expanded && color ? { backgroundColor: color } : undefined}
    >
      <View className="sub-head">
        <View className="sub-main">
          <Image source={icon} className="sub-icon" />
          <View className="sub-copy">
            <Text numberOfLines={1} className="sub-title">
              {name}
            </Text>
            <Text numberOfLines={1} ellipsizeMode="tail" className="sub-meta">
              {' '}
              {category?.trim() ||
                plan?.trim() ||
                (renewalDate ? formatSubscriptionDateTime(renewalDate) : '')}
            </Text>
          </View>
        </View>

        <View className="sub-price-box">
          <Text className="sub-price">{formatCurrency(price, currency)}</Text>
          <Text className="sub-billing">{billing}</Text>
        </View>
      </View>

      {expanded && (
        <View className="sub-body">
          <View className="sub-details">
            <SubscriptionRow label="Payment" value={paymentMethod} />
            <SubscriptionRow label="Category" value={category || plan} />
            <SubscriptionRow
              label="Started"
              value={startDate ? formatSubscriptionDateTime(startDate) : ''}
            />
            <SubscriptionRow
              label="Renewal Date"
              value={renewalDate ? formatSubscriptionDateTime(renewalDate) : ''}
            />
            <SubscriptionRow
              label="Status"
              value={status ? formatStatusLabel(status) : ''}
            />
          </View>
        </View>
      )}
    </Pressable>
  );
};

export default SubscriptionCard;

export const SubscriptionRow = ({
  label,
  value,
}: {
  label: string;
  value: string | undefined;
}) => (
  <View className="sub-row">
    <View className="sub-row-copy">
      <Text className="sub-label">{label}:</Text>
      <Text className="sub-value" numberOfLines={1}>
        {value?.trim()}
      </Text>
    </View>
  </View>
);
