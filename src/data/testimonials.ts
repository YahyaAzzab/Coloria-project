import { queryOptions, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Testimonial = {
  id: string;
  name: string;
  role: string | null;
  text: string | null;
  image_url: string | null;
};

export const testimonialsQuery = queryOptions({
  queryKey: ["testimonials", "public"],
  queryFn: async (): Promise<Testimonial[]> => {
    const { data, error } = await supabase
      .from("testimonials")
      .select("id,name,role,text,image_url,is_active,sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Testimonial[];
  },
});

export function useTestimonials(): Testimonial[] {
  return useQuery(testimonialsQuery).data ?? [];
}
