import { storeImage } from "./imagekit";
import type { Coupon, Customer, Order, Product, Story } from "./types";

export const whatsappNumber = "967781679899";

export const categories = [
  { id: "crowns", name: "تيجان", icon: "Crown" },
  { id: "earrings", name: "أقراط", icon: "Sparkles" },
  { id: "bracelets", name: "أساور", icon: "CircleDot" },
  { id: "zircon", name: "زركون", icon: "Gem" },
  { id: "sets", name: "أطقم", icon: "Boxes" },
  { id: "other", name: "أخرى", icon: "BadgePlus" }
] as const;

export const stories: Story[] = [
  {
    id: "new",
    title: "جديد",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=420&q=80",
    color: "#D89CA4"
  },
  {
    id: "offers",
    title: "عروض",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=420&q=80",
    color: "#B76E79"
  },
  {
    id: "trend",
    title: "ترند",
    image: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=420&q=80",
    color: "#E0B56A"
  },
  {
    id: "sets",
    title: "أطقم",
    image: "https://images.unsplash.com/photo-1512163143273-bde0e3cc7407?auto=format&fit=crop&w=420&q=80",
    color: "#8FAF9A"
  },
  {
    id: "clients",
    title: "تصوير عميلات",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=420&q=80",
    color: "#D8A48F"
  }
];

