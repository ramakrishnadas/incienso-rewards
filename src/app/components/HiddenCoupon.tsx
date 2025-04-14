'use client';

import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface HiddenCouponProps {
  codigo: string;
  clienteNombre: string;
  fechaVencimiento: string;
  puntos: number;
  onRenderComplete: (canvas: HTMLCanvasElement) => void;
}

const HiddenCoupon: React.FC<HiddenCouponProps> = ({ codigo, clienteNombre, fechaVencimiento, puntos, onRenderComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (barcodeRef.current) {
      JsBarcode(barcodeRef.current, codigo, {
        format: 'CODE128',
        displayValue: true,
        width: 10,
        height: 225,
        fontSize: 50,
        textMargin: 25,
        margin: 20,
      });
    }

    const timeout = setTimeout(() => {
      if (containerRef.current) {
        import('html2canvas').then(({ default: html2canvas }) => {
          html2canvas(containerRef.current!).then(canvas => {
            onRenderComplete(canvas);
          });
        });
      }
    }, 500); // wait to ensure everything renders

    return () => clearTimeout(timeout);
  }, [codigo, clienteNombre, fechaVencimiento, puntos, onRenderComplete]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        left: '-9999px',
        width: '1263px',
        height: '1953px',
        backgroundImage: 'url(/cupon_background.png)', // your image path
        backgroundSize: 'cover',
        padding: '45px',
        fontSize: '60.42px',
        color: 'black',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        textAlign: 'center'
        
      }}
    >
      <div>
        <div className='mt-[580px]'>
          <div className='mb-10'><p className='amaranth-regular text-white'>¡Felicidades, {clienteNombre}!</p></div>
          <div className='mb-10'><p className='amaranth-regular text-white'>Has acumulado los puntos necesarios y te has ganado este cupón de regalo &#127873;</p></div>
          <div><p className='amaranth-regular text-white mt-4'>¡Gracias por ser parte de Incienso Store!</p></div>
        </div>
        <div className='mt-[100px]'>
          <p className='amaranth-regular font-bold text-white text-[91.67px]'>Valor del cupón: ${puntos}</p>
        </div>
        <div className='mt-[20px]'>
          <p className='amaranth-regular font-bold text-white'>Fecha de expiración: {fechaVencimiento}</p>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg ref={barcodeRef} />
      </div>
    </div>
  );
};

export default HiddenCoupon;
