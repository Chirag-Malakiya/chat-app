import AsyncStorage from '@react-native-async-storage/async-storage';

const USAGE_KEY = 'STICKER_USAGE';

export const incrementStickerUsage = async (stickerId) => {
    try {
        const data = await AsyncStorage.getItem(USAGE_KEY);
        const usage = data ? JSON.parse(data) : {};
        usage[stickerId] = (usage[stickerId] || 0) + 1;
        await AsyncStorage.setItem(USAGE_KEY, JSON.stringify(usage));
    } catch (e) {
        console.error('Failed to update sticker usage:', e);
    }
};

export const getStickerUsage = async () => {
    try {
        const data = await AsyncStorage.getItem(USAGE_KEY);
        return data ? JSON.parse(data) : {};
    } catch (e) {
        console.error('Failed to get sticker usage:', e);
        return {};
    }
};