export const products: Product[] = [
  {
    id: "p-001",
    slug: "luna-zircon-set",
    name: "طقم لونا زركون روز",
    category: "sets",
    price: 18500,
    compareAt: 22000,
    rating: 4.9,
    reviews: 128,
    badges: ["جديد", "ترند"],
    status: ["new", "trend", "featured"],
    images: [
      storeImage("https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1100&q=85"),
      storeImage("https://images.unsplash.com/photo-1512163143273-bde0e3cc7407?auto=format&fit=crop&w=1100&q=85"),
      storeImage("https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1100&q=85")
    ],
    colors: ["روز قولد", "فضي", "ذهبي ناعم"],
    sizes: ["قابل للتعديل", "S", "M"],
    stock: 18,
    inventoryStatus: "متوفر",
    description:
      "طقم زركون بلمعة ناعمة ولمسة روز قولد مصممة للمناسبات الراقية والإطلالات الهادئة.",
    material: "زركون فاخر مع طلاء Rose Gold مقاوم للبهتان",
    tags: ["زركون", "طقم", "مناسبات"],
    views: 1840,
    sold: 96
  },
  {
    id: "p-002",
    slug: "serene-crown",
    name: "تاج سيرين الملكي",
    category: "crowns",
    price: 14200,
    compareAt: 16800,
    rating: 4.8,
    reviews: 86,
    badges: ["محدود", "الأكثر مبيعًا"],
    status: ["best-seller", "featured"],
    images: [
      storeImage("https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1100&q=85"),
      storeImage("https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=1100&q=85"),
      storeImage("https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=1100&q=85")
    ],
    colors: ["فضي", "روز قولد"],
    sizes: ["One Size"],
    stock: 7,
    inventoryStatus: "منخفض",
    description: "تاج ناعم بإطار خفيف وتفاصيل زركون دقيقة تمنح الإطلالة حضورًا ملكيًا بلا مبالغة.",
    material: "نحاس مطلي وزركون عالي الصفاء",
    tags: ["تاج", "زفاف", "ملكة"],
    views: 1522,
    sold: 73
  },
  {
    id: "p-003",
    slug: "mira-earrings",
    name: "أقراط ميرا المتدلية",
    category: "earrings",
    price: 6900,
    compareAt: 7900,
    rating: 4.7,
    reviews: 64,
    badges: ["ترند"],
    status: ["trend"],
    images: [
      storeImage("https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=1100&q=85"),
      storeImage("https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=1100&q=85"),
      storeImage("https://images.unsplash.com/photo-1602752250015-52934bc45613?auto=format&fit=crop&w=1100&q=85")
    ],
    colors: ["روز قولد", "ذهبي"],
    sizes: ["خفيف"],
    stock: 31,
    inventoryStatus: "متوفر",
    description: "أقراط بخطوط رفيعة وانعكاس ناعم يضيف لمعانًا قريبًا من الوجه طوال اليوم.",
    material: "ستانلس ستيل مطلي وزركون أبيض",
    tags: ["أقراط", "ترند", "يومي"],
    views: 1320,
    sold: 58
  },
  {
    id: "p-004",
    slug: "roya-bracelet",
    name: "سوار رؤى المرن",
    category: "bracelets",
    price: 8200,
    rating: 4.9,
    reviews: 102,
    badges: ["الأكثر مبيعًا"],
    status: ["best-seller"],
    images: [
      storeImage("https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1100&q=85"),
      storeImage("https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1100&q=85"),
      storeImage("https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&w=1100&q=85")
    ],
    colors: ["فضي", "ذهبي ناعم"],
    sizes: ["S", "M", "L"],
    stock: 22,
    inventoryStatus: "متوفر",
    description: "سوار مرن بتدرج زركون متوازن، مناسب للتكديس مع أساور ناعمة أو ارتدائه منفردًا.",
    material: "معدن مقاوم للماء وزركون AAA",
    tags: ["سوار", "يومي", "هدية"],
    views: 2210,
    sold: 121
  },
  {
    id: "p-005",
    slug: "noor-zircon-ring",
    name: "خاتم نور الزركون",
    category: "zircon",
    price: 5600,
    compareAt: 6500,
    rating: 4.8,
    reviews: 77,
    badges: ["جديد"],
    status: ["new"],
    images: [
      storeImage("https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=1100&q=85"),
      storeImage("https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1100&q=85"),
      storeImage("https://images.unsplash.com/photo-1589674781759-c21c37956a44?auto=format&fit=crop&w=1100&q=85")
    ],
    colors: ["فضي", "روز قولد"],
    sizes: ["6", "7", "8", "9"],
    stock: 14,
    inventoryStatus: "متوفر",
    description: "خاتم زركون مركزي بلمعة صافية وحافة ناعمة تناسب الارتداء اليومي والمناسبات.",
    material: "زركون شفاف مع طلاء فاخر",
    tags: ["خاتم", "زركون", "هدية"],
    views: 1760,
    sold: 89
  },
  {
    id: "p-006",
    slug: "tala-pearl-chain",
    name: "سلسال تالا لؤلؤ",
    category: "other",
    price: 7400,
    rating: 4.6,
    reviews: 54,
    badges: ["مميز"],
    status: ["featured"],
    images: [
      storeImage("https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=1100&q=85"),
      storeImage("https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1100&q=85"),
      storeImage("https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1100&q=85")
    ],
    colors: ["لؤلؤي", "ذهبي"],
    sizes: ["40cm", "45cm"],
    stock: 26,
    inventoryStatus: "متوفر",
    description: "سلسال لؤلؤ ناعم بتفاصيل ذهبية صغيرة، يضيف طبقة أنيقة للإطلالة اليومية.",
    material: "لؤلؤ صناعي فاخر مع طلاء ذهبي",
    tags: ["سلسال", "لؤلؤ", "ناعم"],
    views: 980,
    sold: 42
  },
  {
    id: "p-007",
    slug: "layal-evening-set",
    name: "طقم ليال المسائي",
    category: "sets",
    price: 21500,
    compareAt: 24800,
    rating: 5,
    reviews: 35,
    badges: ["محدود", "مميز"],
    status: ["featured"],
    images: [
      storeImage("https://images.unsplash.com/photo-1512163143273-bde0e3cc7407?auto=format&fit=crop&w=1100&q=85"),
      storeImage("https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1100&q=85"),
      storeImage("https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1100&q=85")
    ],
    colors: ["فضي", "روز قولد"],
    sizes: ["قابل للتعديل"],
    stock: 5,
    inventoryStatus: "منخفض",
    description: "طقم مسائي متكامل بتفاصيل براقة متدرجة، مناسب للحفلات والإطلالات الراقية.",
    material: "زركون متعدد القصات مع تشطيب ساتان",
    tags: ["طقم", "مسائي", "محدود"],
    views: 1185,
    sold: 39
  },
  {
    id: "p-008",
    slug: "haneen-mini-earcuff",
    name: "إيركف حنين الناعم",
    category: "earrings",
    price: 3900,
    rating: 4.5,
    reviews: 41,
    badges: ["جديد"],
    status: ["new"],
    images: [
      storeImage("https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=1100&q=85"),
      storeImage("https://images.unsplash.com/photo-1602752250015-52934bc45613?auto=format&fit=crop&w=1100&q=85"),
      storeImage("https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=1100&q=85")
    ],
    colors: ["فضي", "ذهبي"],
    sizes: ["One Size"],
    stock: 40,
    inventoryStatus: "متوفر",
    description: "إيركف صغير بخط Rose Gold رفيع، يضيف لمعة عصرية دون الحاجة لثقب إضافي.",
    material: "ستانلس ستيل مطلي",
    tags: ["إيركف", "يومي", "خفيف"],
    views: 890,
    sold: 31
  },
  {
    id: "p-009",
    slug: "zircon-test-ascii",
    name: "طقم لونا زركون روز",
    category: "sets",
    price: 18500,
    compareAt: 22000,
    rating: 4.9,
    reviews: 128,
    badges: ["جديد", "ترند"],
    status: ["new", "trend", "featured"],
    images: [
      storeImage("https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1100&q=85"),
      storeImage("https://images.unsplash.com/photo-1512163143273-bde0e3cc7407?auto=format&fit=crop&w=1100&q=85"),
      storeImage("https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1100&q=85")
    ],
    colors: ["روز قولد", "فضي", "ذهبي ناعم"],
    sizes: ["قابل للتعديل", "S", "M"],
    stock: 18,
    inventoryStatus: "متوفر",
    description:
      "طقم زركون بلمعة ناعمة ولمسة روز قولد مصممة للمناسبات الراقية والإطلالات الهادئة.",
    material: "زركون فاخر مع طلاء Rose Gold مقاوم للبهتان",
    tags: ["زركون", "طقم", "مناسبات"],
    views: 0,
    sold: 0
  }
];

