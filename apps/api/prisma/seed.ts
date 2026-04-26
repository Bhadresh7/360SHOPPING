import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  {
    sku: "LUX-DR-001",
    name: "Linen Summer Dress",
    division: "LUXE",
    category: "Dresses",
    description: "Breathable luxe linen dress with eco-certified dye.",
    pricePaise: 699900,
    originalPaise: 899900,
    ecoScore: 5,
    rating: 4.7,
    reviewCount: 142,
    stock: 12,
    isNew: true,
    isSale: true,
    isLimited: false,
    fabric: "Linen + Organic Cotton",
    imageEmoji: "👗",
    colors: ["#B08A5B", "#6F8C72", "#D9CBB6"],
    sizes: ["S", "M", "L", "XL"],
    tags: ["Eco", "New", "Summer"]
  },
  {
    sku: "LUX-SA-002",
    name: "Heritage Silk Saree",
    division: "LUXE",
    category: "Sarees",
    description: "Hand-finished saree with artisanal border.",
    pricePaise: 1499900,
    originalPaise: null,
    ecoScore: 4,
    rating: 4.8,
    reviewCount: 88,
    stock: 8,
    isNew: false,
    isSale: false,
    isLimited: true,
    fabric: "Pure Silk",
    imageEmoji: "🥻",
    colors: ["#6E273D", "#D5A24D", "#1D3B52"],
    sizes: ["Free"],
    tags: ["Limited", "Wedding"]
  },
  {
    sku: "COR-KIT-003",
    name: "Premium Joining Kit",
    division: "CORPORATE",
    category: "Tech Accessories",
    description: "Curated onboarding kit with branding options.",
    pricePaise: 249900,
    originalPaise: null,
    ecoScore: 3,
    rating: 4.5,
    reviewCount: 51,
    stock: 300,
    isNew: true,
    isSale: false,
    isLimited: false,
    fabric: "Mixed",
    imageEmoji: "🎁",
    colors: ["#202020", "#F5F5F5", "#5AAEE0"],
    sizes: ["Standard"],
    tags: ["MOQ 50", "Corporate"]
  },
  {
    sku: "STU-PKG-004",
    name: "Platinum Portrait Package",
    division: "STUDIO",
    category: "Packages",
    description: "Studio package with makeup, styling, and digital album.",
    pricePaise: 2299900,
    originalPaise: null,
    ecoScore: 0,
    rating: 4.9,
    reviewCount: 37,
    stock: 40,
    isNew: false,
    isSale: false,
    isLimited: false,
    fabric: "Service",
    imageEmoji: "📸",
    colors: ["#C9A84C"],
    sizes: ["Standard"],
    tags: ["Studio", "Premium"]
  },
  {
    sku: "LUX-KU-005",
    name: "Bamboo Festive Kurta",
    division: "LUXE",
    category: "Kurtas",
    description: "Structured festive kurta with low-impact fabric blend.",
    pricePaise: 549900,
    originalPaise: 699900,
    ecoScore: 5,
    rating: 4.6,
    reviewCount: 64,
    stock: 30,
    isNew: true,
    isSale: true,
    isLimited: false,
    fabric: "Bamboo + Cotton",
    imageEmoji: "👘",
    colors: ["#324D43", "#D9C088"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    tags: ["Eco", "Festive"]
  },
  {
    sku: "COR-MUG-006",
    name: "Engraved Ceramic Mug",
    division: "CORPORATE",
    category: "Stationery",
    description: "Custom engraved team mug with fast turnaround.",
    pricePaise: 29900,
    originalPaise: null,
    ecoScore: 2,
    rating: 4.2,
    reviewCount: 29,
    stock: 1000,
    isNew: false,
    isSale: false,
    isLimited: false,
    fabric: "Ceramic",
    imageEmoji: "☕",
    colors: ["#FFFFFF", "#101010", "#5AAEE0"],
    sizes: ["300ml"],
    tags: ["MOQ 100"]
  }
];

