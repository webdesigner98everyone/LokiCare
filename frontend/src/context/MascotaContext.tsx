import React, { createContext, useContext, useState } from 'react';

interface MascotaContextType {
  mascotaId: number;
  mascotaNombre: string;
  setMascotaId: (id: number) => void;
  setMascotaNombre: (nombre: string) => void;
}

const MascotaContext = createContext<MascotaContextType>({
  mascotaId: 1,
  mascotaNombre: '',
  setMascotaId: () => {},
  setMascotaNombre: () => {},
});

export function MascotaProvider({ children }: { children: React.ReactNode }) {
  const [mascotaId, setMascotaId] = useState(1);
  const [mascotaNombre, setMascotaNombre] = useState('');

  return (
    <MascotaContext.Provider value={{ mascotaId, mascotaNombre, setMascotaId, setMascotaNombre }}>
      {children}
    </MascotaContext.Provider>
  );
}

export const useMascota = () => useContext(MascotaContext);
