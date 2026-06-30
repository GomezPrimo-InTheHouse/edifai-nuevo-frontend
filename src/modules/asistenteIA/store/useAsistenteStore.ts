// src/modules/asistenteIA/store/useAsistenteStore.ts
import { create } from 'zustand';

interface AsistenteStore {
  abierto: boolean;
  mensajeInicial: string | null;
  setAbierto: (abierto: boolean) => void;
  abrirConMensaje: (mensaje: string) => void;
  limpiarMensajeInicial: () => void;
}

export const useAsistenteStore = create<AsistenteStore>((set) => ({
  abierto: false,
  mensajeInicial: null,
  setAbierto: (abierto) => set({ abierto }),
  abrirConMensaje: (mensaje) => set({ abierto: true, mensajeInicial: mensaje }),
  limpiarMensajeInicial: () => set({ mensajeInicial: null }),
}));