export const orders: Order[] = [
  {
    id: "WH-2401",
    customer: "ريم اليافعي",
    phone: "+967777120991",
    products: ["طقم لونا زركون روز", "سوار رؤى المرن"],
    total: 26700,
    notes: "تغليف هدية",
    status: "جديد",
    createdAt: "2026-05-21"
  },
  {
    id: "WH-2402",
    customer: "هند العنسي",
    phone: "+967733441208",
    products: ["تاج سيرين الملكي"],
    total: 14200,
    notes: "التواصل مساءً",
    status: "تم التواصل",
    createdAt: "2026-05-20"
  },
  {
    id: "WH-2403",
    customer: "لينا سالم",
    phone: "+967781200331",
    products: ["خاتم نور الزركون", "أقراط ميرا المتدلية"],
    total: 12500,
    notes: "مقاس 7",
    status: "مؤكد",
    createdAt: "2026-05-19"
  },
  {
    id: "WH-2404",
    customer: "سارة القباطي",
    phone: "+967770881020",
    products: ["طقم ليال المسائي"],
    total: 21500,
    notes: "تسليم سريع",
    status: "تم التسليم",
    createdAt: "2026-05-18"
  }
];

export const customers: Customer[] = [
  {
    id: "c-001",
    name: "ريم اليافعي",
    phone: "+967777120991",
    vip: true,
    orders: 7,
    total: 118400,
    inspiration: ["طقم لونا زركون روز", "خاتم نور الزركون"]
  },
  {
    id: "c-002",
    name: "هند العنسي",
    phone: "+967733441208",
    vip: false,
    orders: 3,
    total: 42100,
    inspiration: ["تاج سيرين الملكي"]
  },
  {
    id: "c-003",
    name: "لينا سالم",
    phone: "+967781200331",
    vip: true,
    orders: 5,
    total: 86200,
    inspiration: ["سوار رؤى المرن", "أقراط ميرا المتدلية"]
  }
];

export const coupons: Coupon[] = [
  {
    id: "co-001",
    code: "WAHAJ10",
    type: "percentage",
    value: 10,
    expiresAt: "2026-06-15",
    usageLimit: 100,
    minOrder: 10000
  },
  {
    id: "co-002",
    code: "ROSE1500",
    type: "fixed",
    value: 1500,
    expiresAt: "2026-06-01",
    usageLimit: 40,
    minOrder: 15000
  }
];

export function formatPrice(value: number) {
  return new Intl.NumberFormat("ar-YE", {
    style: "currency",
    currency: "YER",
    maximumFractionDigits: 0
  }).format(value);
}
