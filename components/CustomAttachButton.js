// CustomAttachButton.js or inline
import React from 'react';
import { AttachButton } from 'stream-chat-expo';
import { IconPaperclip } from '@tabler/icons-react-native'; // or any icon lib
import { useAttachmentPickerContext } from 'stream-chat-expo';

const CustomAttachButton = (props) => {
  const { selectedPicker } = useAttachmentPickerContext();

  return (
    <AttachButton
      {...props}
      selectedPicker={selectedPicker}
      // Override the icon inside with your custom icon
      children={
        <IconPaperclip
          size={24}
          color={selectedPicker === 'images' ? '#007AFF' : '#888'}
        />
      }
    />
  );
};

export default CustomAttachButton;
{/* <CustomAttachButton {...props} /> */}