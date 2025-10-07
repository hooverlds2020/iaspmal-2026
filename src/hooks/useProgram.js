// src/hooks/useProgram.js
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useProgram = () => {
  const [symposiums, setSymposiums] = useState([]);
  const [specialEvents, setSpecialEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProgramData();
  }, []);

  const loadProgramData = async () => {
    try {
      setLoading(true);

      // Cargar simposios con sus sesiones usando la vista
      const { data: symposiumsData, error: symError } = await supabase
        .from('symposiums_with_sessions')
        .select('*')
        .order('number');

      if (symError) throw symError;

      // Cargar eventos especiales
      const { data: eventsData, error: evError } = await supabase
        .from('special_events')
        .select('*, rooms(name)')
        .order('day, start_time');

      if (evError) throw evError;

      setSymposiums(symposiumsData || []);
      setSpecialEvents(eventsData || []);
      setError(null);
    } catch (err) {
      console.error('Error loading program:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { symposiums, specialEvents, loading, error, reload: loadProgramData };
};
