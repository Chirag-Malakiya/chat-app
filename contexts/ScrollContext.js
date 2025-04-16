import React, { createContext, useContext, useRef } from 'react';
import { Animated } from 'react-native';

const ScrollContext = createContext(null);

export const ScrollProvider = ({ children }) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const headerTranslateY = useRef(new Animated.Value(0)).current;

  const isHeaderHidden = useRef(false); // track current state

  const toggleHeader = (show) => {
    if (show === !isHeaderHidden.current) return; // prevent redundant animation

    isHeaderHidden.current = !show;

    Animated.spring(headerTranslateY, {
      toValue: show ? 0 : -100,
      stiffness: 120,
      damping: 20,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: (event) => {
        const currentY = event.nativeEvent.contentOffset.y;
        const diff = currentY - lastScrollY.current;
  
        // ⚠️ iOS bounce protection: ignore if pulling at top
        if (lastScrollY.current < 10 && currentY < 10 && diff <= 0) return;
  
        if (Math.abs(diff) > 5) {
          if (diff > 0) toggleHeader(false); // scroll up
          else toggleHeader(true); // scroll down
        }
  
        lastScrollY.current = currentY;
      },
    }
  );

  const handleScrollEnd = () => {
    const finalY = scrollY.__getValue();
    if (finalY < 100) toggleHeader(true); // snap back near top
  };

  return (
    <ScrollContext.Provider
      value={{
        scrollY,
        handleScroll,
        handleScrollEnd,
        headerTranslateY,
      }}
    >
      {children}
    </ScrollContext.Provider>
  );
};

export const useScroll = () => {
  const context = useContext(ScrollContext);
  if (!context) throw new Error('useScroll must be used within ScrollProvider');
  return context;
};
