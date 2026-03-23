import React, { useRef, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import AgoraRTC from 'agora-rtc-sdk-ng';
import ARTryOn from './ARTryOn';
import { X, Mic, MicOff, Camera as CameraIcon, PhoneOff } from 'lucide-react';

export default function LiveSession({ product, onClose }) {
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [remoteUser, setRemoteUser] = useState(null);
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [callStatus, setCallStatus] = useState('ringing');
  
  const remoteRef = useRef(null);
  const rtcRef = useRef({ client: null });
  const channelName = 'test_room';

  // 1. Socket Signaling Trigger
  useEffect(() => {
    let unmounted = false;
    const socketUrl = window.location.origin.includes('517') 
        ? window.location.origin.replace(/517[0-9]/, '5000') 
        : 'http://localhost:5000';
    const socket = io(socketUrl, { transports: ['websocket', 'polling'] });
    
    // Ringing state logic
    socket.emit('client-call', {
      channelName: 'test_room',
      productName: product.name,
      productId: product._id
    });

    const APP_ID = '6d205627ba6f446fb4ae1c8f44d7a95a';
    const TOKEN = '007eJxTYNgwV1QidEKITkDOcbtt3p5TvrHvi9V7cV7PwCxbTXhm2nEFBrMUIwNTMyPzpESzNBMTs7Qkk8RUw2QLIDvFPNHSNHFj2IHMhkBGhrDA50yMDBAI4nMxlKQWl8QX5efn6jEwAABnmiAq';
    const CHANNEL = 'test_room';

    const initAgora = async () => {
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      rtcRef.current.client = client;

      client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === 'video') {
          setRemoteUser(user);
          setTimeout(() => user.videoTrack?.play(remoteRef.current), 100);
        }
        if (mediaType === 'audio') user.audioTrack?.play();
      });

      client.on('user-unpublished', (user, type) => {
        if (type === 'video') setRemoteUser(null);
      });

      try {
        const aTrack = await AgoraRTC.createMicrophoneAudioTrack();
        let vTrack;
        
        // Custom Canvas Video Track Interception
        let retries = 0;
        let canvas = document.getElementById('ar-canvas');
        while (!canvas && retries < 15) {
          await new Promise(r => setTimeout(r, 200));
          canvas = document.getElementById('ar-canvas');
          retries++;
        }
        
        if (canvas) {
          const stream = canvas.captureStream(30);
          const videoTrack = stream.getVideoTracks()[0];
          if (videoTrack) {
             vTrack = AgoraRTC.createCustomVideoTrack({ mediaStreamTrack: videoTrack });
          } else {
             vTrack = await AgoraRTC.createCameraVideoTrack();
          }
        } else {
          vTrack = await AgoraRTC.createCameraVideoTrack();
        }

        if (!unmounted) {
          setLocalAudioTrack(aTrack);
          setLocalVideoTrack(vTrack);
          await client.join(APP_ID, CHANNEL, TOKEN, null);
          await client.publish([aTrack, vTrack]);
        }
      } catch (e) {
        console.error('Agora joined failed on Buyer side:', e);
      }
    };

    socket.on('call-accepted', () => {
      if (!unmounted) {
         setCallStatus('connected');
         initAgora();
      }
    });
    
    socket.on('call-ended', () => {
       if (!unmounted) onClose();
    });

    return () => {
      unmounted = true;
      socket.emit('call-ended', { channelName });
      socket.disconnect();
      if (localAudioTrack) { localAudioTrack.stop(); localAudioTrack.close(); }
      if (localVideoTrack) { localVideoTrack.stop(); localVideoTrack.close(); }
      rtcRef.current.client?.leave();
    };
  }, [product, onClose]);

  const toggleMute = () => {
    if (localAudioTrack) {
      localAudioTrack.setMuted(!muted);
      setMuted(!muted);
    }
  };

  const toggleVideo = () => {
    if (localVideoTrack) {
      localVideoTrack.setEnabled(videoOff);
      setVideoOff(!videoOff);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-950/95 backdrop-blur-xl animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <div>
          <h2 className="font-syne font-bold text-white text-2xl flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"/>
            Live AR Shopping Session
          </h2>
          <p className="text-gray-400 text-sm font-dm mt-1">Connected with Webion Support for {product.name}</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 transition-colors">
          <X size={24}/>
        </button>
      </div>

      {/* Split Screen Container */}
      <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
        
        {/* BUYER SIDE: AR Try-On */}
        <div className="relative rounded-3xl overflow-hidden border border-gold-500/30 shadow-[0_0_40px_rgba(201,168,76,0.1)] flex flex-col">
          <div className="absolute top-4 left-4 z-10 bg-gold-500/90 text-slate-900 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase backdrop-blur-md">
            Your AR View
          </div>
          <div className="flex-1 relative bg-slate-900">
            <ARTryOn product={product} />
          </div>
        </div>

        {/* SELLER SIDE: Remote Video */}
        <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-slate-900 shadow-2xl flex flex-col items-center justify-center">
          <div className="absolute top-4 left-4 z-10 bg-black/60 text-white px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase backdrop-blur-md border border-white/10">
            Seller / Support
          </div>
          <div ref={remoteRef} className="w-full h-full flex items-center justify-center overflow-hidden">
            {callStatus === 'ringing' ? (
              <div className="text-center animate-pulse">
                <div className="w-16 h-16 rounded-full bg-gold-500/20 text-gold-500 flex items-center justify-center mx-auto mb-4 text-2xl animate-bounce">📞</div>
                <p className="text-gray-400 font-dm">Ringing the Webion Concierge...</p>
              </div>
            ) : !remoteUser && (
              <div className="text-center">
                <p className="text-gray-400 font-dm">Connected. Waiting for video stream...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="p-6 border-t border-white/10 flex justify-center gap-6">
        <button onClick={toggleMute} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${muted ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'}`}>
          {muted ? <MicOff size={24}/> : <Mic size={24}/>}
        </button>
        <button onClick={toggleVideo} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${videoOff ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'}`}>
           <CameraIcon size={24}/>
        </button>
        <button onClick={onClose} className="px-8 h-14 rounded-full flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white font-syne font-bold transition-all shadow-lg shadow-red-500/20">
          <PhoneOff size={20}/> End Session
        </button>
      </div>
    </div>
  );
}
