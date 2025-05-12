
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types/supabase";

// Get all products
export const getAllProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*');
  
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  
  return data || [];
};

// Get featured products
export const getFeaturedProducts = async (limit = 3): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .gt('featured', 0)
    .order('featured', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
  
  return data || [];
};

// Get product by ID
export const getProductById = async (id: number): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }
  
  return data;
};

// Search products
export const searchProducts = async (
  searchTerm: string, 
  filters: {
    colors?: string[],
    occasions?: string[],
    types?: string[],
    priceRange?: [number, number]
  } = {},
  sortOption = 'featured'
): Promise<Product[]> => {
  let query = supabase
    .from('products')
    .select('*');
  
  // Apply search term filter
  if (searchTerm) {
    query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
  }
  
  // Apply color filters
  if (filters.colors && filters.colors.length > 0) {
    // Using a better approach for color filtering
    const colorConditions = filters.colors.map(color => 
      `colors->>'name' = '${color}'`
    ).join(' OR ');
    
    if (colorConditions) {
      query = query.or(colorConditions);
    }
  }
  
  // Apply occasion filters
  if (filters.occasions && filters.occasions.length > 0) {
    // For proper array containment in JSONB
    query = query.containsAny('occasions', filters.occasions);
  }
  
  // Apply type filters
  if (filters.types && filters.types.length > 0) {
    query = query.in('type', filters.types);
  }
  
  // Apply price range filter - ensure it's applied correctly
  if (filters.priceRange && filters.priceRange.length === 2) {
    const [min, max] = filters.priceRange;
    console.log(`Applying price range filter: ${min} - ${max}`);
    
    query = query
      .gte('price', min)
      .lte('price', max);
  }
  
  // Apply sorting
  switch (sortOption) {
    case 'price-low-high':
      query = query.order('price', { ascending: true });
      break;
    case 'price-high-low':
      query = query.order('price', { ascending: false });
      break;
    case 'name-a-z':
      query = query.order('name', { ascending: true });
      break;
    case 'name-z-a':
      query = query.order('name', { ascending: false });
      break;
    case 'newest':
      query = query.order('date_added', { ascending: false });
      break;
    case 'featured':
    default:
      query = query.order('featured', { ascending: false });
      break;
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error searching products:', error);
    return [];
  }
  
  // Log the result count
  console.log(`Found ${data?.length || 0} products matching filters`);
  
  return data || [];
};

// Get related products
export const getRelatedProducts = async (
  productId: number,
  productType: string | null,
  limit = 4
): Promise<Product[]> => {
  // If we have a product type, get products of the same type
  if (productType) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .neq('id', productId)
      .eq('type', productType)
      .limit(limit);
    
    if (!error && data && data.length >= limit) {
      return data;
    }
  }
  
  // Fallback: just get random products
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .neq('id', productId)
    .limit(limit);
  
  if (error) {
    console.error('Error fetching related products:', error);
    return [];
  }
  
  return data || [];
};
