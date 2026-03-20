import React, { createContext, useContext, useState, useEffect } from 'react';
import LocalDatabase from '../services/LocalDatabase';
import ApiService from '../services/ApiService';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [megabytesLeft, setMegabytesLeft] = useState(0);
  const [dailyLimit] = useState(300);
  const [adsWatched, setAdsWatched] = useState(0);
  const [esimActive, setEsimActive] = useState(false);
  const [userId, setUserId] = useState('local');
  const [isLoading, setIsLoading] = useState(true);

  const percentUsed = dailyLimit > 0 ? (dailyLimit - megabytesLeft) / dailyLimit : 0;

  useEffect(() => {
    loadFromDb();
  }, []);

  const loadFromDb = async () => {
    setIsLoading(true);
    try {
      await LocalDatabase.init();
      const user = await LocalDatabase.getUser('local');
      const today = new Date().toISOString().substring(0, 10);

      if (user) {
        if (user.last_reset !== today) {
          await LocalDatabase.resetDaily('local');
          setMegabytesLeft(0);
          setAdsWatched(0);
        } else {
          setMegabytesLeft(user.mb_left || 0);
          setAdsWatched(user.ads_watched || 0);
        }
        setEsimActive(user.esim_active === 1);
        setUserId(user.id);
      } else {
        await LocalDatabase.saveUser({
          id: 'local',
          email: '',
          phone: '',
          mb_left: 0,
          daily_limit: 300,
          ads_watched: 0,
          esim_active: 0,
          last_reset: today,
        });
      }
    } catch (e) {
      console.error('Erreur loadFromDb:', e);
    }
    setIsLoading(false);
  };

  const onAdWatched = async (brand = 'Inconnu') => {
    const newAds = adsWatched + 1;
    const newMb = Math.min(megabytesLeft + 50, dailyLimit);

    setAdsWatched(newAds);
    setMegabytesLeft(newMb);

    try {
      await LocalDatabase.updateMbLeft(userId, newMb);
      await LocalDatabase.updateAdsWatched(userId, newAds);
      await LocalDatabase.saveAdView({ userId, mbGranted: 50, brand });
      await LocalDatabase.recordDailyUsage({
        userId,
        mbUsed: dailyLimit - newMb,
        adsCount: newAds,
      });
      // Sync backend silencieuse
      ApiService.reportAdWatched(userId, 50).catch(() => {});
    } catch (e) {
      console.error('Erreur onAdWatched:', e);
    }
  };

  const consumeMb = async (mb) => {
    const newMb = Math.max(megabytesLeft - mb, 0);
    setMegabytesLeft(newMb);
    await LocalDatabase.updateMbLeft(userId, newMb);
  };

  return (
    <UserContext.Provider value={{
      megabytesLeft,
      dailyLimit,
      adsWatched,
      esimActive,
      isLoading,
      percentUsed,
      onAdWatched,
      consumeMb,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
