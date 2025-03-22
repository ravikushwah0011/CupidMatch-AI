import { useEffect, useState, useRef } from 'react';
import { useWebSocket } from './useWebSocket';
import { useUser } from '@/context/UserContext';
import SimplePeer from 'simple-peer';

interface VideoCallHook {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  callStatus: 'idle' | 'connecting' | 'connected' | 'error';
  startCall: (targetUserId: number) => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  isMuted: boolean;
  isVideoEnabled: boolean;
}

export function useVideoCall(): VideoCallHook {
  const { user } = useUser();
  const { sendMessage, lastMessage } = useWebSocket();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  
  const peerRef = useRef<SimplePeer.Instance | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Handle incoming WebSocket messages for video signaling
  useEffect(() => {
    if (!lastMessage) return;

    if (lastMessage.type === 'video_signal' && lastMessage.fromUserId) {
      handleIncomingSignal(lastMessage.fromUserId, lastMessage.signal);
    }
  }, [lastMessage]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, []);

  const getMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      setLocalStream(stream);
      localStreamRef.current = stream;
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      setCallStatus('error');
      throw error;
    }
  };

  const startCall = async (targetUserId: number) => {
    if (!user) return;
    
    try {
      setCallStatus('connecting');
      const stream = await getMedia();
      
      const peer = new SimplePeer({
        initiator: true,
        trickle: false,
        stream: stream
      });
      
      peer.on('signal', signal => {
        sendMessage('video_signal', {
          targetUserId,
          signal
        });
      });
      
      peer.on('stream', stream => {
        setRemoteStream(stream);
        setCallStatus('connected');
      });
      
      peer.on('error', err => {
        console.error('Peer connection error:', err);
        setCallStatus('error');
      });
      
      peerRef.current = peer;
    } catch (error) {
      console.error('Error starting call:', error);
      setCallStatus('error');
    }
  };

  const handleIncomingSignal = async (fromUserId: number, signal: any) => {
    if (!user) return;
    
    try {
      if (!peerRef.current) {
        // We're receiving a call
        setCallStatus('connecting');
        const stream = await getMedia();
        
        const peer = new SimplePeer({
          initiator: false,
          trickle: false,
          stream: stream
        });
        
        peer.on('signal', signal => {
          sendMessage('video_signal', {
            targetUserId: fromUserId,
            signal
          });
        });
        
        peer.on('stream', stream => {
          setRemoteStream(stream);
          setCallStatus('connected');
        });
        
        peer.on('error', err => {
          console.error('Peer connection error:', err);
          setCallStatus('error');
        });
        
        peerRef.current = peer;
      }
      
      // Signal the peer with the received data
      peerRef.current.signal(signal);
    } catch (error) {
      console.error('Error handling incoming signal:', error);
      setCallStatus('error');
    }
  };

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    
    setLocalStream(null);
    setRemoteStream(null);
    setCallStatus('idle');
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      
      setIsMuted(!audioTracks[0]?.enabled);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      
      setIsVideoEnabled(videoTracks[0]?.enabled || false);
    }
  };

  return {
    localStream,
    remoteStream,
    callStatus,
    startCall,
    endCall,
    toggleMute,
    toggleVideo,
    isMuted,
    isVideoEnabled
  };
}
