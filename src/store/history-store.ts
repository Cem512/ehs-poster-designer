import { create } from 'zustand';

const MAX_HISTORY = 50;

interface HistoryStore {
  undoStack: string[];
  redoStack: string[];
  canUndo: boolean;
  canRedo: boolean;

  pushState: (canvasJSON: string) => void;
  undo: () => string | null;
  redo: () => string | null;
  clear: () => void;
}

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  undoStack: [],
  redoStack: [],
  canUndo: false,
  canRedo: false,

  pushState: (canvasJSON) => set((state) => {
    const newStack = [...state.undoStack, canvasJSON];
    if (newStack.length > MAX_HISTORY) newStack.shift();
    return {
      undoStack: newStack,
      redoStack: [],
      canUndo: true,
      canRedo: false,
    };
  }),

  undo: () => {
    const state = get();
    if (state.undoStack.length < 2) return null;
    const current = state.undoStack[state.undoStack.length - 1];
    const previous = state.undoStack[state.undoStack.length - 2];
    set({
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, current],
      canUndo: state.undoStack.length > 2,
      canRedo: true,
    });
    return previous;
  },

  redo: () => {
    const state = get();
    if (state.redoStack.length === 0) return null;
    const next = state.redoStack[state.redoStack.length - 1];
    set({
      undoStack: [...state.undoStack, next],
      redoStack: state.redoStack.slice(0, -1),
      canUndo: true,
      canRedo: state.redoStack.length > 1,
    });
    return next;
  },

  clear: () => set({ undoStack: [], redoStack: [], canUndo: false, canRedo: false }),
}));
