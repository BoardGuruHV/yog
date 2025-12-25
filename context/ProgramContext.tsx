"use client";

import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { Asana, ProgramAsana } from "@/types";

interface ProgramState {
  id: string | null; // null = new program, string = editing existing
  name: string;
  description: string;
  asanas: ProgramAsana[];
  totalDuration: number;
}

type ProgramAction =
  | { type: "ADD_ASANA"; asana: Asana }
  | { type: "REMOVE_ASANA"; id: string }
  | { type: "REORDER_ASANAS"; asanas: ProgramAsana[] }
  | { type: "UPDATE_DURATION"; id: string; duration: number }
  | { type: "UPDATE_NAME"; name: string }
  | { type: "UPDATE_DESCRIPTION"; description: string }
  | { type: "CLEAR_PROGRAM" }
  | { type: "LOAD_PROGRAM"; program: ProgramState }
  | { type: "DUPLICATE_PROGRAM"; program: ProgramState };

const initialState: ProgramState = {
  id: null,
  name: "My Yoga Program",
  description: "",
  asanas: [],
  totalDuration: 0,
};

function calculateTotalDuration(asanas: ProgramAsana[]): number {
  return asanas.reduce((total, item) => total + item.duration, 0);
}

function programReducer(state: ProgramState, action: ProgramAction): ProgramState {
  switch (action.type) {
    case "ADD_ASANA": {
      const newAsana: ProgramAsana = {
        id: `temp-${Date.now()}`,
        programId: "",
        asanaId: action.asana.id,
        asana: action.asana,
        order: state.asanas.length,
        duration: action.asana.durationSeconds,
      };
      const newAsanas = [...state.asanas, newAsana];
      return {
        ...state,
        asanas: newAsanas,
        totalDuration: calculateTotalDuration(newAsanas),
      };
    }
    case "REMOVE_ASANA": {
      const newAsanas = state.asanas
        .filter((a) => a.id !== action.id)
        .map((a, index) => ({ ...a, order: index }));
      return {
        ...state,
        asanas: newAsanas,
        totalDuration: calculateTotalDuration(newAsanas),
      };
    }
    case "REORDER_ASANAS": {
      const reorderedAsanas = action.asanas.map((a, index) => ({
        ...a,
        order: index,
      }));
      return {
        ...state,
        asanas: reorderedAsanas,
        totalDuration: calculateTotalDuration(reorderedAsanas),
      };
    }
    case "UPDATE_DURATION": {
      const newAsanas = state.asanas.map((a) =>
        a.id === action.id ? { ...a, duration: action.duration } : a
      );
      return {
        ...state,
        asanas: newAsanas,
        totalDuration: calculateTotalDuration(newAsanas),
      };
    }
    case "UPDATE_NAME":
      return { ...state, name: action.name };
    case "UPDATE_DESCRIPTION":
      return { ...state, description: action.description };
    case "CLEAR_PROGRAM":
      return initialState;
    case "LOAD_PROGRAM":
      return action.program;
    case "DUPLICATE_PROGRAM":
      return {
        ...action.program,
        id: null, // Clear ID so it creates a new program on save
        name: `${action.program.name} (Copy)`,
      };
    default:
      return state;
  }
}

interface ProgramContextType {
  state: ProgramState;
  addAsana: (asana: Asana) => void;
  removeAsana: (id: string) => void;
  reorderAsanas: (asanas: ProgramAsana[]) => void;
  updateDuration: (id: string, duration: number) => void;
  updateName: (name: string) => void;
  updateDescription: (description: string) => void;
  clearProgram: () => void;
  loadProgram: (program: ProgramState) => void;
  duplicateProgram: (program: ProgramState) => void;
  isInProgram: (asanaId: string) => boolean;
}

const ProgramContext = createContext<ProgramContextType | undefined>(undefined);

export function ProgramProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(programReducer, initialState);

  const addAsana = (asana: Asana) => dispatch({ type: "ADD_ASANA", asana });
  const removeAsana = (id: string) => dispatch({ type: "REMOVE_ASANA", id });
  const reorderAsanas = (asanas: ProgramAsana[]) =>
    dispatch({ type: "REORDER_ASANAS", asanas });
  const updateDuration = (id: string, duration: number) =>
    dispatch({ type: "UPDATE_DURATION", id, duration });
  const updateName = (name: string) => dispatch({ type: "UPDATE_NAME", name });
  const updateDescription = (description: string) =>
    dispatch({ type: "UPDATE_DESCRIPTION", description });
  const clearProgram = () => dispatch({ type: "CLEAR_PROGRAM" });
  const loadProgram = (program: ProgramState) =>
    dispatch({ type: "LOAD_PROGRAM", program });
  const duplicateProgram = (program: ProgramState) =>
    dispatch({ type: "DUPLICATE_PROGRAM", program });
  const isInProgram = (asanaId: string) =>
    state.asanas.some((a) => a.asanaId === asanaId);

  return (
    <ProgramContext.Provider
      value={{
        state,
        addAsana,
        removeAsana,
        reorderAsanas,
        updateDuration,
        updateName,
        updateDescription,
        clearProgram,
        loadProgram,
        duplicateProgram,
        isInProgram,
      }}
    >
      {children}
    </ProgramContext.Provider>
  );
}

export function useProgram() {
  const context = useContext(ProgramContext);
  if (context === undefined) {
    throw new Error("useProgram must be used within a ProgramProvider");
  }
  return context;
}
