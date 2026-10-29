import type { Product } from '../types/pos';

export function verifyOwnerPin(inputPin: string, storedPin: string): boolean {
  return inputPin === storedPin;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateProductPayload(product: Partial<Product>): ValidationResult {
  const errors: string[] = [];

  if (!product.name || product.name.trim().length === 0) {
    errors.push('Nama produk wajib diisi');
  }

  if (!product.category) {
    errors.push('Kategori wajib dipilih');
  }

  if (product.price === undefined || product.price <= 0) {
    errors.push('Harga harus lebih dari 0');
  }

  if (product.hasVariants && product.variantPrices) {
    const vp = product.variantPrices;
    const hasAnyPrice = vp.biasa || vp.spesial || vp.super;
    if (!hasAnyPrice) {
      errors.push('Minimal satu harga varian harus diisi');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
