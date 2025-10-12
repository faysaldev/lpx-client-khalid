/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Heart, Minus, Plus, ShoppingCart, Star, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef } from "react";
import PageLayout from "@/components/layout/PageLayout";
import {
  ConditionBadge,
  GradingBadge,
  SealedBadge,
  StockBadge,
} from "@/components/UI/badge.variants";
import { Button } from "@/components/UI/button";
import { designTokens } from "@/design-system/compat";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import { useGetSingleProductQuery } from "@/redux/features/products/product";
import { useBuyNowMutation } from "@/redux/features/BuyNowPyemant/BuyNowPyemant";
import VendorTruncateDetails from "@/components/Vendors/SingleVendorView/VendorTruncateDetails";
import { getImageUrl } from "@/lib/getImageURL";
import { useAddNewToWishListMutation } from "@/redux/features/GetWishList/GetWishList";

// Image Magnifier Component
interface ImageMagnifierProps {
  src: string;
  alt: string;
  magnifierHeight?: number;
  magnifierWidth?: number;
  zoomLevel?: number;
}

const ImageMagnifier = ({
  src,
  alt,
  magnifierHeight = 200,
  magnifierWidth = 200,
  zoomLevel = 2.5,
}: ImageMagnifierProps) => {
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [[x, y], setXY] = useState([0, 0]);
  const [[imgWidth, imgHeight], setSize] = useState([0, 0]);
  const imgRef = useRef<HTMLImageElement>(null);

  const mouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const elem = e.currentTarget;
    const { width, height } = elem.getBoundingClientRect();
    setSize([width, height]);
    setShowMagnifier(true);
  };

  const mouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const elem = e.currentTarget;
    const { top, left } = elem.getBoundingClientRect();

    const x = e.pageX - left - window.pageXOffset;
    const y = e.pageY - top - window.pageYOffset;
    setXY([x, y]);
  };

  const mouseLeave = () => {
    setShowMagnifier(false);
  };

  return (
    <div
      className="relative w-full h-full"
      onMouseEnter={mouseEnter}
      onMouseMove={mouseMove}
      onMouseLeave={mouseLeave}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className="w-full h-full object-contain rounded-lg"
        style={{ display: "block" }}
      />

      {showMagnifier && (
        <div
          style={{
            position: "absolute",
            pointerEvents: "none",
            height: `${magnifierHeight}px`,
            width: `${magnifierWidth}px`,
            top: `${y - magnifierHeight / 2}px`,
            left: `${x - magnifierWidth / 2}px`,
            opacity: "1",
            border: "2px solid lightgray",
            backgroundColor: "white",
            backgroundImage: `url('${src}')`,
            backgroundRepeat: "no-repeat",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",

            backgroundSize: `${imgWidth * zoomLevel}px ${
              imgHeight * zoomLevel
            }px`,

            backgroundPositionX: `${-x * zoomLevel + magnifierWidth / 2}px`,
            backgroundPositionY: `${-y * zoomLevel + magnifierHeight / 2}px`,
          }}
        />
      )}
    </div>
  );
};

