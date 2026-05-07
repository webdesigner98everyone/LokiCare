import React, { createContext, useContext, useState } from 'react';

interface MascotaContextType {
  mascotaId: number;
  setMascotaId: (id: number) => void;
}

const MascotaContext = createContext<MascotaContextType>({
  mascotaId: 1,
  setMascotaId: () => {},
});

export function MascotaProvider({ children }: { children: React.ReactNode }) {
  const [mascotaId, setMascotaId] = useState(1);

  return (
    <MascotaContext.Provider value={{ mascotaId, setMascotaId }}>
      {children}
    </MascotaContext.Provider>
  );
}

export const useMascota = () => useContext(MascotaContext);
