"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, ShoppingCart, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Animation variants for product cards
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

// Static sample data for supplies (prices in PHP)
const suppliesData = [
  {
    id: "1",
    name: "Hammer",
    category: "Tools",
    price: 900,
    description: "Heavy-duty claw hammer for construction and carpentry.",
    image: "/images/hammer.jpg",
  },
  {
    id: "2",
    name: "Portland Cement",
    category: "Materials",
    price: 480,
    description: "High-quality cement for concrete and masonry work.",
    image: "/images/cement.jpg",
  },
  {
    id: "3",
    name: "Cordless Drill",
    category: "Equipment",
    price: 5500,
    description: "18V cordless drill with variable speed and LED light.",
    image: "/images/drill.jpg",
  },
  {
    id: "4",
    name: "Steel Rebar",
    category: "Materials",
    price: 700,
    description: "Grade 60 rebar for reinforcing concrete structures.",
    image: "/images/rebar.jpg",
  },
  {
    id: "5",
    name: "Circular Saw",
    category: "Tools",
    price: 3800,
    description: "7-1/4 inch circular saw for precise wood cutting.",
    image: "/images/saw.jpg",
  },
  {
    id: "6",
    name: "Safety Helmet",
    category: "Safety",
    price: 1500,
    description: "Durable hard hat for construction site safety.",
    image: "/images/helmet.jpg",
  },
];

// Categories for filtering
const categories = ["All", "Tools", "Materials", "Equipment", "Safety"];

export default function SuppliesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Filter supplies based on search and category
  const filteredSupplies = suppliesData.filter((supply) => {
    const matchesSearch = supply.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || supply.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (supply: {
    id: string;
    name: string;
    price: number;
  }) => {
    console.log(`Added to cart: ${supply.name} (ID: ${supply.id})`);
    // Placeholder for future cart integration
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-100 pt-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Hardware & Construction Supplies
          </h1>
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 h-5 w-5 text-gray-400 transform -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search supplies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-gray-300 focus:border-primary focus:ring-primary"
              />
            </div>
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-40 bg-white border-gray-300">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Supplies Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-1">
          {filteredSupplies.length === 0 ? (
            <p className="text-center text-gray-600 col-span-full">
              No supplies found.
            </p>
          ) : (
            filteredSupplies.map((supply, index) => (
              <motion.div
                key={supply.id}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 max-w-[250px] mx-auto rounded-none">
                  <CardHeader className="p-1.5">
                    {/* Smaller Image */}
                    <div className="h-28 w-full bg-gray-200 flex items-center justify-center">
                      <img
                        src={supply.image}
                        alt={supply.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://via.placeholder.com/250x112?text=No+Image";
                        }}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-2">
                    <CardTitle className="text-md font-semibold text-gray-900 line-clamp-1">
                      {supply.name}
                    </CardTitle>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {supply.description}
                    </p>
                    <p className="text-primary font-bold text-sm mt-2">
                      ₱{supply.price.toFixed(2)}
                    </p>
                  </CardContent>
                  <CardFooter className="p-2 pt-0">
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-sm py-1"
                      onClick={() => handleAddToCart(supply)}
                    >
                      Add to Cart
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Floating Cart Button */}
        <motion.div
          className="fixed bottom-6 right-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Link href="/cart">
            <Button
              className="rounded-full bg-primary hover:bg-primary/90 p-4 shadow-lg"
              aria-label="Go to cart"
            >
              <ShoppingCart className="h-6 w-6" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
