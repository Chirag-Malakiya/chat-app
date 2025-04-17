import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'recent_stickers';
const MAX_RECENT = 20;

export const addToRecentStickers = async (sticker) => {
    try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        let recents = json ? JSON.parse(json) : [];

        // Remove duplicates by id
        recents = recents.filter((s) => s.id !== sticker.id);

        recents.unshift(sticker);
        if (recents.length > MAX_RECENT) recents = recents.slice(0, MAX_RECENT);

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(recents));
    } catch (e) {
        console.error('Failed to add to recent stickers:', e);
    }
};

export const loadRecentStickers = async () => {
    try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        console.log('JSON.parse(json)----', JSON.parse(json));
        
        return json ? JSON.parse(json) : [];
    } catch (e) {
        console.error('Failed to load recent stickers:', e);
        return [];
    }
};
