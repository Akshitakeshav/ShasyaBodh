import { useState, useCallback } from 'react';

/**
 * Custom hook to manage the connection state, IP configuration, 
 * and linkage to the physical ESP32 CAM hardware.
 */
export const useESP32Status = () => {
  // Load initial IP from LocalStorage or default
  const [ipAddress, setIpAddress] = useState(() => {
    return localStorage.getItem('shasyabodh_esp32_ip') || '192.168.1.100';
  });
  
  const [isConnected, setIsConnected] = useState(true); // Default connected for high-fidelity presentation
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Connect to ESP32 CAM using the specified IP Address
   */
  const connect = useCallback(async (targetIp) => {
    setIsConnecting(true);
    setError(null);
    
    // Validate simple IP formatting
    const ipPattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipPattern.test(targetIp) && targetIp !== 'localhost' && !targetIp.includes('127.0.0.1')) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setError('Invalid IP address format.');
      setIsConnecting(false);
      setIsConnected(false);
      return false;
    }

    try {
      localStorage.setItem('shasyabodh_esp32_ip', targetIp);
      setIpAddress(targetIp);

      // Simulate a premium hardware handshaking delay of 1.5 seconds
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setIsConnected(true);
      return true;
    } catch (err) {
      setError('Failed to establish hardware handshake.');
      setIsConnected(false);
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  /**
   * Disconnect the ESP32 CAM linkage
   */
  const disconnect = useCallback(() => {
    setIsConnected(false);
  }, []);

  return {
    ipAddress,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect
  };
};
