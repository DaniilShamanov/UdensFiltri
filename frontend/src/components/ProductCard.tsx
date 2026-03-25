"use client";

import React, { useState } from 'react';
import { ShoppingCart, Minus, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Product } from '@/lib/types';
import { useApp } from '@/contexts/AppContext';

import { toast } from 'sonner';
import { Link } from '@/navigation';
import { Input } from '@/components/ui/input';
import { AppImage } from './ui/image';

interface ProductCardProps {
  product: Product;
  showWholesalePrice?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, showWholesalePrice }) => {
  const { addToCart } = useApp();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, quantity);
    toast.success(`Added ${quantity} item${quantity > 1 ? 's' : ''} to cart!`, {
      description: product.name,
    });
  };

  const handleQuantityChange = (newQty: number) => {
    setQuantity(Math.max(1, Math.min(999, newQty)));
  };

  const displayPrice = showWholesalePrice && product.wholesalePrice
    ? product.wholesalePrice
    : product.price;

  return (
    <Link href={`/products/${encodeURIComponent(product.id)}`} className="block" aria-label={product.name}>
      <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 group overflow-hidden h-full flex flex-col">
        <CardContent className="p-0 flex-1 flex flex-col">
          <div className="relative aspect-square bg-muted overflow-hidden">
            <AppImage
              src={product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <div className="p-4 flex-1 flex flex-col">
            <div className="text-sm text-muted-foreground mb-1 line-clamp-1">{product.brand}</div>
            <h3 className="font-semibold mb-2 line-clamp-2 min-h-12 group-hover:text-primary transition-colors break-words overflow-hidden">
              {product.name}
            </h3>

            {/* Price and Quantity row */}
            <div className="flex items-center justify-between gap-2 mt-auto pt-2 flex-wrap">
              {/* Price on left */}
              <div className="text-left">
                <span className="text-xl font-bold text-primary">
                  €{displayPrice.toFixed(2)}
                </span>
                {showWholesalePrice && product.wholesalePrice && product.wholesalePrice < product.price && (
                  <span className="text-sm text-muted-foreground line-through ml-2">
                    €{product.price.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Quantity input on right */}
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleQuantityChange(quantity - 1);
                  }}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  value={quantity}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^\d{0,3}$/.test(val)) {
                      const num = val === '' ? 1 : parseInt(val, 10);
                      if (!isNaN(num)) handleQuantityChange(num);
                    }
                  }}
                  className="h-8 w-14 rounded-none border-y-0 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleQuantityChange(quantity + 1);
                  }}
                  disabled={quantity >= 999}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <Button
              className="w-full mt-3 bg-accent hover:bg-accent/90"
              size="sm"
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {product.inStock ? 'Add to Cart' : 'Out of Stock'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProductCard;