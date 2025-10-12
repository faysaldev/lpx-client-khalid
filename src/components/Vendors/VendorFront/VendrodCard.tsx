"use client";

import { Separator } from "@/components/UI/separator";
import { Vendor } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import {
  Award,
  CheckCircle,
  Clock,
  MapPin,
  Package,
  Shield,
  Star,
  Store,
  TrendingUp,
  Users,
} from "lucide-react";

export default function VendorCard({
  vendor,
  viewMode,
}: {
  vendor: Vendor;
  viewMode: "grid" | "list";
}) {
  const imageUrl =
    vendor?.storePhoto && process.env.NEXT_PUBLIC_BASE_URL
      ? `${process.env.NEXT_PUBLIC_BASE_URL}${vendor.storePhoto}`
      : null;

  if (viewMode === "list") {
    return (
      <Link href={`/vendor/${vendor.id}`}>
        <div className="group bg-card rounded-lg border hover:shadow-lg transition-all p-6">
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="w-full">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    width={500}
                    height={500}
                    alt={vendor.name}
                    className="object-cover rounded-md h-[200px] w-[200px]"
                  />
                ) : (
                  <Store className="h-10 w-10 text-primary" />
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {vendor.name}
                    </h3>
                    {vendor.verified && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {vendor.featured && (
                      <Award className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {vendor.description}
                  </p>

                  {/* {vendor.specialties?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {vendor.specialties.map((specialty: string) => (
                        <Badge
                          key={specialty}
                          variant="outline"
                          className="text-xs"
                        >
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  )} */}

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="font-medium">{vendor.rating}</span>
                      <span className="text-muted-foreground">
                        ({vendor.reviewCount})
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Package className="h-4 w-4" />
                      <span>{vendor.totalProducts} products</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      <span>
                        {vendor.totalSales?.toLocaleString() || 0} sales
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>
                        {vendor.totalProducts?.toLocaleString() || 0} products
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>United States</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/vendor/${vendor.id}`}>
      <div className="group bg-card rounded-lg border hover:shadow-lg transition-all p-4 h-full flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className="w-full">
            {imageUrl ? (
              <Image
                src={imageUrl}
                width={500}
                height={500}
                alt={vendor.name}
                className="object-contain rounded-md h-[200px] w-[200px] "
              />
            ) : (
              <Store className="h-10 w-10 text-primary" />
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
            {vendor.name}
          </h3>
          {vendor.verified && (
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
          )}
          {vendor.featured && (
            <Award className="h-5 w-5 text-yellow-500 flex-shrink-0" />
          )}
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Star className="h-4 w-4 text-yellow-400 fill-current" />
          <span className="font-medium">{vendor.rating}</span>
          <span className="text-sm text-muted-foreground">
            ({vendor.reviewCount} reviews)
          </span>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
          {vendor.description}
        </p>
        {/* 
        {vendor.specialties?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {vendor.specialties.slice(0, 3).map((specialty: string) => (
              <Badge key={specialty} variant="outline" className="text-xs">
                {specialty}
              </Badge>
            ))}
            {vendor.specialties.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{vendor.specialties.length - 3}
              </Badge>
            )}
          </div>
        )} */}

        <Separator className="my-4" />

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Package className="h-3 w-3" />
            <span>{vendor.totalProducts} items</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span>{vendor.totalSales?.toLocaleString() || 0} sales</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{vendor.responseTime} response</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Shield className="h-3 w-3" />
            <span>95% positive</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>United States</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>1,234 followers</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
