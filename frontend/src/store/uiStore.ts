import { create } from 'zustand';
import { Task } from '@shared/types';
import { TaskFilters } from '../types/dashboard';

interface UIState {
  isTaskModalOpen: boolean;
  editingTask: Task | null;
  filters: TaskFilters;
  openTaskModal: (task?: Task | null) => void;
  closeTaskModal: () => void;
  setFilters: (filters: Partial<TaskFilters>) => void;
}

const defaultFilters: TaskFilters = {
  status: 'all',
  priority: 'all',
  search: '',
};

export const useUIStore = create<UIState>((set) => ({
  isTaskModalOpen: false,
  editingTask: null,
  filters: defaultFilters,
  openTaskModal: (task) => set({ isTaskModalOpen: true, editingTask: task ?? null }),
  closeTaskModal: () => set({ isTaskModalOpen: false, editingTask: null }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
}));

