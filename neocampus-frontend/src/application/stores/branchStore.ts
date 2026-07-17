import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Branch {
  id: number;
  nom: string;
  adresse?: string;
  telephone?: string;
}

interface BranchState {
  activeBranchId: string | null;
  branches: Branch[];
  setActiveBranch: (branchId: string | null) => void;
  setBranches: (branches: Branch[]) => void;
}

export const useBranchStore = create<BranchState>()(
  persist(
    (set) => ({
      activeBranchId: null,
      branches: [],
      setActiveBranch: (activeBranchId) => set({ activeBranchId }),
      setBranches: (branches) => set({ branches }),
    }),
    {
      name: 'neocampus-branch-storage',
    }
  )
)
