import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Initialize state to undefined to clearly distinguish server/client initial render
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // This function runs only on the client after hydration
    const checkDevice = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Initial check
    checkDevice()

    // Listener for window resize
    window.addEventListener("resize", checkDevice)

    // Cleanup listener on component unmount
    return () => window.removeEventListener("resize", checkDevice)
  }, []) // Empty dependency array ensures this runs once on mount

  // Return the state. It will be undefined on the server and during the initial client render,
  // then update to true/false after the effect runs.
  // Consumers of this hook might need to handle the `undefined` state (e.g., show a loading state).
  return isMobile;
}
