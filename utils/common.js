import moment from "moment";

export const blurhash = '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

export const getChatID = (userID1, userID2) => {
    const sortedIDs = [userID1, userID2].sort();
    const chatID = sortedIDs.join('-');
    return chatID;
};


export const formatChatTimestamp = (timestamp) => {
    if (!timestamp || typeof timestamp.toDate !== 'function') {
        return ''; // or return 'Invalid date', or handle it however you like
    }

    const m = moment(timestamp.toDate());

    if (m.isSame(moment(), 'day')) {
        return m.format('h:mm A'); // e.g., "3:15 PM"
    } else if (m.isSame(moment().subtract(1, 'day'), 'day')) {
        return 'Yesterday';
    } else if (m.isAfter(moment().startOf('week'))) {
        return m.format('dddd'); // e.g., "Monday"
    } else {
        return m.format('D/M/YY'); // e.g., "5/3/24"
    }
};