async function main() {
  await prisma.rewardTransaction.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.studioBooking.deleteMany();
  await prisma.referral.deleteMany();
  await prisma.product.deleteMany();
  await prisma.album.deleteMany();
  await prisma.smartFrame.deleteMany();
  await prisma.talentModel.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Welcome@123", 10);

  const user = await prisma.user.create({
    data: {
      name: "Aadhya Mehta",
      email: "aadhya@360shopie.com",
      passwordHash,
      phone: "+91-9876543210",
      loyaltyPoints: 2840,
      referralCode: "AADHYA500"
    }
  });

  const seededProducts = await Promise.all(
    products.map((product) =>
      prisma.product.create({
        data: {
          ...product,
          colors: JSON.stringify(product.colors),
          sizes: JSON.stringify(product.sizes),
          tags: JSON.stringify(product.tags)
        }
      })
    )
  );

  const firstOrder = await prisma.order.create({
    data: {
      orderNo: "SH482123",
      userId: user.id,
      status: "IN_TRANSIT",
      paymentMethod: "UPI",
      totalPaise: 729800,
      items: {
        create: [
          {
            productId: seededProducts[0].id,
            quantity: 1,
            unitPaise: 699900,
            size: "M",
            color: "Earth"
          },
          {
            productId: seededProducts[5].id,
            quantity: 1,
            unitPaise: 29900,
            size: "300ml",
            color: "White"
          }
        ]
      }
    }
  });

  await prisma.order.create({
    data: {
      orderNo: "SH482099",
      userId: user.id,
      status: "DELIVERED",
      paymentMethod: "Card",
      totalPaise: 1499900,
      items: {
        create: [
          {
            productId: seededProducts[1].id,
            quantity: 1,
            unitPaise: 1499900,
            size: "Free",
            color: "Burgundy"
          }
        ]
      }
    }
  });

  await prisma.studioBooking.createMany({
    data: [
      {
        userId: user.id,
        sessionType: "Maternity Portrait",
        bookingDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
        duration: "2hr",
        amountPaise: 1599900,
        status: "CONFIRMED",
        addOns: JSON.stringify(["Makeup Artist", "Backdrop Gold"])
      },
      {
        userId: user.id,
        sessionType: "Corporate Headshots",
        bookingDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 8),
        duration: "Half-day",
        amountPaise: 2999900,
        status: "PENDING",
        addOns: JSON.stringify(["Hair Stylist"])
      }
    ]
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: user.id,
        type: "STUDIO",
        title: "Session Confirmed",
        description: "Your Maternity Portrait session is confirmed for Tuesday 11:00 AM.",
        actionRoute: "view-studio"
      },
      {
        userId: user.id,
        type: "FASHION",
        title: "Price Drop Alert",
        description: "Heritage Silk Saree is now available with a festive offer.",
        actionRoute: "view-shop"
      },
      {
        userId: user.id,
        type: "AI",
        title: "New AI Picks",
        description: "Three new AI style matches are waiting for your review.",
        actionRoute: "view-aistyle"
      }
    ]
  });

  await prisma.rewardTransaction.createMany({
    data: [
      {
        userId: user.id,
        title: "Order SH482123",
        points: 730,
        direction: "EARN"
      },
      {
        userId: user.id,
        title: "Referral Bonus",
        points: 500,
        direction: "EARN"
      },
      {
        userId: user.id,
        title: "Voucher Redemption",
        points: -300,
        direction: "REDEEM"
      }
    ]
  });

  await prisma.referral.createMany({
    data: [
      {
        referrerId: user.id,
        referredEmail: "team.hr@stellary.io",
        status: "SIGNED_UP",
        rewardPaise: 50000
      },
      {
        referrerId: user.id,
        referredEmail: "ops@finleaf.in",
        status: "SENT",
        rewardPaise: 0
      }
    ]
  });

  await prisma.cartItem.create({
    data: {
      userId: user.id,
      productId: seededProducts[4].id,
      quantity: 1,
      size: "M",
      color: "Olive"
    }
  });

  await prisma.wishlistItem.createMany({
    data: [
      {
        userId: user.id,
        productId: seededProducts[1].id,
        listName: "Wedding Season"
      },
      {
        userId: user.id,
        productId: seededProducts[0].id,
        listName: "Work Wardrobe"
      }
    ]
  });

  await prisma.album.createMany({
    data: [
      { userId: user.id, name: "Maternity Gold", count: 240, size: "1.2GB", ai: true, date: new Date("2026-03-18") },
      { userId: user.id, name: "Family Portraits", count: 160, size: "860MB", ai: false, date: new Date("2026-02-02") },
      { userId: user.id, name: "Corporate Headshots", count: 312, size: "2.4GB", ai: true, date: new Date("2026-01-19") }
    ]
  });

  await prisma.smartFrame.createMany({
    data: [
      { userId: user.id, name: "Living Room", location: "Home", status: "Online", slide: "Family Album" },
      { userId: user.id, name: "Studio Screen", location: "Studio", status: "Sleeping", slide: "Campaign Picks" },
      { userId: user.id, name: "Office Panel", location: "Office", status: "Offline", slide: "Corporate Loop" }
    ]
  });

  await prisma.talentModel.createMany({
    data: [
      { name: "Ava Rao", age: 24, height: "5'8", tags: JSON.stringify(["Editorial", "Commercial"]), status: "Available", ratePaise: 450000, score: 87, gender: "Women" },
      { name: "Nikhil Dev", age: 28, height: "6'1", tags: JSON.stringify(["Runway", "Corporate"]), status: "On Request", ratePaise: 520000, score: 82, gender: "Men" },
      { name: "Mira Shah", age: 22, height: "5'6", tags: JSON.stringify(["Cultural", "Lifestyle"]), status: "Booked", ratePaise: 390000, score: 91, gender: "Women" }
    ]
  });

  console.log(`Seed complete. Demo user: ${user.email}, order: ${firstOrder.orderNo}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });