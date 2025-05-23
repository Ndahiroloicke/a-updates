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
      label: "Fashion",
      subLinks: [
        { label: "Clothing" },
        { label: "Accessories" },
        { label: "Trends" },
      ],
    },
    {
      label: "Lifestyle",
      subLinks: [
        { label: "Health" },
        { label: "Wellness" },
        { label: "Fitness" },
      ],
    },
    {
      label: "Travel",
      subLinks: [
        { label: "Destinations" },
        { label: "Tips" },
        { label: "Reviews" },
      ],
    },
    {
      label: "Finance",
      subLinks: [
        { label: "Investing" },
        { label: "Savings" },
        { label: "Markets" },
      ],
    },
    {
      label: "Education",
      subLinks: [
        { label: "Schools" },
        { label: "Learning" },
        { label: "Research" },
      ],
    },
    {
      label: "Business",
      subLinks: [
        { label: "Entrepreneurship" },
        { label: "Management" },
        { label: "Economy" },
      ],
    },
    {
      label: "Science",
      subLinks: [
        { label: "Research" },
        { label: "Technology" },
        { label: "Discoveries" },
      ],
    },
    {
      label: "Startups",
      subLinks: [
        { label: "Funding" },
        { label: "Innovation" },
        { label: "Success Stories" },
      ],
    },
    {
      label: "Environment",
      subLinks: [
        { label: "Conservation" },
        { label: "Climate" },
        { label: "Sustainability" },
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