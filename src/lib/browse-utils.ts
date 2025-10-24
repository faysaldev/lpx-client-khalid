import type { Product } from "@/lib/types";

export type ViewMode = "grid" | "list";
export type SortOption =
  | "newest"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc"
  | "highToLow"
  | "lowToHigh"
  | "productsCount"
  | "byRatings"
  | "Oldest"
  | "TopVendor" ;

export interface PriceRange {
  min: number;
  max: number;
}

export interface FilterQuery {
  category?: string;
  minPrice?: number | null;
  maxPrice?: number | null;
  condition?: string;
  rarity?: string;
  search?: string;
  inStock?: boolean;
  vendor?: string;
  tags?: string | string[];
  categories?: string[];
  [key: string]: string | string[] | number | boolean | null | undefined;
}

export interface PriceRangeValidation extends PriceRange {
  valid: boolean;
}

export interface BrowseFilters {
  search: string;
  categories: string[];
  conditions: string[];
  priceRange: PriceRange;
  vendors: string[];
  inStock: boolean;
  tags: string[];
}

export const defaultFilters: BrowseFilters = {
  search: "",
  categories: [],
  conditions: [],
  priceRange: { min: 0, max: 10000 },
  vendors: [],
  inStock: false,
  tags: [],
};

export const CONDITIONS = [
  { value: "Mint", label: "Mint", color: "bg-green-500" },
  { value: "Near Mint", label: "Near Mint", color: "bg-green-400" },
  { value: "Excellent", label: "Excellent", color: "bg-blue-500" },
  { value: "Good", label: "Good", color: "bg-yellow-500" },
  { value: "Fair", label: "Fair", color: "bg-orange-500" },
  { value: "Poor", label: "Poor", color: "bg-red-500" },
  { value: "CGC Graded", label: "CGC Graded", color: "bg-teal-500" },
  { value: "PSA Graded", label: "PSA Graded", color: "bg-blue-600" },
  { value: "BGS Graded", label: "BGS Graded", color: "bg-purple-600" },
];

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest First", icon: "clock" },
  { value: "lowToHigh", label: "Price: Low to High", icon: "arrow-up" },
  { value: "highToLow", label: "Price: High to Low", icon: "arrow-down" },
  { value: "byRatings", label: "Rating: By Ratings", icon: "arrow-down" },
  { value: "Oldest", label: "Oldest: Oldest", icon: "arrow-down" },
  { value: "TopVendor", label: "TopVendor: Top Vendor", icon: "arrow-down",},
];

export function filterProducts(
  products: Product[],
  filters: BrowseFilters
): Product[] {
  return products.filter((product) => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        product.name?.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.category?.toLowerCase().includes(searchLower) ||
        (typeof product.vendor === "string" &&
          product.vendor.toLowerCase().includes(searchLower)) ||
        product.tags?.some((tag) => tag.toLowerCase().includes(searchLower));
      if (!matchesSearch) return false;
    }

    // Category filter
    if (filters.categories.length > 0) {
      // Check if product matches any selected category
      // First try to match against categorySlug
      let matchesCategory = false;

      if (
        product.categorySlug &&
        filters.categories.includes(product.categorySlug)
      ) {
        matchesCategory = true;
      }
      // If not matched, try to match against category name converted to slug format
      else if (product.category) {
        const categorySlug = product.category
          .toLowerCase()
          .replace(/\s+&\s+/g, "-")
          .replace(/\s+/g, "-");
        if (filters.categories.includes(categorySlug)) {
          matchesCategory = true;
        }
      }

      if (!matchesCategory) {
        return false;
      }
    }

    // Condition filter
    if (filters.conditions.length > 0) {
      if (!product.condition || !filters.conditions.includes(product.condition))
        return false;
    }

    // Price range filter
    if (
      product.price < filters.priceRange.min ||
      product.price > filters.priceRange.max
    ) {
      return false;
    }

    // Vendor filter
    if (filters.vendors.length > 0) {
      if (!product.vendorId || !filters.vendors.includes(product.vendorId))
        return false;
    }

    // Stock filter
    if (filters.inStock && product.stock === 0) return false;

    // Tags filter
    if (filters.tags.length > 0) {
      const hasMatchingTag = product.tags?.some((tag) =>
        filters.tags.includes(tag)
      );
      if (!hasMatchingTag) return false;
    }

    return true;
  });
}

