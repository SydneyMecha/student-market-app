import React from 'react';
import { TouchableOpacity, Share } from 'react-native';
import { Icon } from 'react-native-paper';
import { C, globalStyles } from '../styles/theme';

interface ShareButtonProps {
  title: string;
  message: string;
  url?: string;
  size?: number;
  color?: string;
}

export default function ShareButton({ 
  title, 
  message, 
  url, 
  size = 24, 
  color = C.text 
}: ShareButtonProps) {
  
  const handleShare = async () => {
    try {
      const shareContent = {
        title: title,
        message: `${message}${url ? '\n\nLink: ' + url : ''}`,
      };
      
      await Share.share(shareContent);
    } catch (err) {
      console.error('[Share Button Error]:', err);
    }
  };

  return (
    <TouchableOpacity 
      style={globalStyles.iconBtn} 
      onPress={handleShare}
      activeOpacity={0.7}
    >
      <Icon source="share-variant-outline" size={size} color={color} />
    </TouchableOpacity>
  );
}