const ProductDetailsPage = () => {
  // const type = "product";
  const { id }: any = useParams();

  // const idtype = { id, type };

  const { data, isLoading, isError } = useGetSingleProductQuery(id);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const [payment] = useBuyNowMutation();
  const [addtoWithlist] = useAddNewToWishListMutation();

  const allData = data?.data?.attributes;

  // Map API data to component format
  const product = data?.data
    ? {
        id: allData._id,
        name: allData.productName,
        description: allData.description,
        price: allData.price,
        optionalPrice: allData.optionalPrice,
        discountPercentage: allData.discountPercentage,
        stock: allData.stockQuantity,
        inStock: allData.inStock,
        category: allData.category,
        categorySlug: allData.category.toLowerCase().replace(/\s+/g, "-"),
        brand: allData.brand,
        StorePolicies: allData?.vendor?.storePolicies,
        condition: allData.condition,
        rarity: allData.rarity,
        state: allData.condition?.includes("Sealed") ? "sealed" : "open",
        images:
          allData.images?.map((img: string) =>
            img.startsWith("http")
              ? img
              : `${process.env.NEXT_PUBLIC_API_URL || ""}/${img.replace(
                  /\\/g,
                  "/"
                )}`
          ) || [],
        image: allData.images?.[0]
          ? allData.images[0].startsWith("http")
            ? allData.images[0]
            : `${
                process.env.NEXT_PUBLIC_API_URL || ""
              }/${allData.images[0].replace(/\\/g, "/")}`
          : "/placeholder-card.jpg",
        vendor: allData.vendor?.storeName || "Unknown Vendor",
        vendorId: allData.vendor?._id,
        vendorPhoto: allData.vendor?.storePhoto,
        vendorVerified: allData.vendor?.verified,
        vendorRating: allData.vendor?.averageRating || 0,
        vendorContact: {
          email: allData.vendor?.contactEmail,
          phone: allData.vendor?.phoneNumber,
        },
        tags: allData.tags?.filter((tag: string) => tag.trim() !== "") || [],
        shipping: allData.shipping,
        acceptOffers: allData.acceptOffers,
        specifications: {
          Brand: allData.brand,
          Category: allData.category,
          Condition: allData.condition,
          Rarity: allData.rarity,
          ...(allData.shipping?.weight && {
            Weight: `${allData.shipping.weight} lbs`,
          }),
          ...(allData.shipping?.dimensions && {
            Dimensions: allData.shipping.dimensions,
          }),
        },
        grading:
          allData.condition?.includes("BGS") ||
          allData.condition?.includes("PSA")
            ? {
                company: allData.condition.includes("BGS") ? "BGS" : "PSA",
                grade: "N/A",
              }
            : undefined,
      }
    : null;

  const totalPrice = product?.price * quantity || 0;
  const byNowHandler = async () => {
    const data = [
      {
        productId: product?.id,
        quantity: quantity,
        price: totalPrice,
        vendorId: product?.vendorId,
      },
    ];
    try {
      const res = await payment(data);
      if (res?.data?.code === 200) {
        window.location.href = res?.data?.data?.attributes?.payment_url || "/";
      }
    } catch (error) {
      console.log("error showld", error);
    }
  };

  const saveTowishList = async () => {
    await addtoWithlist({
      products: product?.id,
      vendorId: product?.vendor?._id,
    });
  };

  if (isLoading) {
    return (
      <PageLayout title="Loading..." showHeader={true} showFooter={true}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageLayout>
    );
  }

  if (isError || !product) {
    return (
      <PageLayout title="Product Not Found" showHeader={true} showFooter={true}>
        <div className="text-center py-12">
          <h1 className={cn(designTokens.typography.h3, "mb-4")}>
            Product Not Found
          </h1>
          <p className={cn(designTokens.typography.bodySmall, "mb-6")}>
            The product you{`'`}re looking for doesn{`'`}t exist or has been
            removed.
          </p>
          <Link href="/browse" className="text-primary hover:underline">
            Back to Browse
          </Link>
        </div>
      </PageLayout>
    );
  }

  const breadcrumbs = [
    { label: "Browse", href: "/browse" },
    {
      label: product.category,
      href: `/category/${product.categorySlug}`,
    },
    { label: product.name },
  ];

  return (
    <PageLayout
      breadcrumbs={breadcrumbs}
      showHeader={true}
      showFooter={true}
      withCard={true}
    >
      <section>
        <div className="flex min-h-[600px] overflow-hidden rounded-lg border">
          {/* Left Half - Product Images */}
          <div className="flex-1 flex flex-col bg-muted/30 border-r">
            {/* Main Image with Magnifier */}
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="w-full max-w-lg aspect-square relative">
                <ImageMagnifier
                  src={
                    product.images?.[selectedImage]
                      ? `${process.env.NEXT_PUBLIC_BASE_URL}/${product.images[selectedImage]}`
                      : product.image
                      ? `${process.env.NEXT_PUBLIC_BASE_URL}/${product.image}`
                      : "/placeholder-card.jpg"
                  }
                  alt={product.name}
                  magnifierHeight={250}
                  magnifierWidth={250}
                  zoomLevel={2.5}
                />
              </div>
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 0 && (
              <div className="p-6 border-t">
                <div className="flex space-x-3 justify-center">
                  {product.images.map((image: any, index: number) => (
                    <button
                      type="button"
                      key={`image-${index}`}
                      onClick={() => setSelectedImage(index)}
                      className={cn(
                        "flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden transition-all relative",
                        selectedImage === index
                          ? "border-primary ring-2 ring-primary ring-opacity-20"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <Image
                        src={image ? getImageUrl(image) : ""}
                        alt={`${product.name} view ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Half - Product Info */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <div className="p-8 space-y-6">
                {/* Title and Rating */}
                <div>
                  <h1 className={cn(designTokens.typography.h3, "mb-2")}>
                    {product.name}
                  </h1>

                  {/* Seller Info */}
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground">
                      Sold by{" "}
                      {product.vendorId ? (
                        <Link
                          href={`/vendor/${product.vendorId}`}
                          className="font-medium text-foreground hover:text-primary transition-colors underline decoration-dotted hover:decoration-solid"
                        >
                          {product.vendor}
                        </Link>
                      ) : (
                        <span className="font-medium text-foreground">
                          {product.vendor}
                        </span>
                      )}
                      {product.vendorVerified && (
                        <span className="ml-2 inline-flex items-center text-xs text-green-600">
                          ✓ Verified
                        </span>
                      )}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={`star-${product.id}-${i}`}
                            className={cn(
                              "h-3 w-3",
                              i < Math.floor(product.vendorRating)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            )}
                          />
                        ))}
                      </div>
                      <span>
                        {product.vendorRating > 0
                          ? `${product.vendorRating.toFixed(1)} rating`
                          : "(New Seller)"}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="text-sm text-muted-foreground">
                      SKU: {product.id.slice(-8).toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <div className="flex items-baseline space-x-2">
                    <span className={cn(designTokens.typography.h4)}>
                      AED {product.price.toLocaleString()}
                    </span>
                    {product.discountPercentage > 0 && (
                      <>
                        <span className="text-sm text-muted-foreground line-through">
                          AED {product.optionalPrice.toLocaleString()}
                        </span>
                        <span className="text-xs font-semibold text-green-600">
                          {product.discountPercentage}% OFF
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {product.stock > 5
                      ? "In Stock"
                      : product.stock > 0
                      ? `Only ${product.stock} left in stock`
                      : "Out of Stock"}
                  </p>
                </div>

                {/* Product Badges */}
                <div className="flex flex-wrap gap-2">
                  {product.stock <= 5 && product.stock > 0 && (
                    <StockBadge stock={product.stock} />
                  )}
                  {product.state === "sealed" && <SealedBadge />}
                  {product.state === "open" && product.grading && (
                    <GradingBadge
                      company={product.grading.company}
                      grade={product.grading.grade}
                    />
                  )}
                  {product.state === "open" &&
                    !product.grading &&
                    product.condition && (
                      <ConditionBadge condition={product.condition} />
                    )}
                  {product.rarity && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {product.rarity}
                    </span>
                  )}
                </div>

                {/* Tags */}
                {product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag: any, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Quantity and Add to Cart */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium">Quantity:</span>
                    <div className="flex items-center border rounded-lg">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="px-4 py-2 text-center min-w-[50px]">
                        {quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setQuantity(Math.min(product.stock, quantity + 1))
                        }
                        disabled={quantity >= product.stock}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <Button
                      size="lg"
                      className="min-w-[140px]"
                      disabled={!product.inStock || product.stock === 0}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="min-w-[120px]"
                      disabled={!product.inStock || product.stock === 0}
                      onClick={() => byNowHandler()}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Buy Now
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => saveTowishList()}
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Shipping Info */}
                {product.shipping && (
                  <div className="border rounded-lg p-4 bg-muted/20">
                    <h3 className="font-medium mb-2">Shipping Information</h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {product.shipping.shippingCost !== undefined && (
                        <p>Shipping Cost: ${product.shipping.shippingCost}</p>
                      )}
                      {product.shipping.weight && (
                        <p>Weight: {product.shipping.weight} lbs</p>
                      )}
                      {product.shipping.dimensions && (
                        <p>Dimensions: {product.shipping.dimensions}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Product specifications */}
        <div className="border-t pt-6">
          {product.specifications &&
            Object.keys(product.specifications).length > 0 && (
              <div>
                <h3 className={cn(designTokens.typography.h4, "mb-3")}>
                  Specifications
                </h3>
                <div className="space-y-2">
                  {Object.entries(product.specifications).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between py-2 border-b border-gray-200 last:border-b-0"
                      >
                        <span className="font-medium">{key}:</span>
                        <span className="text-muted-foreground">
                          {String(value)}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
        </div>
        <br />

        {product?.StorePolicies ? (
          <div>
            <h1 className="text-xl font-semibold">Description</h1>
            <VendorTruncateDetails
              description={product?.description}
              truncateLength={300}
            />
            <br />
          </div>
        ) : null}

        {product?.StorePolicies ? (
          <div>
            <h1 className="text-xl font-semibold">Shipping Policy</h1>
            <VendorTruncateDetails
              description={product?.StorePolicies?.shippingPolicy}
              truncateLength={250}
            />
            <br />
            <h1 className="text-xl font-semibold">Return Policy</h1>
            <VendorTruncateDetails
              description={product?.StorePolicies?.returnPolicy}
              truncateLength={250}
            />
          </div>
        ) : null}
      </section>
    </PageLayout>
  );
};

export default ProductDetailsPage;

// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";
// import { Heart, Minus, Plus, ShoppingCart, Star, Zap } from "lucide-react";
// import Image from "next/image";
// import Link from "next/link";
// import { useState } from "react";
// import PageLayout from "@/components/layout/PageLayout";
// import {
//   ConditionBadge,
//   GradingBadge,
//   SealedBadge,
//   StockBadge,
// } from "@/components/UI/badge.variants";
// import { Button } from "@/components/UI/button";
// import { designTokens } from "@/design-system/compat";
// import { cn } from "@/lib/utils";
// import { useParams } from "next/navigation";
// import { useGetSingleProductQuery } from "@/redux/features/products/product";
// // TODO: product ratings import
// // import ReviewAndRatingsProduct from "@/components/ReviewAndRatingsProduct/ReviewAndRatingsProduct";
// import { useBuyNowMutation } from "@/redux/features/BuyNowPyemant/BuyNowPyemant";
// import VendorTruncateDetails from "@/components/Vendors/SingleVendorView/VendorTruncateDetails";
// import { getImageUrl } from "@/lib/getImageURL";
// import { useAddNewToWishListMutation } from "@/redux/features/GetWishList/GetWishList";

// const ProductDetailsPage = () => {
//   const type = "product";
//   const { id }: any = useParams();

//   const idtype = { id, type };

//   const { data, isLoading, isError } = useGetSingleProductQuery(id);

//   const [selectedImage, setSelectedImage] = useState(0);
//   const [quantity, setQuantity] = useState(1);

//   const [payment] = useBuyNowMutation();
//   const [addtoWithlist] = useAddNewToWishListMutation();

//   const allData = data?.data?.attributes;

//   // Map API data to component format
//   const product = data?.data
//     ? {
//         id: allData._id,
//         name: allData.productName,
//         description: allData.description,
//         price: allData.price,
//         optionalPrice: allData.optionalPrice,
//         discountPercentage: allData.discountPercentage,
//         stock: allData.stockQuantity,
//         inStock: allData.inStock,
//         category: allData.category,
//         categorySlug: allData.category.toLowerCase().replace(/\s+/g, "-"),
//         brand: allData.brand,
//         StorePolicies: allData?.vendor?.storePolicies,
//         condition: allData.condition,
//         rarity: allData.rarity,
//         state: allData.condition?.includes("Sealed") ? "sealed" : "open",
//         images:
//           allData.images?.map((img: string) =>
//             img.startsWith("http")
//               ? img
//               : `${process.env.NEXT_PUBLIC_API_URL || ""}/${img.replace(
//                   /\\/g,
//                   "/"
//                 )}`
//           ) || [],
//         image: allData.images?.[0]
//           ? allData.images[0].startsWith("http")
//             ? allData.images[0]
//             : `${
//                 process.env.NEXT_PUBLIC_API_URL || ""
//               }/${allData.images[0].replace(/\\/g, "/")}`
//           : "/placeholder-card.jpg",
//         vendor: allData.vendor?.storeName || "Unknown Vendor",
//         vendorId: allData.vendor?._id,
//         vendorPhoto: allData.vendor?.storePhoto,
//         vendorVerified: allData.vendor?.verified,
//         vendorRating: allData.vendor?.averageRating || 0,
//         vendorContact: {
//           email: allData.vendor?.contactEmail,
//           phone: allData.vendor?.phoneNumber,
//         },
//         tags: allData.tags?.filter((tag: string) => tag.trim() !== "") || [],
//         shipping: allData.shipping,
//         acceptOffers: allData.acceptOffers,
//         specifications: {
//           Brand: allData.brand,
//           Category: allData.category,
//           Condition: allData.condition,
//           Rarity: allData.rarity,
//           ...(allData.shipping?.weight && {
//             Weight: `${allData.shipping.weight} lbs`,
//           }),
//           ...(allData.shipping?.dimensions && {
//             Dimensions: allData.shipping.dimensions,
//           }),
//         },
//         grading:
//           allData.condition?.includes("BGS") ||
//           allData.condition?.includes("PSA")
//             ? {
//                 company: allData.condition.includes("BGS") ? "BGS" : "PSA",
//                 grade: "N/A", // You might need to parse this from condition string
//               }
//             : undefined,
//       }
//     : null;

//   const totalPrice = product?.price * quantity || 0;
//   const byNowHandler = async () => {
//     const data = [
//       {
//         productId: product?.id,
//         quantity: quantity,
//         price: totalPrice,
//         vendorId: product?.vendorId,
//       },
//     ];
//     console.log("pyment data show ", data);
//     try {
//       const res = await payment(data);
//       if (res?.data?.code === 200) {
//         // console.log()
//         window.location.href = res?.data?.data?.attributes?.payment_url || "/";
//       }
//     } catch (error) {
//       console.log("error showld", error);
//     }
//   };

//   const saveTowishList = async () => {
//     await addtoWithlist({
//       products: product?.id,
//       vendorId: product?.vendor?._id,
//     });
//   };

//   if (isLoading) {
//     return (
//       <PageLayout title="Loading..." showHeader={true} showFooter={true}>
//         <div className="flex items-center justify-center min-h-[400px]">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//         </div>
//       </PageLayout>
//     );
//   }

//   if (isError || !product) {
//     return (
//       <PageLayout title="Product Not Found" showHeader={true} showFooter={true}>
//         <div className="text-center py-12">
//           <h1 className={cn(designTokens.typography.h3, "mb-4")}>
//             Product Not Found
//           </h1>
//           <p className={cn(designTokens.typography.bodySmall, "mb-6")}>
//             The product you{`'`}re looking for doesn{`'`}t exist or has been
//             removed.
//           </p>
//           <Link href="/browse" className="text-primary hover:underline">
//             Back to Browse
//           </Link>
//         </div>
//       </PageLayout>
//     );
//   }

//   const breadcrumbs = [
//     { label: "Browse", href: "/browse" },
//     {
//       label: product.category,
//       href: `/category/${product.categorySlug}`,
//     },
//     { label: product.name },
//   ];

//   return (
//     <PageLayout
//       breadcrumbs={breadcrumbs}
//       showHeader={true}
//       showFooter={true}
//       withCard={true}
//     >
//       <section>
//         <div className="flex min-h-[600px] overflow-hidden rounded-lg border">
//           {/* Left Half - Product Images */}
//           <div className="flex-1 flex flex-col bg-muted/30 border-r">
//             {/* Main Image */}
//             <div className="flex-1 flex items-center justify-center p-8">
//               <div className="w-full max-w-lg aspect-square relative">
//                 <Image
//                   src={
//                     product.images?.[selectedImage]
//                       ? `${process.env.NEXT_PUBLIC_BASE_URL}/${product.images[selectedImage]}`
//                       : product.image
//                       ? `${process.env.NEXT_PUBLIC_BASE_URL}/${product.image}`
//                       : "" // fallback image
//                   }
//                   alt={product.name}
//                   fill
//                   className="object-contain rounded-lg"
//                 />
//               </div>
//             </div>

//             {/* Thumbnail Images */}
//             {product.images.length > 0 && (
//               <div className="p-6 border-t">
//                 <div className="flex space-x-3 justify-center">
//                   {product.images.map((image: any, index: number) => (
//                     <button
//                       type="button"
//                       key={`image-${index}`}
//                       onClick={() => setSelectedImage(index)}
//                       className={cn(
//                         "flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden transition-all relative",
//                         selectedImage === index
//                           ? "border-primary ring-2 ring-primary ring-opacity-20"
//                           : "border-gray-200 hover:border-gray-300"
//                       )}
//                     >
//                       <Image
//                         src={image ? getImageUrl(image) : ""}
//                         alt={`${product.name} view ${index + 1}`}
//                         fill
//                         className="object-cover"
//                       />
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Right Half - Product Info */}
//           <div className="flex-1 flex flex-col">
//             <div className="flex-1 overflow-y-auto">
//               <div className="p-8 space-y-6">
//                 {/* Title and Rating */}
//                 <div>
//                   <h1 className={cn(designTokens.typography.h3, "mb-2")}>
//                     {product.name}
//                   </h1>

//                   {/* Seller Info */}
//                   <div className="mb-4">
//                     <p className="text-sm text-muted-foreground">
//                       Sold by{" "}
//                       {product.vendorId ? (
//                         <Link
//                           href={`/vendor/${product.vendorId}`}
//                           className="font-medium text-foreground hover:text-primary transition-colors underline decoration-dotted hover:decoration-solid"
//                         >
//                           {product.vendor}
//                         </Link>
//                       ) : (
//                         <span className="font-medium text-foreground">
//                           {product.vendor}
//                         </span>
//                       )}
//                       {product.vendorVerified && (
//                         <span className="ml-2 inline-flex items-center text-xs text-green-600">
//                           ✓ Verified
//                         </span>
//                       )}
//                     </p>
//                     <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
//                       <div className="flex">
//                         {[...Array(5)].map((_, i) => (
//                           <Star
//                             key={`star-${product.id}-${i}`}
//                             className={cn(
//                               "h-3 w-3",
//                               i < Math.floor(product.vendorRating)
//                                 ? "text-yellow-400 fill-yellow-400"
//                                 : "text-gray-300"
//                             )}
//                           />
//                         ))}
//                       </div>
//                       <span>
//                         {product.vendorRating > 0
//                           ? `${product.vendorRating.toFixed(1)} rating`
//                           : "(New Seller)"}
//                       </span>
//                     </div>
//                   </div>

//                   <div className="mb-4">
//                     <span className="text-sm text-muted-foreground">
//                       SKU: {product.id.slice(-8).toUpperCase()}
//                     </span>
//                   </div>
//                 </div>

//                 {/* Price */}
//                 <div className="space-y-2">
//                   <div className="flex items-baseline space-x-2">
//                     <span className={cn(designTokens.typography.h4)}>
//                       AED {product.price.toLocaleString()}
//                     </span>
//                     {product.discountPercentage > 0 && (
//                       <>
//                         <span className="text-sm text-muted-foreground line-through">
//                           AED {product.optionalPrice.toLocaleString()}
//                         </span>
//                         <span className="text-xs font-semibold text-green-600">
//                           {product.discountPercentage}% OFF
//                         </span>
//                       </>
//                     )}
//                   </div>
//                   <p className="text-sm text-muted-foreground">
//                     {product.stock > 5
//                       ? "In Stock"
//                       : product.stock > 0
//                       ? `Only ${product.stock} left in stock`
//                       : "Out of Stock"}
//                   </p>
//                 </div>

//                 {/* Product Badges */}
//                 <div className="flex flex-wrap gap-2">
//                   {product.stock <= 5 && product.stock > 0 && (
//                     <StockBadge stock={product.stock} />
//                   )}
//                   {product.state === "sealed" && <SealedBadge />}
//                   {product.state === "open" && product.grading && (
//                     <GradingBadge
//                       company={product.grading.company}
//                       grade={product.grading.grade}
//                     />
//                   )}
//                   {product.state === "open" &&
//                     !product.grading &&
//                     product.condition && (
//                       <ConditionBadge condition={product.condition} />
//                     )}
//                   {product.rarity && (
//                     <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
//                       {product.rarity}
//                     </span>
//                   )}
//                 </div>

//                 {/* Tags */}
//                 {product.tags.length > 0 && (
//                   <div className="flex flex-wrap gap-2">
//                     {product.tags.map((tag: any, index: number) => (
//                       <span
//                         key={index}
//                         className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
//                       >
//                         #{tag}
//                       </span>
//                     ))}
//                   </div>
//                 )}

//                 {/* Quantity and Add to Cart */}
//                 <div className="space-y-4">
//                   <div className="flex items-center space-x-4">
//                     <span className="text-sm font-medium">Quantity:</span>
//                     <div className="flex items-center border rounded-lg">
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => setQuantity(Math.max(1, quantity - 1))}
//                         disabled={quantity <= 1}
//                       >
//                         <Minus className="h-4 w-4" />
//                       </Button>
//                       <span className="px-4 py-2 text-center min-w-[50px]">
//                         {quantity}
//                       </span>
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         onClick={() =>
//                           setQuantity(Math.min(product.stock, quantity + 1))
//                         }
//                         disabled={quantity >= product.stock}
//                       >
//                         <Plus className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </div>

//                   {/* Action Buttons */}
//                   <div className="flex flex-wrap gap-3">
//                     <Button
//                       size="lg"
//                       className="min-w-[140px]"
//                       disabled={!product.inStock || product.stock === 0}
//                     >
//                       <ShoppingCart className="h-4 w-4 mr-2" />
//                       Add to Cart
//                     </Button>
//                     <Button
//                       size="lg"
//                       variant="outline"
//                       className="min-w-[120px]"
//                       disabled={!product.inStock || product.stock === 0}
//                       onClick={() => byNowHandler()}
//                     >
//                       <Zap className="h-4 w-4 mr-2" />
//                       Buy Now
//                     </Button>
//                     <Button
//                       variant="outline"
//                       size="lg"
//                       onClick={() => saveTowishList()}
//                     >
//                       <Heart className="h-4 w-4" />
//                     </Button>
//                     {/* TODO: shere button */}
//                     {/* <Button variant="outline" size="lg">
//                       <Share2 className="h-4 w-4" />
//                     </Button> */}
//                   </div>
//                 </div>

//                 {/* Shipping Info */}
//                 {product.shipping && (
//                   <div className="border rounded-lg p-4 bg-muted/20">
//                     <h3 className="font-medium mb-2">Shipping Information</h3>
//                     <div className="space-y-1 text-sm text-muted-foreground">
//                       {product.shipping.shippingCost !== undefined && (
//                         <p>Shipping Cost: ${product.shipping.shippingCost}</p>
//                       )}
//                       {product.shipping.weight && (
//                         <p>Weight: {product.shipping.weight} lbs</p>
//                       )}
//                       {product.shipping.dimensions && (
//                         <p>Dimensions: {product.shipping.dimensions}</p>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//         {/* Product specifications */}
//         <div className="border-t pt-6">
//           {product.specifications &&
//             Object.keys(product.specifications).length > 0 && (
//               <div>
//                 <h3 className={cn(designTokens.typography.h4, "mb-3")}>
//                   Specifications
//                 </h3>
//                 <div className="space-y-2">
//                   {Object.entries(product.specifications).map(
//                     ([key, value]) => (
//                       <div
//                         key={key}
//                         className="flex justify-between py-2 border-b border-gray-200 last:border-b-0"
//                       >
//                         <span className="font-medium">{key}:</span>
//                         <span className="text-muted-foreground">
//                           {String(value)}
//                         </span>
//                       </div>
//                     )
//                   )}
//                 </div>
//               </div>
//             )}
//         </div>
//         <br />

//         {product?.StorePolicies ? (
//           <div>
//             <h1 className="text-xl font-semibold">Description</h1>
//             <VendorTruncateDetails
//               description={product?.description}
//               truncateLength={300}
//             />
//             <br />
//           </div>
//         ) : null}

//         {product?.StorePolicies ? (
//           <div>
//             <h1 className="text-xl font-semibold">Shipping Policy</h1>
//             <VendorTruncateDetails
//               description={product?.StorePolicies?.shippingPolicy}
//               truncateLength={250}
//             />
//             <br />
//             <h1 className="text-xl font-semibold">Return Policy</h1>
//             <VendorTruncateDetails
//               description={product?.StorePolicies?.returnPolicy}
//               truncateLength={250}
//             />
//           </div>
//         ) : null}
//         {/* TODO: products ratings code hide for now */}
//         {/* <ReviewAndRatingsProduct idtype={idtype} /> */}
//       </section>
//     </PageLayout>
//   );
// };

// export default ProductDetailsPage;
