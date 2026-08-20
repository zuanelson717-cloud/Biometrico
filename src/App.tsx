/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { db, auth } from './lib/firebase';
import { signInAnonymously } from 'firebase/auth';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    signInAnonymously(auth)
      .then((userCredential) => {
        setUser(userCredential.user);
      })
      .catch((err) => {
        setError(`Falha na autenticação: ${err.message}. Por favor, verifique se a autenticação Anônima está ativada no seu Console do Firebase.`);
        console.error('Authentication failed:', err);
      });
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('Could not access camera. Please check permissions.');
      console.error(err);
    }
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Relógio de Ponto Biométrico</h1>
        {user ? (
          <div className="space-y-4">
            <p className="text-gray-600 text-center">Usuário conectado: {user.uid}</p>
            
            {!stream ? (
              <button
                onClick={startCamera}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
              >
                Iniciar Câmera & Registrar Ponto
              </button>
            ) : (
              <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg border-2 border-blue-200" />
            )}
            {error && <p className="text-red-500 text-center">{error}</p>}
          </div>
        ) : (
          <p className="text-gray-600 text-center">Conectando...</p>
        )}
      </div>
    </div>
  );
}
