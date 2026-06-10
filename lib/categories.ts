import { storeImage } from "./imagekit";
import type { Category } from "./types";

export const seedCategories: Category[] = [
  {
    id: "atqam",
    name: "أطقم",
    slug: "atqam",
    image: storeImage("https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=480&q=80", "sets_seed"),
    description: "أطقم زركون متكاملة تمنحك إطلالة راقية في مناسباتك الخاصة",
    sortOrder: 0,
    visible: true,
    linkedProducts: []
  },
  {
    id: "uqud",
    name: "عقود",
    slug: "uqud",
    image: storeImage("https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=480&q=80", "necklaces_seed"),
    description: "عقود وسلاسل ناعمة تلتف برقة لتبرز جمال عنقك",
    sortOrder: 1,
    visible: true,
    linkedProducts: []
  },
  {
    id: "asawir",
    name: "أساور",
    slug: "asawir",
    image: storeImage("https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=480&q=80", "bracelets_seed"),
    description: "أساور مميزة بتفاصيل دقيقة تناسب التكديس أو الارتداء المنفرد",
    sortOrder: 2,
    visible: true,
    linkedProducts: []
  },
  {
    id: "aqrat",
    name: "أقراط",
    slug: "aqrat",
    image: storeImage("https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=480&q=80", "earrings_seed"),
    description: "أقراط متدلية وناعمة تضفي لمعاناً رائعاً على وجهك",
    sortOrder: 3,
    visible: true,
    linkedProducts: []
  },
  {
    id: "khawatim",
    name: "خواتم",
    slug: "khawatim",
    image: storeImage("https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=480&q=80", "rings_seed"),
    description: "خواتم زركون بلمسة عصرية تناسب كل يوم والمناسبات السعيدة",
    sortOrder: 4,
    visible: true,
    linkedProducts: []
  }
];

export function getCategoryById(id: string): Category | undefined {
  return seedCategories.find((cat) => cat.id === id);
}

export function getCategoryName(id: string): string {
  const cat = getCategoryById(id);
  return cat ? cat.name : "تصنيف";
}
