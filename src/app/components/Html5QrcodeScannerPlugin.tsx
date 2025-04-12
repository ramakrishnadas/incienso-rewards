'use client';

import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

const qrcodeRegionId = "html5qr-code-full-region";

interface Html5QrcodePluginProps {
    fps?: number;
    qrbox?: number | { width: number; height: number };
    aspectRatio?: number;
    disableFlip?: boolean;
    verbose?: boolean;
    qrCodeSuccessCallback: (decodedText: string, decodedResult: any) => void;
    qrCodeErrorCallback?: (errorMessage: string) => void;
}

export interface Html5QrcodePluginHandle {
  stopScanning: () => void;
}

const createConfig = (props: Html5QrcodePluginProps) => {
    const config = {
      fps: props.fps ?? 10, // provide a default value
      qrbox: props.qrbox,
      aspectRatio: props.aspectRatio,
      disableFlip: props.disableFlip,
    };
  
    return config;
};
  

const Html5QrcodePlugin = forwardRef<Html5QrcodePluginHandle, Html5QrcodePluginProps>((props, ref) => {
  const html5QrcodeScannerRef = useRef<Html5QrcodeScanner | null>(null);

  useImperativeHandle(ref, () => ({
    stopScanning: () => {
      html5QrcodeScannerRef.current?.clear().catch((err) => console.error("Error stopping scanner:", err));
    }
  }));

  useEffect(() => {
    const config = createConfig(props);
    const verbose = props.verbose === true;

    if (!props.qrCodeSuccessCallback) {
      throw new Error("qrCodeSuccessCallback is a required callback.");
    }

    // Initialize the scanner and store the instance in the ref
    html5QrcodeScannerRef.current = new Html5QrcodeScanner(qrcodeRegionId, config, verbose);
    html5QrcodeScannerRef.current.render(props.qrCodeSuccessCallback, props.qrCodeErrorCallback);
    

    return () => {
      // Cleanup and clear the scanner when component unmounts
      if (html5QrcodeScannerRef.current) {
        html5QrcodeScannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner. ", error);
        });
      }
    };
  }, []);

  return <div id={qrcodeRegionId} />;
});

export default Html5QrcodePlugin;
