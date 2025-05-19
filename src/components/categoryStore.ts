import { create } from 'zustand';

export interface SubLink {
  label: string;
}

export interface Category {
  label: string;
  subLinks: SubLink[];
}

interface CategoryStore {
  categories: Category[];
  addCategory: (label: string) => void;
  editCategory: (idx: number, label: string) => void;
  deleteCategory: (idx: number) => void;
  addSubLink: (catIdx: number, label: string) => void;
  editSubLink: (catIdx: number, subIdx: number, label: string) => void;
  deleteSubLink: (catIdx: number, subIdx: number) => void;
  setCategories: (categories: Category[]) => void;
}

export const useCategoryStore = create<CategoryStore>((set) => ({
  categories: [
    {
      label: "Politics",
      subLinks: [
        { label: "Elections" },
        { label: "Policy" },
        { label: "International" },
      ],
    },
    {
      label: "Sports",
      subLinks: [
        { label: "Football" },
        { label: "Basketball" },
        { label: "Athletics" },
      ],
    },
  ],
  addCategory: (label) => set((state) => ({
    categories: [...state.categories, { label, subLinks: [] }],
  })),
  editCategory: (idx, label) => set((state) => {
    const updated = [...state.categories];
    updated[idx].label = label;
    return { categories: updated };
  }),
  deleteCategory: (idx) => set((state) => ({
    categories: state.categories.filter((_, i) => i !== idx),
  })),
  addSubLink: (catIdx, label) => set((state) => {
    const updated = [...state.categories];
    updated[catIdx].subLinks.push({ label });
    return { categories: updated };
  }),
  editSubLink: (catIdx, subIdx, label) => set((state) => {
    const updated = [...state.categories];
    updated[catIdx].subLinks[subIdx].label = label;
    return { categories: updated };
  }),
  deleteSubLink: (catIdx, subIdx) => set((state) => {
    const updated = [...state.categories];
    updated[catIdx].subLinks = updated[catIdx].subLinks.filter((_, i) => i !== subIdx);
    return { categories: updated };
  }),
  setCategories: (categories) => set({ categories }),
})); 