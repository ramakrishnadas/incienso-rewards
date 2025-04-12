'use client';

import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect, useRef } from 'react';

const qrcodeRegionId = "html5qr-code-full-region";

// interface Html5QrcodeScannerConfig {
//   fps?: number;
//   qrbox?: number | { width: number; height: number };
//   aspectRatio?: number;
//   disableFlip?: boolean;
// }

interface Html5QrcodePluginProps {
    fps?: number;
    qrbox?: number | { width: number; height: number };
    aspectRatio?: number;
    disableFlip?: boolean;
    verbose?: boolean;
    qrCodeSuccessCallback: (decodedText: string, decodedResult: any) => void;
    qrCodeErrorCallback?: (errorMessage: string) => void;
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
  

const Html5QrcodePlugin: React.FC<Html5QrcodePluginProps> = (props) => {
  // Ref to store the scanner instance
  const html5QrcodeScannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    const config = createConfig(props);
    const verbose = props.verbose === true;

    if (!props.qrCodeSuccessCallback) {
      throw new Error("qrCodeSuccessCallback is a required callback.");
    }

    // Initialize the scanner and store the instance in the ref
    html5QrcodeScannerRef.current = new Html5QrcodeScanner(qrcodeRegionId, config, verbose);
    html5QrcodeScannerRef.current.render(props.qrCodeSuccessCallback, props.qrCodeErrorCallback);
    // const html5QrcodeScanner = new Html5QrcodeScanner(qrcodeRegionId, config, verbose);
    // html5QrcodeScanner.render(props.qrCodeSuccessCallback, props.qrCodeErrorCallback);

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
};

export default Html5QrcodePlugin;
