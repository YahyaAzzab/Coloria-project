import { useQuery, queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import packGift from "@/assets/pack-gift.jpg";

export type Category = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type Product = {
  id?: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  highlights: string[];
  specs: { pages: number; format: string; paper: string; binding: string };
  price: number;
  image: string;
  images: string[];
  category?: Category;
  categoryId?: string | null;
};

export type Pack = {
  id?: string;
  slug: string;
  title: string;
  subtitle: string;
  price: number;
  oldPrice?: number;
  image: string;
  badge?: string;
  tierSize: 2 | 3 | 4 | 5;
};

export type PackTier = {
  size: number;
  price: number;
  label: string;
  tagline: string;
  perk: string;
  badge?: string;
  highlight?: boolean;
};

export const PACK_TIERS: PackTier[] = [
  { size: 2, price: 169, label: "Duo", tagline: "Pour démarrer en douceur", perk: "1 marque-page offert" },
  { size: 3, price: 239, label: "Trio", tagline: "Le préféré des coloreurs", perk: "1 carnet créatif offert", badge: "Populaire", highlight: true },
  { size: 4, price: 299, label: "Quatuor", tagline: "L'équilibre parfait", perk: "1 carnet créatif offert", badge: "Meilleur prix" },
  { size: 5, price: 359, label: "Famille", tagline: "À partager en famille", perk: "Pochette cadeau premium offerte" },
];

export const packTierImage = packGift;

const PLACEHOLDER = packGift;
const baseSpecs = {
  pages: 64,
  format: "21 × 29,7 cm (A4)",
  paper: "Papier épais 120g/m²",
  binding: "Reliure souple cousue",
};

function mapProduct(row: any): Product {
  const img = (row.image_url && String(row.image_url).trim()) || PLACEHOLDER;
  const imgs =
    Array.isArray(row.images) && row.images.length
      ? (row.images as string[])
      : [img];
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    tagline: row.tagline ?? "",
    description: row.description ?? "",
    highlights: Array.isArray(row.highlights) ? (row.highlights as string[]) : [],
    specs: { ...baseSpecs, ...(row.specs ?? {}) },
    price: Number(row.price) || 0,
    image: img,
    images: imgs,
    categoryId: row.category_id,
    category: row.categories ? {
      id: row.categories.id,
      slug: row.categories.slug,
      title: row.categories.title,
      description: row.categories.description,
      sortOrder: row.categories.sort_order,
      isActive: row.categories.is_active,
    } : undefined,
  };
}

function mapPack(row: any): Pack {
  const size = (Number(row.tier_size) || 2) as 2 | 3 | 4 | 5;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle ?? "",
    price: Number(row.price) || 0,
    oldPrice: row.old_price != null ? Number(row.old_price) : undefined,
    image: (row.image_url && String(row.image_url).trim()) || packGift,
    badge: row.badge || undefined,
    tierSize: size,
  };
}

export const productsQuery = queryOptions({
  queryKey: ["products", "public"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*, categories(*)")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapProduct);
  },
});

export const packsQuery = queryOptions({
  queryKey: ["packs", "public"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("packs")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapPack);
  },
});

export function useProducts(): Product[] {
  return useQuery(productsQuery).data ?? [];
}

export function usePacks(): Pack[] {
  return useQuery(packsQuery).data ?? [];
}

export const categoriesQuery = queryOptions({
  queryKey: ["categories", "public"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []).map((row: any) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      description: row.description,
      sortOrder: row.sort_order,
      isActive: row.is_active,
    })) as Category[];
  },
});

export function useCategories(): Category[] {
  return useQuery(categoriesQuery).data ?? [];
}
