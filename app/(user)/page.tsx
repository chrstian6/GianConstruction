"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

// Dynamically import Spline with SSR disabled
const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
});

// Animation variants for scroll reveal
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function Home() {
  const [isSplineLoaded, setIsSplineLoaded] = useState(false);
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col ">
        {/* Skeleton for Hero Section */}
        <section className="relative bg-gradient-to-r from-gray-50 to-gray-100 py-20 md:py-32">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-12 md:mb-0">
              <div className="h-12 w-3/4 bg-gray-200 animate-pulse rounded mb-6"></div>
              <div className="h-6 w-full bg-gray-200 animate-pulse rounded mb-4"></div>
              <div className="h-6 w-5/6 bg-gray-200 animate-pulse rounded mb-8"></div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
                <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-lg aspect-square bg-gray-200 animate-pulse rounded-xl"></div>
            </div>
          </div>
        </section>

        {/* Skeleton for Services Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="h-8 w-1/4 mx-auto bg-gray-200 animate-pulse rounded mb-4"></div>
              <div className="h-6 w-1/2 mx-auto bg-gray-200 animate-pulse rounded"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="bg-gray-50 p-8 rounded-xl">
                  <div className="w-12 h-12 bg-gray-200 animate-pulse rounded-full mb-6"></div>
                  <div className="h-6 w-3/4 bg-gray-200 animate-pulse rounded mb-3"></div>
                  <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Skeleton for About Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2">
                <div className="relative w-full h-96 bg-gray-200 animate-pulse rounded-xl"></div>
              </div>
              <div className="md:w-1/2">
                <div className="h-8 w-1/2 bg-gray-200 animate-pulse rounded mb-6"></div>
                <div className="h-4 w-full bg-gray-200 animate-pulse rounded mb-4"></div>
                <div className="h-4 w-5/6 bg-gray-200 animate-pulse rounded mb-6"></div>
                {[1, 2, 3].map((_, index) => (
                  <div key={index} className="flex items-start mb-4">
                    <div className="h-5 w-5 bg-gray-200 animate-pulse rounded mr-3"></div>
                    <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Skeleton for CTA Section */}
        <section className="py-20 bg-primary/5">
          <div className="container mx-auto px-4 text-center">
            <div className="h-8 w-1/3 mx-auto bg-gray-200 animate-pulse rounded mb-6"></div>
            <div className="h-6 w-2/3 mx-auto bg-gray-200 animate-pulse rounded mb-8"></div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <div className="h-10 w-3/4 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-10 w-1/4 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
        </section>

        {/* Skeleton for Footer */}
        <footer className="bg-gray-900 py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="h-10 w-32 bg-gray-200 animate-pulse rounded mb-4"></div>
                <div className="h-4 w-full bg-gray-200 animate-pulse rounded mb-2"></div>
                <div className="h-4 w-5/6 bg-gray-200 animate-pulse rounded"></div>
              </div>
              {[1, 2, 3].map((_, index) => (
                <div key={index}>
                  <div className="h-6 w-1/2 bg-gray-200 animate-pulse rounded mb-4"></div>
                  {[1, 2, 3, 4].map((_, i) => (
                    <div
                      key={i}
                      className="h-4 w-3/4 bg-gray-200 animate-pulse rounded mb-2"
                    ></div>
                  ))}
                </div>
              ))}
            </div>
            <div className="border-t border-gray-800 mt-12 pt-8 text-center">
              <div className="h-4 w-1/3 mx-auto bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col ">
      {/* Hero Section with Spline */}
      <motion.section
        className="relative bg-gradient-to-r from-gray-50 to-gray-100 py-20 md:py-32 overflow-hidden"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="relative z-10 container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-12 md:mb-0">
            <motion.h1
              className="text-4xl md:text-5xl font-bold leading-tight mb-6 text-gray-900"
              variants={cardVariants}
            >
              Building Your Dream <span className="text-primary">Space</span>
            </motion.h1>
            <motion.p
              className="text-lg text-gray-600 mb-8 max-w-lg"
              variants={cardVariants}
            >
              Gian Construction delivers exceptional quality and craftsmanship
              for residential and commercial projects. Our team brings your
              vision to life.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              variants={cardVariants}
            >
              <Button size="lg" className="w-full sm:w-auto bg-primary">
                Get a Free Quote
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-primary text-primary hover:bg-primary hover:text-white"
              >
                View Projects
              </Button>
            </motion.div>
          </div>
          <motion.div
            className="md:w-1/2 flex justify-center"
            variants={cardVariants}
          >
            <div className="relative w-full max-w-lg aspect-square rounded-xl overflow-hidden shadow-xl">
              <Spline
                scene="https://prod.spline.design/t5aa2zpnaCaHsdDi/scene.splinecode"
                className="w-full h-full"
                onLoad={() => setIsSplineLoaded(true)}
              />
              {!isSplineLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-white opacity-80">
                  Loading...
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Services Section */}
      <motion.section
        id="services"
        className="py-20 bg-white"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              className="text-3xl font-bold mb-4 text-gray-900"
              variants={cardVariants}
            >
              Our Services
            </motion.h2>
            <motion.p
              className="text-gray-600 max-w-2xl mx-auto"
              variants={cardVariants}
            >
              Comprehensive construction solutions tailored to your needs
            </motion.p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Residential Construction",
                description:
                  "Custom homes, renovations, and additions designed to your specifications.",
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                ),
              },
              {
                title: "Commercial Projects",
                description:
                  "Office buildings, retail spaces, and commercial renovations.",
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                    <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                    <line x1="6" y1="6" x2="6.01" y2="6" />
                    <line x1="6" y1="18" x2="6.01" y2="18" />
                  </svg>
                ),
              },
              {
                title: "Design & Planning",
                description:
                  "Architectural design and project planning services.",
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                ),
              },
            ].map((service, index) => (
              <motion.div
                key={index}
                className="bg-gray-50 p-8 rounded-xl hover:shadow-md transition-shadow"
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  {service.title}
                </h3>
                <p className="text-gray-600">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* About Section */}
      <motion.section
        id="about"
        className="py-20 bg-gray-50"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <motion.div className="md:w-1/2" variants={cardVariants}>
              <div className="relative w-full h-96 rounded-xl overflow-hidden shadow-lg">
                <Image
                  src="/images/about-us.jpg"
                  alt="Our Team"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>
            <motion.div className="md:w-1/2" variants={cardVariants}>
              <h2 className="text-3xl font-bold mb-6 text-gray-900">
                About Gian Construction
              </h2>
              <p className="text-gray-600 mb-4">
                Founded in 2010, Gian Construction has been a trusted name in
                the construction industry, delivering high-quality projects with
                a commitment to excellence and customer satisfaction.
              </p>
              <p className="text-gray-600 mb-6">
                Our team of skilled professionals brings decades of combined
                experience to every project, ensuring that we meet the highest
                standards of quality and safety.
              </p>
              <div className="space-y-4">
                {[
                  {
                    highlight: "15+ Years",
                    text: "of industry experience",
                  },
                  {
                    highlight: "100+ Projects",
                    text: "completed successfully",
                  },
                  {
                    highlight: "Certified Professionals",
                    text: "on our team",
                  },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start"
                    variants={cardVariants}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex-shrink-0 mt-1">
                      <svg
                        className="h-5 w-5 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <p className="ml-3 text-gray-600">
                      <span className="font-medium text-gray-900">
                        {item.highlight}
                      </span>{" "}
                      {item.text}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="py-20 bg-primary/5"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.h2
            className="text-3xl font-bold mb-6 text-gray-900"
            variants={cardVariants}
          >
            Ready to Start Your Project?
          </motion.h2>
          <motion.p
            className="text-gray-600 mb-8 max-w-2xl mx-auto"
            variants={cardVariants}
          >
            Contact us today for a free consultation and estimate. Our team is
            ready to bring your construction vision to life.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto"
            variants={cardVariants}
          >
            <Input
              type="email"
              placeholder="Enter your email"
              className="bg-white"
            />
            <Button className="whitespace-nowrap bg-primary">
              Get Started
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        className="bg-gray-900 text-white py-12"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <motion.div variants={cardVariants}>
              <Image
                src="/logo-white.png"
                alt="Gian Construction"
                width={140}
                height={50}
                className="h-10 w-auto mb-4"
              />
              <p className="text-gray-400">
                Building excellence since 2010. Quality construction services
                for residential and commercial clients.
              </p>
            </motion.div>
            <motion.div variants={cardVariants}>
              <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {[
                  { href: "/", label: "Home" },
                  { href: "/#about", label: "About Us" },
                  { href: "/#services", label: "Services" },
                  { href: "/projects", label: "Projects" },
                ].map((link, index) => (
                  <motion.li
                    key={index}
                    variants={cardVariants}
                    transition={{ delay: index * 0.1 }}
                  >
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            <motion.div variants={cardVariants}>
              <h4 className="font-semibold text-lg mb-4">Services</h4>
              <ul className="space-y-2">
                {[
                  {
                    href: "/services/residential",
                    label: "Residential Construction",
                  },
                  {
                    href: "/services/commercial",
                    label: "Commercial Construction",
                  },
                  { href: "/services/renovations", label: "Renovations" },
                  { href: "/services/design", label: "Design Services" },
                ].map((link, index) => (
                  <motion.li
                    key={index}
                    variants={cardVariants}
                    transition={{ delay: index * 0.1 }}
                  >
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            <motion.div variants={cardVariants}>
              <h4 className="font-semibold text-lg mb-4">Contact Us</h4>
              <address className="not-italic text-gray-400">
                <p className="mb-2">Sola St. Barangay 2</p>
                <p className="mb-2">Kabankalan City Negros Occidental 6111</p>
                <p className="mb-2">Phone: (+63) 945-963-3742</p>
                <p className="mb-2">Email: info@gianconstruction.com</p>
              </address>
            </motion.div>
          </div>
          <motion.div
            className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500"
            variants={cardVariants}
          >
            <p>
              © {new Date().getFullYear()} Gian Construction. All rights
              reserved.
            </p>
          </motion.div>
        </div>
      </motion.footer>
    </div>
  );
}
