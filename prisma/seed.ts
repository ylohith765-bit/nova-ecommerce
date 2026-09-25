import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting NOVA database seed...");

  // 1. Seed Users (Admin & Customer)
  const passwordHash = await bcrypt.hash("Admin123!", 10);
  const customerPasswordHash = await bcrypt.hash("Customer123!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@novastore.com" },
    update: {},
    create: {
      name: "NOVA Admin",
      email: "admin@novastore.com",
      passwordHash: passwordHash,
      role: Role.ADMIN,
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "alex.rivers@novastore.com" },
    update: {},
    create: {
      name: "Alex Rivers",
      email: "alex.rivers@novastore.com",
      passwordHash: customerPasswordHash,
      role: Role.USER,
      image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80",
    },
  });

  console.log(`👤 Users seeded: ${admin.email} (Admin), ${customer.email} (Customer)`);

  // 2. Seed Default Shipping Address for Customer
  await prisma.address.upsert({
    where: { id: "default-customer-address" },
    update: {},
    create: {
      id: "default-customer-address",
      userId: customer.id,
      fullName: "Alex Rivers",
      phone: "+1 (555) 234-5678",
      street: "742 Evergreen Terrace",
      city: "San Francisco",
      state: "CA",
      postalCode: "94107",
      country: "United States",
      isDefault: true,
    },
  });

  // 3. Seed Categories (5 distinct categories)
  const categoriesData = [
    {
      name: "Audio & Headphones",
      slug: "audio-headphones",
      description: "High-fidelity spatial audio, active noise-canceling headphones, and wireless earbuds.",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Computing & Peripherals",
      slug: "computing-peripherals",
      description: "Precision mechanical keyboards, ergonomic pointers, and premium laptop accessories.",
      image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Wearables & Smartwatches",
      slug: "wearables-smartwatches",
      description: "Next-generation biometric trackers, titanium smartwatches, and fitness rings.",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Minimalist Workspace",
      slug: "minimalist-workspace",
      description: "Solid walnut monitor risers, desk pads, inductive charging hubs, and task lighting.",
      image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Bags & Everyday Carry",
      slug: "bags-carry",
      description: "Weatherproof rolltop packs, technical sling bags, and anodized cardholders.",
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    },
  ];

  const categories = [];
  for (const cat of categoriesData) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        image: cat.image,
      },
      create: cat,
    });
    categories.push(category);
  }

  console.log(`📁 Categories seeded: ${categories.length}`);

  const [audio, computing, wearables, workspace, bags] = categories;

  // 4. Seed Products (24 realistic products with high-res Unsplash commercial imagery)
  const productsData = [
    // Category 1: Audio & Headphones
    {
      name: "NOVA ANC Acoustic Studio Pro",
      slug: "nova-anc-acoustic-studio-pro",
      description: "Over-ear noise-cancelling headphones featuring 45mm custom beryllium drivers, spatial audio tracking, and 40-hour ultra battery life.",
      price: 349.0,
      compareAtPrice: 399.0,
      stock: 45,
      images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80",
      ],
      isFeatured: true,
      categoryId: audio.id,
    },
    {
      name: "Aura Pods True Wireless",
      slug: "aura-pods-true-wireless",
      description: "Ultralight titanium acoustic earbuds with dual hybrid active noise cancellation, transparency mode, and IPX7 water resistance.",
      price: 189.0,
      compareAtPrice: 220.0,
      stock: 60,
      images: [
        "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
      ],
      isFeatured: false,
      categoryId: audio.id,
    },
    {
      name: "Pulse Desktop Hi-Fi Reference Monitors",
      slug: "pulse-desktop-hi-fi-monitors",
      description: "Pair of active studio bookshelf monitors with woven carbon fiber woofers, silk dome tweeters, and lossless Bluetooth 5.3 streaming.",
      price: 499.0,
      compareAtPrice: null,
      stock: 18,
      images: [
        "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80",
      ],
      isFeatured: true,
      categoryId: audio.id,
    },
    {
      name: "Omni Portable Waterproof Speaker",
      slug: "omni-portable-waterproof-speaker",
      description: "360-degree cylindrical outdoor speaker with punchy sub-bass, 24-hour playback, and rugged IP68 submersible housing.",
      price: 129.0,
      compareAtPrice: 149.0,
      stock: 75,
      images: [
        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80",
      ],
      isFeatured: false,
      categoryId: audio.id,
    },
    {
      name: "Clarity Pro USB-C Condenser Mic",
      slug: "clarity-pro-usb-c-mic",
      description: "Broadcast-grade cardioid studio microphone with built-in pop filter, zero-latency monitoring, and tap-to-mute capacitance.",
      price: 159.0,
      compareAtPrice: 179.0,
      stock: 30,
      images: [
        "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80",
      ],
      isFeatured: false,
      categoryId: audio.id,
    },

    // Category 2: Computing & Peripherals
    {
      name: "Keyflow 75% Wireless Mechanical Keyboard",
      slug: "keyflow-75-mechanical-keyboard",
      description: "Hot-swappable CNC aluminum chassis, pre-lubed silent linear switches, PBT dye-sub keycaps, and triple-mode wireless connectivity.",
      price: 219.0,
      compareAtPrice: 249.0,
      stock: 25,
      images: [
        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
      ],
      isFeatured: true,
      categoryId: computing.id,
    },
    {
      name: "Glide Precision Ergonomic Wireless Mouse",
      slug: "glide-precision-ergonomic-mouse",
      description: "Ergonomic thumb-rest optical mouse with dual scroll wheels, silent tactile switches, and high-precision 26,000 DPI sensor.",
      price: 99.0,
      compareAtPrice: 119.0,
      stock: 80,
      images: [
        "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80",
      ],
      isFeatured: false,
      categoryId: computing.id,
    },
    {
      name: "Horizon 10-in-1 Thunderbolt 4 Dock",
      slug: "horizon-10-in-1-thunderbolt-dock",
      description: "Aircraft-grade anodized aluminum docking station delivering 96W Power Delivery, dual 4K @ 144Hz support, and 2.5G Ethernet.",
      price: 289.0,
      compareAtPrice: null,
      stock: 35,
      images: [
        "https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&w=800&q=80",
      ],
      isFeatured: false,
      categoryId: computing.id,
    },
    {
      name: "Apex 4K UHD Ultra-Clear Webcam",
      slug: "apex-4k-uhd-webcam",
      description: "Sony Starvis 4K sensor with AI auto-framing, HDR low-light compensation, dual beamforming mics, and physical privacy shutter.",
      price: 179.0,
      compareAtPrice: 199.0,
      stock: 40,
      images: [
        "https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=800&q=80",
      ],
      isFeatured: false,
      categoryId: computing.id,
    },
    {
      name: "Stealth Glass Gaming Mousepad",
      slug: "stealth-glass-gaming-mousepad",
      description: "Tempered micro-etched glass surface engineered for frictionless speed, precision tracking, and non-slip silicone base.",
      price: 69.0,
      compareAtPrice: null,
      stock: 50,
      images: [
        "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80",
      ],
      isFeatured: false,
      categoryId: computing.id,
    },

    // Category 3: Wearables & Smartwatches
    {
      name: "Chronos Titanium Smartwatch",
      slug: "chronos-titanium-smartwatch",
      description: "Sapphire crystal display encased in grade-5 aerospace titanium, offering continuous ECG, dual-frequency GPS, and 14-day endurance.",
      price: 499.0,
      compareAtPrice: 549.0,
      stock: 22,
      images: [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
      ],
      isFeatured: true,
      categoryId: wearables.id,
    },
    {
      name: "Apex Halo Smart Fitness Ring",
      slug: "apex-halo-smart-fitness-ring",
      description: "Ultra-thin ceramic smart ring measuring nocturnal HRV, body temperature flux, sleep cycles, and daily recovery scores.",
      price: 299.0,
      compareAtPrice: null,
      stock: 30,
      images: [
        "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
      ],
      isFeatured: true,
      categoryId: wearables.id,
    },
    {
      name: "Vanguard Sport GPS Tracker",
      slug: "vanguard-sport-gps-tracker",
      description: "Lightweight fiber-reinforced composite running watch with sunlight-readable MIP display and offline topographic breadcrumb maps.",
      price: 249.0,
      compareAtPrice: 279.0,
      stock: 45,
      images: [
        "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80",
      ],
      isFeatured: false,
      categoryId: wearables.id,
    },
    {
      name: "Milano Leather Smartwatch Strap",
      slug: "milano-leather-smartwatch-strap",
      description: "Handcrafted full-grain Italian calfskin strap with brushed stainless steel deployant clasp for standard 20mm and 22mm lugs.",
      price: 59.0,
      compareAtPrice: 75.0,
      stock: 90,
      images: [
        "https://images.unsplash.com/photo-1617043786394-f977fa12eddf?auto=format&fit=crop&w=800&q=80",
      ],
      isFeatured: false,
      categoryId: wearables.id,
    },

    // Category 4: Minimalist Workspace
    {
      name: "Nordic Solid Walnut Monitor Riser",
      slug: "nordic-solid-walnut-monitor-riser",
      description: "Crafted from sustainably sourced American black walnut with integrated cork-lined tray for laptop storage and cable routing.",
      price: 139.0,
      compareAtPrice: 169.0,
      stock: 28,
      images: [
        "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80",
      ],
      isFeatured: true,
      categoryId: workspace.id,
    },
    {
      name: "Volt 3-in-1 MagSafe Inductive Stand",
      slug: "volt-3-in-1-magsafe-inductive-stand",
      description: "Solid zinc and weighted base simultaneously fast-charging iPhone (15W), Apple Watch, and wireless earbuds in a compact footprint.",
      price: 119.0,
      compareAtPrice: null,
      stock: 65,
      images: [
        "https://images.unsplash.com/photo-1622445262464-84b14e0745b1?auto=format&fit=crop&w=800&q=80",
      ],
      isFeatured: false,
      categoryId: workspace.id,
    },
    {
      name: "Merino Wool Felt Desk Pad (Extra Large)",
      slug: "merino-wool-felt-desk-pad-xl",
      description: "Heavyweight 100% genuine merino wool felt providing acoustic dampening, tactile warmth, and anti-slip natural rubber backing.",
      price: 79.0,
      compareAtPrice: 95.0,
      stock: 85,
      images: [
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
      ],
      isFeatured: false,
      categoryId: workspace.id,
    },
    {
      name: "Lumina ScreenBar Eye-Care Light",
      slug: "lumina-screenbar-eye-care-light",
      description: "Asymmetric optical monitor lamp with touch-controlled color temperature, ambient auto-dimming sensor, and zero screen glare.",
      price: 109.0,
      compareAtPrice: 129.0,
      stock: 42,
      images: [
        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
      ],
      isFeatured: false,
      categoryId: workspace.id,
    },
    {
      name: "Axis Vertical Laptop Dock",
      slug: "axis-vertical-laptop-dock",
      description: "Precision CNC milled aluminum vertical cradle with adjustable silicone grips to maximize valuable desktop surface area.",
      price: 49.0,
      compareAtPrice: null,
      stock: 110,
      images: [
        "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
      ],
      isFeatured: false,
      categoryId: workspace.id,
    },

    // Category 5: Bags & Everyday Carry
    {
      name: "Aero Technical 24L Rolltop Backpack",
      slug: "aero-technical-24l-rolltop-pack",
      description: "X-Pac waterproof sailcloth backpack with dedicated padded 16-inch laptop compartment, magnetic Fidlock buckles, and ergonomic harness.",
      price: 229.0,
      compareAtPrice: 260.0,
      stock: 32,
      images: [
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
      ],
      isFeatured: true,
      categoryId: bags.id,
    },
    {
      name: "Rover Weatherproof Crossbody Sling 4L",
      slug: "rover-weatherproof-crossbody-sling",
      description: "Compact EDC sling engineered from recycled Cordura nylon, YKK Aquaguard zippers, and modular internal organization pockets.",
      price: 89.0,
      compareAtPrice: 105.0,
      stock: 55,
      images: [
        "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
      ],
      isFeatured: false,
      categoryId: bags.id,
    },
    {
      name: "Armour Minimalist RFID Billet Cardholder",
      slug: "armour-minimalist-rfid-cardholder",
      description: "Aircraft aluminum card ejector wallet with integrated silicone cash strap and RFID protection blocking unauthorized wireless scans.",
      price: 65.0,
      compareAtPrice: null,
      stock: 120,
      images: [
        "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80",
      ],
      isFeatured: false,
      categoryId: bags.id,
    },
    {
      name: "Voyager Tech Folio Organizer",
      slug: "voyager-tech-folio-organizer",
      description: "Water-resistant padded portfolio designed to organize charging cables, power banks, SSDs, styluses, and compact tablets on the move.",
      price: 75.0,
      compareAtPrice: 89.0,
      stock: 64,
      images: [
        "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
      ],
      isFeatured: false,
      categoryId: bags.id,
    },
    {
      name: "HydroInsulated Thermal Flask 750ml",
      slug: "hydro-insulated-thermal-flask-750ml",
      description: "Double-wall vacuum insulated 18/8 food-grade stainless steel bottle keeping beverages ice-cold for 24h or steaming hot for 12h.",
      price: 42.0,
      compareAtPrice: 48.0,
      stock: 95,
      images: [
        "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80",
      ],
      isFeatured: false,
      categoryId: bags.id,
    },
  ];

  for (const item of productsData) {
    await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        description: item.description,
        price: item.price,
        compareAtPrice: item.compareAtPrice,
        stock: item.stock,
        images: item.images,
        isFeatured: item.isFeatured,
        categoryId: item.categoryId,
      },
      create: item,
    });
  }

  console.log(`🛍️ Products seeded: ${productsData.length}`);
  console.log("✅ NOVA database seed completed successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
