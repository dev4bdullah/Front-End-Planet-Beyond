import { createContext, useContext, useEffect, useMemo, useState } from "react";
import NetInfo from "@react-native-community/netinfo";

/* Task 11 — connectivity, with the distinction that actually matters.

   `isConnected` means the device is attached to a network.
   `isInternetReachable` means that network can actually reach the internet.

   They differ constantly in real use: hotel wifi with a captive portal, a
   train tunnel, a phone showing full bars with no data. Checking only the
   first is why apps say "you're online" while every request times out. */

const NetworkContext = createContext(null);

export function NetworkProvider({ children }) {
  const [state, setState] = useState({
    isConnected: true,
    isInternetReachable: true,
    type: "unknown",
    hydrated: false
  });

  useEffect(() => {
    // The subscription fires immediately with the current state, and again on
    // every change. The returned function unsubscribes — forgetting it leaks
    // a native listener for the lifetime of the app.
    const unsubscribe = NetInfo.addEventListener(next =>
      setState({
        isConnected: Boolean(next.isConnected),
        // null means "still checking" — treat it as reachable rather than
        // flashing an offline banner on every launch
        isInternetReachable: next.isInternetReachable !== false,
        type: next.type,
        hydrated: true
      })
    );

    return unsubscribe;
  }, []);

  const online = state.isConnected && state.isInternetReachable;

  const value = useMemo(() => ({ ...state, online, offline: !online }), [state, online]);

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (!context) throw new Error("useNetwork must be used inside a <NetworkProvider>");
  return context;
}
