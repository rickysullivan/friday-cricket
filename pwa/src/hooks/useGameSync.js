import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured, generateGameId } from '../lib/supabase';

// Generate a persistent umpire ID for this device
const getUmpireId = () => {
  let id = localStorage.getItem('umpire_id');
  if (!id) {
    id = 'umpire_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('umpire_id', id);
  }
  return id;
};

export const useGameSync = () => {
  const [gameId, setGameId] = useState(null);
  const [isViewer, setIsViewer] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [error, setError] = useState(null);

  const channelRef = useRef(null);
  const umpireId = useRef(getUmpireId());

  // Create a new game (umpire mode)
  const createGame = useCallback(async (initialState) => {
    if (!isSupabaseConfigured || !supabase) {
      console.warn('Supabase not configured, skipping sync');
      return null;
    }

    const id = generateGameId();

    try {
      const { error: insertError } = await supabase
        .from('games')
        .insert({
          id,
          state: initialState,
          umpire_id: umpireId.current
        });

      if (insertError) throw insertError;

      setGameId(id);
      setIsViewer(false);
      setIsConnected(true);
      console.log('Game created:', id);
      return id;
    } catch (err) {
      console.error('Failed to create game:', err);
      setError(err.message);
      return null;
    }
  }, []);

  // Join an existing game (viewer mode)
  const joinGame = useCallback(async (id) => {
    if (!isSupabaseConfigured || !supabase) {
      setError('Sync not configured');
      return null;
    }

    try {
      // Check if game exists
      const { data, error: fetchError } = await supabase
        .from('games')
        .select('*')
        .eq('id', id.toUpperCase())
        .single();

      if (fetchError || !data) {
        setError('Game not found');
        return null;
      }

      setGameId(id.toUpperCase());
      setIsViewer(true);
      setIsConnected(true);
      return data.state;
    } catch (err) {
      console.error('Failed to join game:', err);
      setError(err.message);
      return null;
    }
  }, []);

  // Sync state to Supabase (umpire only)
  const syncState = useCallback(async (state) => {
    if (!isSupabaseConfigured || !supabase || !gameId || isViewer) return;

    try {
      const { error: updateError } = await supabase
        .from('games')
        .update({ state })
        .eq('id', gameId);

      if (updateError) throw updateError;
    } catch (err) {
      console.error('Failed to sync state:', err);
      // Don't set error - game continues locally
    }
  }, [gameId, isViewer]);

  // Mark game as ended
  const endGame = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase || !gameId || isViewer) return;

    try {
      await supabase
        .from('games')
        .update({ ended_at: new Date().toISOString() })
        .eq('id', gameId);
    } catch (err) {
      console.error('Failed to mark game ended:', err);
    }
  }, [gameId, isViewer]);

  // Reconnect as umpire to an existing game
  const reconnectAsUmpire = useCallback(async (id) => {
    if (!isSupabaseConfigured || !supabase) {
      console.warn('Supabase not configured, cannot reconnect');
      return null;
    }

    try {
      // Verify game exists and we're the umpire
      const { data, error: fetchError } = await supabase
        .from('games')
        .select('*')
        .eq('id', id.toUpperCase())
        .eq('umpire_id', umpireId.current)
        .single();

      if (fetchError || !data) {
        console.log('Game not found or not umpire');
        return null;
      }

      setGameId(id.toUpperCase());
      setIsViewer(false);
      setIsConnected(true);
      console.log('Reconnected as umpire:', id);
      return data.state;
    } catch (err) {
      console.error('Failed to reconnect as umpire:', err);
      setError(err.message);
      return null;
    }
  }, []);

  // Leave/disconnect from game
  const leaveGame = useCallback(() => {
    if (channelRef.current) {
      supabase?.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    setGameId(null);
    setIsViewer(false);
    setIsConnected(false);
    setViewerCount(0);
  }, []);

  // Subscribe to realtime updates and presence
  const subscribeToGame = useCallback((onStateChange) => {
    if (!isSupabaseConfigured || !supabase || !gameId) return () => {};

    // Create channel for this game
    const channel = supabase.channel(`game:${gameId}`, {
      config: {
        presence: { key: umpireId.current }
      }
    });

    // Listen for state changes
    channel
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${gameId}` },
        (payload) => {
          if (isViewer && payload.new?.state) {
            onStateChange(payload.new.state);
          }
        }
      )
      // Track presence for viewer count
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        setViewerCount(count > 0 ? count - 1 : 0); // Exclude umpire
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString() });
          setIsConnected(true);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setIsConnected(false);
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, isViewer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        supabase?.removeChannel(channelRef.current);
      }
    };
  }, []);

  return {
    // State
    gameId,
    isViewer,
    isConnected,
    viewerCount,
    error,
    isConfigured: isSupabaseConfigured,

    // Actions
    createGame,
    joinGame,
    reconnectAsUmpire,
    syncState,
    endGame,
    leaveGame,
    subscribeToGame,
    clearError: () => setError(null)
  };
};
