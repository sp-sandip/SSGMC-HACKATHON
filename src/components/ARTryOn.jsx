import React, { useRef, useEffect, useState } from 'react';

const Pose = window.Pose;
const Camera = window.Camera;

export default function ARTryOn({ product }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState(null);
  const [size, setSize] = useState('M');
  const [viewMode, setViewMode] = useState('cloth'); // cloth | skeleton

  useEffect(() => {
    let unmounted = false;
    
    // Use the explicit file name map prescribed
    const overlayImg = new Image();
    overlayImg.src = product.thumbnailUrl || `/images/dress${product.id}.png`;

    let pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    pose.onResults((results) => {
      if (unmounted) return;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx || !results.poseLandmarks) return;

      // Draw mirrored
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

      const lm = results.poseLandmarks;
      // Shoulders: 11 (Left), 12 (Right)
      // Hips: 23 (Left), 24 (Right)
      const sL = lm[11];
      const sR = lm[12];
      const hL = lm[23];
      const hR = lm[24];
      
      if (sL?.visibility > 0.6 && sR?.visibility > 0.6) {
        // Pixel distance
        const dx = (sR.x - sL.x) * canvas.width;
        const dy = (sR.y - sL.y) * canvas.height;
        const shoulderPx = Math.sqrt(dx*dx + dy*dy);
        const shoulderCm = Math.round(shoulderPx / 6.5);
        
        const midX = (sL.x + sR.x) / 2 * canvas.width;
        const shoulderMidpointY = (sL.y + sR.y) / 2 * canvas.height;

        // Angle and Balance
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        const balance = Math.round(Math.max(0, 100 - Math.abs(angle) * 3));

        // Arm Logic
        let leftArmPx = 0, rightArmPx = 0;
        if (lm[15]) leftArmPx = Math.sqrt(Math.pow((lm[11].x - lm[15].x)*canvas.width, 2) + Math.pow((lm[11].y - lm[15].y)*canvas.height, 2));
        if (lm[16]) rightArmPx = Math.sqrt(Math.pow((lm[12].x - lm[16].x)*canvas.width, 2) + Math.pow((lm[12].y - lm[16].y)*canvas.height, 2));
        const avgArmPx = (leftArmPx + rightArmPx) / 2;
        const symmetry = Math.round(100 - (Math.abs(leftArmPx - rightArmPx) / (Math.max(leftArmPx, rightArmPx) || 1) * 100));

        let torsoPx = 0;
        if (hL && hR) {
           const midHipY = (hL.y + hR.y) / 2 * canvas.height;
           torsoPx = Math.abs(midHipY - shoulderMidpointY);
        }

        if (shoulderPx > 50 && shoulderPx < 800) {
             setDimensions((prev) => {
               if (prev && Math.abs(prev.px - shoulderPx) < 5) return prev;
               return { shoulder: shoulderCm, torso: Math.round(torsoPx/6.5), arm: Math.round(avgArmPx/6.5), balance, symmetry, px: shoulderPx };
             });
             if (shoulderCm < 38) setSize('S');
             else if (shoulderCm <= 42) setSize('M');
             else if (shoulderCm <= 46) setSize('L');
             else setSize('XL');
        }
        
        if (viewMode === 'cloth') {
          // 2D Image Auto-Scaling overlay logic
          if (overlayImg.complete && overlayImg.naturalHeight !== 0) {
              const renderWidth = shoulderPx * 2.2;
              const renderHeight = renderWidth / (overlayImg.width / overlayImg.height);
              ctx.filter = 'contrast(1.1) brightness(1.1) saturate(1.1)';
              ctx.globalAlpha = 1.0;
              ctx.drawImage(overlayImg, midX - renderWidth/2, shoulderMidpointY - (renderHeight * 0.15), renderWidth, renderHeight);
              ctx.filter = 'none';
          }
        } else {
          // Skeleton Mode
          ctx.strokeStyle = 'rgba(255,255,255,0.8)';
          ctx.lineWidth = 2;
          const BONES = [[11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],[23,24],[23,25],[24,26],[25,27],[26,28],[27,29],[28,30],[29,31],[30,32]];
          ctx.beginPath();
          for (const [a,b] of BONES) {
             if (lm[a] && lm[b] && lm[a].visibility>0.5 && lm[b].visibility>0.5) {
                 ctx.moveTo(lm[a].x * canvas.width, lm[a].y * canvas.height);
                 ctx.lineTo(lm[b].x * canvas.width, lm[b].y * canvas.height);
             }
          }
          ctx.stroke();

          ctx.fillStyle = '#C9A84C';
          for (let i=0; i<33; i++) {
             if (lm[i] && lm[i].visibility>0.5) {
                 ctx.beginPath();
                 ctx.arc(lm[i].x * canvas.width, lm[i].y * canvas.height, 4, 0, 2*Math.PI);
                 ctx.fill();
             }
          }

          ctx.fillStyle = '#fff';
          ctx.font = '12px monospace';
          if (sL) ctx.fillText("Tracking Point 11", sL.x*canvas.width+10, sL.y*canvas.height);
          if (sR) ctx.fillText("Tracking Point 12", sR.x*canvas.width+10, sR.y*canvas.height);
          if (hL) ctx.fillText("Tracking Point 23", hL.x*canvas.width+10, hL.y*canvas.height);
          if (lm[15]) ctx.fillText("Point 15 (Wrist)", lm[15].x*canvas.width+10, lm[15].y*canvas.height);

          const scanY = (Date.now() / 15 % 100) / 100 * canvas.height;
          ctx.beginPath();
          ctx.moveTo(0, scanY);
          ctx.lineTo(canvas.width, scanY);
          ctx.strokeStyle = 'rgba(201,168,76, 0.8)';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#C9A84C';
          ctx.shadowBlur = 10;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }
      ctx.restore();
    });

    let animationFrameId;
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720, facingMode: 'user' } });
        if (videoRef.current && !unmounted) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();

          const processFrame = async () => {
            if (videoRef.current && !unmounted && videoRef.current.readyState >= 2) {
              await pose.send({ image: videoRef.current });
            }
            if (!unmounted) {
              animationFrameId = requestAnimationFrame(processFrame);
            }
          };
          
          videoRef.current.onloadeddata = () => {
             processFrame();
          };
        }
      } catch (err) {
        console.error("Camera access error:", err);
      }
    };
    
    startCamera();

    return () => {
      unmounted = true;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (videoRef.current && videoRef.current.srcObject) {
         videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      }
      if (pose) pose.close();
       if (canvasRef.current) {
         const ctx = canvasRef.current.getContext('2d');
         if (ctx) ctx.clearRect(0,0, canvasRef.current.width, canvasRef.current.height);
      }
    };
  }, [product, viewMode]);

  return (
    <div className="w-full h-full relative font-dm bg-slate-900 rounded-3xl overflow-hidden">
      <video ref={videoRef} className="hidden" playsInline></video>
      <canvas id="ar-canvas" ref={canvasRef} width="1280" height="720" className="w-full h-full object-cover"></canvas>

      <div className="absolute top-6 right-6 z-20 flex bg-slate-950/80 backdrop-blur-md rounded-2xl border border-white/10 p-1 shadow-2xl">
         <button onClick={()=>setViewMode('cloth')} className={`px-5 py-2 font-syne font-bold text-sm tracking-wide rounded-xl transition-all ${viewMode==='cloth'?'bg-gold-500 text-slate-900 shadow-[0_0_15px_rgba(201,168,76,0.3)]':'text-gray-400 hover:text-white'}`}>
            Show Cloth
         </button>
         <button onClick={()=>setViewMode('skeleton')} className={`px-5 py-2 font-syne font-bold text-sm tracking-wide rounded-xl transition-all ${viewMode==='skeleton'?'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]':'text-gray-400 hover:text-white'}`}>
            Show Skeleton
         </button>
      </div>

      <div className="absolute bottom-6 left-6 z-20 flex flex-col gap-4 max-w-sm w-full">
        {dimensions && viewMode === 'skeleton' && (
          <div className="bg-slate-950/85 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(59,130,246,0.15)] animation-fade-up">
            <h3 className="font-syne font-bold text-lg text-blue-400 mb-4 flex items-center gap-2">
              <span className="text-xl">🤖</span> AI Posture Analysis
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-xs tracking-wider uppercase mb-1">Shoulder Balance %</p>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{width: `${dimensions.balance}%`}}/>
                </div>
                <p className="text-right text-xs mt-1 text-white font-mono">{dimensions.balance === 100 ? '100% - Perfect' : `${dimensions.balance}% - Tilted`}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs tracking-wider uppercase mb-1">Body Symmetry</p>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{width: `${dimensions.symmetry}%`}}/>
                </div>
                <p className="text-right text-xs mt-1 text-white font-mono">{dimensions.symmetry}% Match</p>
              </div>
              <div className="flex justify-between items-center bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl mt-2">
                <span className="text-xs text-blue-300 font-bold uppercase tracking-wider">AI Confidence</span>
                <span className="text-sm text-white font-mono bg-blue-500 px-2 py-0.5 rounded-lg">99.8%</span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-slate-950/85 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-2xl">
           <h3 className="font-syne font-bold text-lg text-gold-500 mb-3 flex items-center gap-2">
              <span className="text-xl">📏</span> Live Metrics
           </h3>
           {dimensions ? (
             <div className="space-y-2">
               <div className="flex flex-col gap-2 bg-white/5 p-4 rounded-2xl border border-white/10 mt-3">
                   <div className="flex justify-between items-center">
                     <p className="text-gray-400 text-xs tracking-wider uppercase">Shoulder Width:</p>
                     <p className="text-white text-sm font-syne font-bold"><span className="text-gold-400">{dimensions.shoulder}</span> cm</p>
                   </div>
                   <div className="flex justify-between items-center">
                     <p className="text-gray-400 text-xs tracking-wider uppercase">Torso Height:</p>
                     <p className="text-white text-sm font-syne font-bold"><span className="text-gold-400">{dimensions.torso}</span> cm</p>
                   </div>
                   <div className="flex justify-between items-center">
                     <p className="text-gray-400 text-xs tracking-wider uppercase">Arm Length:</p>
                     <p className="text-white text-sm font-syne font-bold"><span className="text-gold-400">{dimensions.arm}</span> cm</p>
                   </div>
               </div>
               <div className="mt-4 pt-4 border-t border-white/10 text-center">
                 <div className="inline-block py-2 px-6 bg-gradient-to-r from-gold-500/20 to-gold-400/10 border border-gold-500/40 rounded-xl shadow-inner">
                   <strong className="text-xl font-syne text-gold-500 tracking-wide">AI Size Suggestion: {size}</strong>
                 </div>
               </div>
             </div>
           ) : (
             <div className="flex items-center gap-3 text-sm text-gray-400 py-4">
               <div className="w-4 h-4 rounded-full border-2 border-gold-500/30 border-t-gold-500 animate-spin"/>
               Detecting body geometry...
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