export function sortProducts(
  products: Product[],
  sortOption: SortOption | string,
  order?: "asc" | "desc"
): Product[] {
  const sorted = [...products];

  // Handle the test's format (field, order) or the existing format (SortOption)
  if (order !== undefined) {
    // Test format: field and order are separate
    switch (sortOption) {
      case "price":
        return sorted.sort((a, b) => {
          const diff = a.price - b.price;
          return order === "asc" ? diff : -diff;
        });
      case "name":
        return sorted.sort((a, b) => {
          const comp = a.name.localeCompare(b.name);
          return order === "asc" ? comp : -comp;
        });
      default:
        return sorted;
    }
  }

  // Original format with SortOption
  switch (sortOption) {
    case "newest":
      // In real app, would sort by createdAt
      return sorted.reverse();

    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);

    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);

    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));

    case "name-desc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name));

    default:
      return sorted;
  }
}

export function getActiveFilterCount(filters: BrowseFilters): number {
  let count = 0;
  if (filters.search) count++;
  if (filters.categories.length > 0) count += filters.categories.length;
  if (filters.conditions.length > 0) count += filters.conditions.length;
  if (filters.priceRange.min > 0 || filters.priceRange.max < 10000) count++;
  if (filters.vendors.length > 0) count += filters.vendors.length;
  if (filters.inStock) count++;
  if (filters.tags.length > 0) count += filters.tags.length;
  return count;
}

export function formatFilterLabel(filterType: string, value: string): string {
  switch (filterType) {
    case "category":
      return value
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    case "condition": {
      const condition = CONDITIONS.find((c) => c.value === value);
      return condition?.label || value;
    }

    case "price":
      return value;

    default:
      return value;
  }
}

export function getPriceHistogram(
  products: Product[],
  buckets: number = 10
): { range: string; count: number }[] {
  if (products.length === 0) return [];

  const prices = products.map((p) => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const bucketSize = (maxPrice - minPrice) / buckets;

  const histogram: { range: string; count: number }[] = [];

  for (let i = 0; i < buckets; i++) {
    const rangeMin = minPrice + i * bucketSize;
    const rangeMax = minPrice + (i + 1) * bucketSize;
    const count = products.filter(
      (p) => p.price >= rangeMin && p.price < rangeMax
    ).length;

    histogram.push({
      range: `${Math.round(rangeMin)}-${Math.round(rangeMax)}`,
      count,
    });
  }

  return histogram;
}

export function getUniqueVendors(
  products: Product[]
): { id: string; name: string; count: number }[] {
  const vendorMap = new Map<string, { name: string; count: number }>();

  products.forEach((product) => {
    if (product.vendorId && vendorMap.has(product.vendorId)) {
      const vendor = vendorMap.get(product.vendorId);
      if (vendor) vendor.count++;
    } else {
      if (product.vendorId) {
        vendorMap.set(product.vendorId, {
          name:
            typeof product.vendor === "string"
              ? product.vendor
              : product.vendorId,
          count: 1,
        });
      }
    }
  });

  return Array.from(vendorMap.entries())
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.count - a.count);
}

export function getUniqueTags(products: Product[]): string[] {
  const tags = new Set<string>();

  products.forEach((product) => {
    product.tags?.forEach((tag) => {
      tags.add(tag);
    });
  });

  return Array.from(tags).sort();
}

// Build query string from filter object
export function buildFilterQuery(filters: FilterQuery): string {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      if (Array.isArray(value)) {
        params.append(key, value.join(","));
      } else {
        params.append(key, String(value));
      }
    }
  });

  return decodeURIComponent(params.toString());
}

