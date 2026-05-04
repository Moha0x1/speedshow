export type WebRTCResult = {
  publicIP: string | null;
  localIPs: string[];
  isVpnLeak: boolean;
  candidates: { ip: string; type: string }[];
};

export async function checkWebRTCLeak(ispDetectedIP: string): Promise<WebRTCResult> {
  return new Promise((resolve) => {
    const candidates: { ip: string; type: string }[] = [];
    
    try {
      const pc = new RTCPeerConnection({ 
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }] 
      });
      
      pc.createDataChannel("");
      
      pc.onicecandidate = (event) => {
        if (!event.candidate) {
          // Gathering complete when candidate is null
          pc.close();
          
          let publicIP: string | null = null;
          const localIPs = new Set<string>();
          
          for (const c of candidates) {
            if (c.type === 'srflx') {
              publicIP = c.ip;
            } else if (c.type === 'host') {
              localIPs.add(c.ip);
            }
          }
          
          // If publicIP is different from ispDetectedIP, it's a leak
          const isVpnLeak = publicIP !== null && publicIP !== ispDetectedIP;
          
          resolve({
            publicIP,
            localIPs: Array.from(localIPs),
            isVpnLeak,
            candidates
          });
          return;
        }
        
        const candidateStr = event.candidate.candidate;
        // Parse candidate string to extract IP and type
        // a=candidate:1 1 UDP 2130706431 192.168.1.5 50000 typ host
        const parts = candidateStr.split(' ');
        if (parts.length >= 8) {
          const ip = parts[4];
          const type = parts[7];
          candidates.push({ ip, type });
        }
      };
      
      pc.createOffer().then((offer) => pc.setLocalDescription(offer));
      
      // Safety timeout in case gathering stalls
      setTimeout(() => {
        if (pc.signalingState !== 'closed') {
          pc.close();
          resolve({
            publicIP: null,
            localIPs: [],
            isVpnLeak: false,
            candidates
          });
        }
      }, 5000);
      
    } catch {
      resolve({
        publicIP: null,
        localIPs: [],
        isVpnLeak: false,
        candidates: []
      });
    }
  });
}
