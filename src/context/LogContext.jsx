import React, { createContext, useState, useContext, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const LogContext = createContext();

export const useLogs = () => useContext(LogContext);

const initializeLogsFromJSON = async () => {
  const existing = localStorage.getItem('activityLogs');
  if (existing) {
    try {
      return JSON.parse(existing);
    } catch(e) {
      console.error("Error parsing logs from local storage", e);
      localStorage.removeItem('activityLogs');
    }
  }
  
  try {
    const response = await fetch('/data/activity-logs.json');
    const data = await response.json();
    const logs = data.logs || [];
    localStorage.setItem('activityLogs', JSON.stringify(logs));
    return logs;
  } catch (error) {
    console.error('Failed to load activity logs from JSON:', error);
    return [];
  }
};

export const LogProvider = ({ children }) => {
    const [logs, setLogs] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
      const initialize = async () => {
        const logsData = await initializeLogsFromJSON();
        setLogs(logsData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
        setIsInitialized(true);
      };
      
      initialize();
      
      const handleStorageChange = (e) => {
        if (e.key === 'activityLogs') {
          const newLogs = JSON.parse(e.newValue || '[]');
          setLogs(newLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
        }
      };

      window.addEventListener('storage', handleStorageChange);
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }, []);

    const addLog = (message, type = 'info', restaurantId = null) => {
        const newLog = {
            id: uuidv4(),
            message,
            type,
            restaurantId,
            timestamp: new Date().toISOString(),
        };
        const currentLogs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
        const updatedLogs = [newLog, ...currentLogs];
        localStorage.setItem('activityLogs', JSON.stringify(updatedLogs));
        
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'activityLogs',
            newValue: JSON.stringify(updatedLogs),
        }));
    };

    const value = {
        logs,
        addLog,
        isInitialized,
    };

    return (
        <LogContext.Provider value={value}>
            {children}
        </LogContext.Provider>
    );
};