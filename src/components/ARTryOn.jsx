import React, { useRef, useEffect, useState } from 'react';

const Pose = window.Pose;
const Camera = window.Camera;

export default function ARTryOn({ product }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState(null);
  const [size, setSize] = useState('M');

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
        const dx = (sL.x - sR.x) * canvas.width;
        const dy = (sL.y - sR.y) * canvas.height;
        const shoulderPx = Math.sqrt(dx*dx + dy*dy);

        // Calibration logic
        const shoulderCm = Math.round(shoulderPx * 0.18);
        const chestCm = Math.round(shoulderCm * 1.05);
        
        let lengthCm = 0;
        if (hL && hR) {
          const midHipY = (hL.y + hR.y) / 2;
          const midShoulderY = (sL.y + sR.y) / 2;
          const lengthDy = Math.abs(midHipY - midShoulderY) * canvas.height;
          lengthCm = Math.round(lengthDy * 0.18);
        }

        const midX = (sL.x + sR.x) / 2 * canvas.width;
        // Anchor slightly above shoulder line
        const midY = ((sL.y + sR.y) / 2 * canvas.height) - (shoulderPx * 0.2);

        if (shoulderPx > 50 && shoulderPx < 800) {
           if (!dimensions || Math.abs(dimensions.shoulder - shoulderPx) > 5) {
             setDimensions({ shoulder: Math.round(shoulderPx), chest: Math.round(shoulderPx*1.1), length: 0 });
             if (shoulderPx < 200) setSize('S');
             else if (shoulderPx <= 250) setSize('M');
             else if (shoulderPx <= 300) setSize('L');
             else setSize('XL');
          }
        }
        
        // 2D Image Auto-Scaling overlay logic
        if (overlayImg.complete && overlayImg.naturalHeight !== 0) {
            // Garments generally cover shoulders and extend down
            // We scale the image width to about 2.2x the shoulder width 
            const imgWidth = shoulderPx * 2.2;
            const imgAspect = overlayImg.width / overlayImg.height;
            const imgHeight = imgWidth / imgAspect;

            // Draw centered on X, anchored near upper shoulders on Y
            ctx.drawImage(overlayImg, midX - imgWidth/2, midY, imgWidth, imgHeight);
        } else {
            // Draw Augmented skeleton as fallback while loading or if no valid image
            ctx.beginPath();
            ctx.moveTo(sL.x * canvas.width, sL.y * canvas.height);
            ctx.lineTo(sR.x * canvas.width, sR.y * canvas.height);
            ctx.strokeStyle = '#C9A84C';
            ctx.lineWidth = 5;
            ctx.stroke();

            if (hL && hR) {
               ctx.beginPath();
               ctx.moveTo(sL.x * canvas.width, sL.y * canvas.height);
               ctx.lineTo(hL.x * canvas.width, hL.y * canvas.height);
               ctx.lineTo(hR.x * canvas.width, hR.y * canvas.height);
               ctx.lineTo(sR.x * canvas.width, sR.y * canvas.height);
               ctx.strokeStyle = 'rgba(201,168,76, 0.4)';
               ctx.lineWidth = 3;
               ctx.stroke();
            }
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
  }, [product]);

  return (
    <div className="w-full h-full relative font-dm bg-slate-900 rounded-3xl overflow-hidden">
      <video ref={videoRef} className="hidden" playsInline></video>
      <canvas id="ar-canvas" ref={canvasRef} width="1280" height="720" className="w-full h-full object-cover"></canvas>

      <div className="absolute bottom-6 left-6 z-20 bg-slate-950/80 backdrop-blur-md p-5 rounded-2xl border border-white/10 text-white min-w-64 shadow-2xl">
         <h3 className="font-syne font-bold text-lg text-gold-500 mb-3 flex items-center gap-2">
            <span className="text-xl">📏</span> AI Live Measurements
         </h3>
         {dimensions ? (
           <div className="space-y-2">
             <div className="text-[10px] text-gold-500/80 mb-3 font-mono border-b border-white/5 pb-2">d = √(x₂-x₁)² + (y₂-y₁)²</div>
             <div className="flex justify-between text-sm">
                <span className="text-gray-400">Chest:</span>
                <strong className="text-white">{dimensions.chest} cm</strong>
             </div>
             <div className="flex justify-between text-sm">
                <span className="text-gray-400">Shoulder Width:</span>
                <strong className="text-white">{dimensions.shoulder} px</strong>
             </div>
             <div className="mt-4 pt-4 border-t border-white/10 text-center">
               <div className="inline-block py-2 px-6 bg-gradient-to-r from-gold-500/20 to-gold-400/10 border border-gold-500/40 rounded-xl">
                 <strong className="text-2xl font-syne text-gold-500">AI Size Suggestion: {size}</strong>
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
  );
}
