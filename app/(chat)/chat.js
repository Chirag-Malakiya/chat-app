import { StyleSheet, View } from "react-native";
import { ChannelList } from "stream-chat-expo";
import { useContext, useMemo } from "react";
import { chatUserId } from "../../chatConfig";
import { useRouter } from "expo-router";
import { AppContext } from "../../contexts/AppContext";

const filters = {
  members: { $in: [chatUserId] },
  type: "messaging",
};
const sort = { last_updated: -1 };
const options = {
  state: true,
  watch: true,
};

export default function ChannelListScreen() {
  const memoizedFilters = useMemo(() => filters, []);
  const router = useRouter();
  const { setChannel } = useContext(AppContext);

  return (
    <View style={styles.container}>
      <ChannelList
        filters={memoizedFilters}
        options={options}
        sort={sort}
        onSelect={(channel) => {
          setChannel(channel);
          router.push(`/channel/${channel.cid}`);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 100,
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
    overflow: 'hidden'
  },
});