// Parse query string to filter object
export function parseFilterQuery(query: string): FilterQuery {
  if (!query) return {};

  const params = new URLSearchParams(query);
  const filters: FilterQuery = {};

  params.forEach((value, key) => {
    // Check if we already have this key (for array values)
    if (filters[key]) {
      if (Array.isArray(filters[key])) {
        filters[key].push(value);
      } else {
        filters[key] = [filters[key] as string, value];
      }
    } else {
      filters[key] = value;
    }
  });

  return filters;
}

// Apply filters to products array
export function applyFilters(
  products: Product[],
  filters: FilterQuery
): Product[] {
  let filtered = [...products];

  if (filters.category) {
    filtered = filtered.filter((p) => {
      const categorySlug = p.categorySlug;
      return categorySlug === filters.category;
    });
  }

  if (filters.minPrice !== null && filters.minPrice !== undefined) {
    filtered = filtered.filter((p) => p.price >= Number(filters.minPrice));
  }

  if (filters.maxPrice !== null && filters.maxPrice !== undefined) {
    filtered = filtered.filter((p) => p.price <= Number(filters.maxPrice));
  }

  if (filters.condition) {
    filtered = filtered.filter((p) => p.condition === filters.condition);
  }

  if (filters.search) {
    const searchFilter = createSearchFilter(filters.search);
    filtered = filtered.filter(searchFilter);
  }

  if (filters.inStock) {
    filtered = filtered.filter((p) => p.stock > 0);
  }

  if (filters.vendor) {
    filtered = filtered.filter((p) => {
      const vendorId = p.vendorId;
      return vendorId === filters.vendor;
    });
  }

  return filtered;
}

// Get price range from products
export function getPriceRange(products: Product[]): PriceRange {
  if (products.length === 0) {
    return { min: 0, max: 0 };
  }

  const prices = products.map((p) => p.price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}

// Get unique values for a field
export function getUniqueValues(
  products: Product[],
  field: string
): Set<string> {
  const values = new Set<string>();

  products.forEach((product) => {
    let value: unknown = product as unknown as Record<string, unknown>;

    // Handle nested properties
    const fieldParts = field.split(".");
    for (const part of fieldParts) {
      value = (value as Record<string, unknown>)?.[part];
    }

    if (value !== null && value !== undefined) {
      // Handle both object and string values
      if (
        typeof value === "object" &&
        (value as Record<string, unknown>).slug
      ) {
        values.add(String((value as Record<string, unknown>).slug));
      } else if (
        typeof value === "object" &&
        (value as Record<string, unknown>).name
      ) {
        values.add(String((value as Record<string, unknown>).name));
      } else {
        values.add(String(value));
      }
    }
  });

  return values;
}

// Create search filter function
export function createSearchFilter(
  searchTerm: string
): (product: Product) => boolean {
  if (!searchTerm) {
    return () => true;
  }

  const term = searchTerm.toLowerCase();

  return (product: Product) => {
    // Search in name
    if (product.name?.toLowerCase().includes(term)) {
      return true;
    }

    // Search in description
    if (product.description?.toLowerCase().includes(term)) {
      return true;
    }

    // Search in tags
    if (product.tags?.some((tag) => tag.toLowerCase().includes(term))) {
      return true;
    }

    // Search in category name
    if (product.category?.toLowerCase().includes(term)) {
      return true;
    }

    // Search in vendor name
    if (
      typeof product.vendor === "string" &&
      product.vendor.toLowerCase().includes(term)
    ) {
      return true;
    }

    return false;
  };
}

// Validate price range
export function validatePriceRange(
  min: number | null | undefined,
  max: number | null | undefined
): PriceRangeValidation {
  let validMin = min ?? 0;
  let validMax = max ?? Number.MAX_VALUE;

  // Ensure non-negative
  validMin = Math.max(0, validMin);
  validMax = Math.max(0, validMax);

  // Swap if reversed
  if (validMin > validMax && max !== null && max !== undefined) {
    [validMin, validMax] = [validMax, validMin];
  }

  const valid =
    (min !== null && min !== undefined) || (max !== null && max !== undefined);

  return {
    min: validMin,
    max: validMax,
    valid,
  };
}
