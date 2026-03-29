export type MaterialsToolsCategoryId =
  | 'natural-pigments-dyes'
  | 'fibers-textile-materials'
  | 'hides-feathers-quills'
  | 'woods-carving-materials'
  | 'beads-findings'
  | 'clays-ceramic-materials'
  | 'canvas-paper-surfaces'
  | 'carving-woodworking-tools'
  | 'jewelry-metalsmithing-tools'
  | 'pottery-ceramics-tools'
  | 'textile-weaving-tools'
  | 'painting-drawing-supplies'
  | 'printmaking-tools'
  | 'digital-equipment'
  | 'studio-furniture-storage'
  | 'packaging-shipping-supplies';

export type MaterialsToolsKind = 'material' | 'tool' | 'equipment' | 'bulk-supply';
export type VerificationTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export type MaterialProduct = {
  id: string;
  title: string;
  supplierId: string;
  supplierName: string;
  nation: string;
  category: MaterialsToolsCategoryId;
  kind: MaterialsToolsKind;
  price: number;
  currency: 'USD';
  image: string;
  stockLabel: string;
  leadTime: string;
  verified: boolean;
  verificationTier: VerificationTier;
  summary: string;
  traceability: {
    originRegion: string;
    harvestDate: string;
    method: string;
    qrLabel: string;
  };
  certifications: string[];
  moqLabel?: string;
};

export type Supplier = {
  id: string;
  name: string;
  nation: string;
  region: string;
  verified: boolean;
  verificationTier: VerificationTier;
  avatar: string;
  cover: string;
  specialties: string[];
  bio: string;
  responseTime: string;
  fulfillmentScore: number;
};

export type ToolRental = {
  id: string;
  title: string;
  hubName: string;
  nation: string;
  location: string;
  dailyRateLabel: string;
  image: string;
  summary: string;
  availability: string;
  equipmentType: string;
};

export type SupplyService = {
  id: string;
  title: string;
  provider: string;
  nation: string;
  rateLabel: string;
  image: string;
  summary: string;
  serviceType: 'repair' | 'sourcing' | 'co-op' | 'surplus';
};

export type CoopOrder = {
  id: string;
  title: string;
  summary: string;
  targetUnits: number;
  committedUnits: number;
  closeDate: string;
  image: string;
  preferredCategory: MaterialsToolsCategoryId;
};

export type MaterialsToolsOrder = {
  id: string;
  actorId: string;
  walletAddress: string;
  productId: string;
  productTitle: string;
  supplierId: string;
  supplierName: string;
  quantity: number;
  unitPrice: number;
  currency: 'USD';
  shippingRegion: string;
  deliveryMode: 'freight-consolidated' | 'studio-direct' | 'tool-hub-pickup';
  fulfillmentStatus: 'awaiting-payment' | 'queued' | 'packing' | 'in-transit' | 'delivered';
  paymentStatus: 'quoted' | 'intent-created' | 'processing' | 'deposit-captured' | 'settled' | 'failed' | 'refunded';
  traceabilityStatus: 'batch-linked' | 'protocol-reviewed' | 'origin-complete';
  estimatedShipDate: string;
  reorderReady: boolean;
  receiptId?: string;
  paymentIntentId?: string;
  processorEventId?: string;
  amountPaid?: number;
  reconciledAt?: string;
  notes: string;
  createdAt: string;
};

export type RentalBooking = {
  id: string;
  actorId: string;
  walletAddress: string;
  rentalId: string;
  rentalTitle: string;
  hubName: string;
  bookingDate: string;
  sessionWindow: string;
  depositLabel: string;
  accessStatus: 'orientation-required' | 'pending-review' | 'confirmed' | 'waitlisted' | 'checked-out' | 'returned';
  returnProtocol: string;
  stewardStatus?: 'pending' | 'approved' | 'waitlisted' | 'closed';
  checkedOutAt?: string;
  returnedAt?: string;
  conditionStatus?: 'not-started' | 'in-use' | 'returned-good' | 'returned-maintenance';
  conditionNotes?: string;
  createdAt: string;
};

export type CoopCommitment = {
  id: string;
  actorId: string;
  walletAddress: string;
  orderId: string;
  orderTitle: string;
  units: number;
  contributionStatus: 'pledged' | 'confirmed' | 'awaiting-payment' | 'invoice-issued' | 'invoice-settled' | 'dispatch-ready' | 'closed';
  paymentWindow: string;
  freightLane: string;
  invoiceId?: string;
  invoiceArtifactUrl?: string;
  settledAt?: string;
  dispatchStatus?: 'not-started' | 'ready' | 'in-transit' | 'closed';
  dispatchClosedAt?: string;
  createdAt: string;
};

export type OriginStory = {
  productId: string;
  batchCode: string;
  stewardName: string;
  originTitle: string;
  originSummary: string;
  stewardshipProtocol: string;
  chainOfCustody: string[];
  proofDocuments: Array<{
    id: string;
    label: string;
    fileName?: string;
    mimeType?: string;
    sizeBytes?: number;
    storagePath?: string;
    downloadPath?: string;
    createdAt?: string;
  }>;
  qrDestinationLabel: string;
};

export const categoryMeta: Record<MaterialsToolsCategoryId, { label: string; description: string; image: string; group: 'materials' | 'tools' | 'equipment' }> = {
  'natural-pigments-dyes': {
    label: 'Natural Pigments & Dyes',
    description: 'Ochre, indigo, clay slips, cochineal, and plant-based colour systems with traceable origin stories.',
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1600&h=900&fit=crop',
    group: 'materials'
  },
  'fibers-textile-materials': {
    label: 'Fibers & Textile Materials',
    description: 'Wool, bark cloth, hemp, agave fibre, sinew, and weaving inputs ready for maker studios.',
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1600&h=900&fit=crop',
    group: 'materials'
  },
  'hides-feathers-quills': {
    label: 'Hides, Feathers & Quills',
    description: 'Ethically sourced hides and protocol-aware material listings requiring trust and traceability.',
    image: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=1600&h=900&fit=crop',
    group: 'materials'
  },
  'woods-carving-materials': {
    label: 'Woods & Carving Materials',
    description: 'Soapstone, cedar, basswood, and carving blocks prepared for sculpture and cultural production.',
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1600&h=900&fit=crop',
    group: 'materials'
  },
  'beads-findings': {
    label: 'Beads & Findings',
    description: 'Seed beads, shell discs, silver findings, and heirloom components for jewelry and regalia makers.',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600&h=900&fit=crop',
    group: 'materials'
  },
  'clays-ceramic-materials': {
    label: 'Clays & Ceramic Materials',
    description: 'Clay bodies, slips, grog, and firing materials grounded in community ceramic traditions.',
    image: 'https://images.unsplash.com/photo-1517685352821-92cf88aee5a5?w=1600&h=900&fit=crop',
    group: 'materials'
  },
  'canvas-paper-surfaces': {
    label: 'Canvas, Paper & Surfaces',
    description: 'Archival surfaces, handmade paper, bark panels, and framing-ready substrates for visual work.',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1600&h=900&fit=crop',
    group: 'materials'
  },
  'carving-woodworking-tools': {
    label: 'Carving & Woodworking Tools',
    description: 'Knives, gouges, adzes, rasps, and finishing tools for carving studios and apprenticeships.',
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1600&h=900&fit=crop',
    group: 'tools'
  },
  'jewelry-metalsmithing-tools': {
    label: 'Jewelry & Metalsmithing Tools',
    description: 'Torches, flex shafts, stakes, forming tools, and bench essentials for metalsmithing.',
    image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=1600&h=900&fit=crop',
    group: 'tools'
  },
  'pottery-ceramics-tools': {
    label: 'Pottery & Ceramics Tools',
    description: 'Wheels, paddles, ribs, kilns, glazing tools, and bat systems for clay studios.',
    image: 'https://images.unsplash.com/photo-1517685352821-92cf88aee5a5?w=1600&h=900&fit=crop',
    group: 'tools'
  },
  'textile-weaving-tools': {
    label: 'Textile & Weaving Tools',
    description: 'Backstrap looms, floor looms, spindles, carders, and weaving accessories.',
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=1600&h=900&fit=crop',
    group: 'tools'
  },
  'painting-drawing-supplies': {
    label: 'Painting & Drawing Supplies',
    description: 'Brushes, papers, charcoals, ink systems, palettes, and studio kits for image-makers.',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1600&h=900&fit=crop',
    group: 'tools'
  },
  'printmaking-tools': {
    label: 'Printmaking Tools',
    description: 'Blocks, brayers, carving sets, presses, and drying racks for edition work.',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1600&h=900&fit=crop',
    group: 'tools'
  },
  'digital-equipment': {
    label: 'Digital Equipment',
    description: 'Tablets, styluses, scanners, cameras, and studio capture gear for contemporary creators.',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1600&h=900&fit=crop',
    group: 'equipment'
  },
  'studio-furniture-storage': {
    label: 'Studio Furniture & Storage',
    description: 'Workbenches, lighting, shelving, flat files, and artist studio infrastructure.',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1600&h=900&fit=crop',
    group: 'equipment'
  },
  'packaging-shipping-supplies': {
    label: 'Packaging & Shipping Supplies',
    description: 'Tube mailers, art crates, labels, padding, and fulfillment supplies for safer delivery.',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1600&h=900&fit=crop',
    group: 'equipment'
  }
};

export const suppliers: Supplier[] = [
  {
    id: 'sup-1',
    name: 'Red Ochre Materials Collective',
    nation: 'Pitjantjatjara',
    region: 'Central Australia',
    verified: true,
    verificationTier: 'platinum',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    cover: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1400&h=700&fit=crop',
    specialties: ['Ochre pigments', 'Carving stone', 'Harvest protocol'],
    bio: 'Community-run materials source supplying ochres, stone, and harvested earth pigments with full provenance records.',
    responseTime: 'Responds in under 8 hours',
    fulfillmentScore: 98
  },
  {
    id: 'sup-2',
    name: 'Awa Fibre House',
    nation: 'Maori',
    region: 'Waikato, Aotearoa',
    verified: true,
    verificationTier: 'gold',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
    cover: 'https://images.unsplash.com/photo-1494526585095-c41746248156?w=1400&h=700&fit=crop',
    specialties: ['Flax fibres', 'Weaving tools', 'Natural dyes'],
    bio: 'Supplier network for fibres, weaving tools, and dye preparations grounded in community fibre practice.',
    responseTime: 'Responds in 1 business day',
    fulfillmentScore: 95
  },
  {
    id: 'sup-3',
    name: 'Prairie Bead & Hide Exchange',
    nation: 'Lakota',
    region: 'South Dakota, US',
    verified: true,
    verificationTier: 'gold',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
    cover: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1400&h=700&fit=crop',
    specialties: ['Brain-tanned hides', 'Bead packs', 'Regalia findings'],
    bio: 'Artist-to-artist supplier specializing in beadwork inputs, hide preparation, and small-batch regalia materials.',
    responseTime: 'Responds in under 12 hours',
    fulfillmentScore: 93
  },
  {
    id: 'sup-4',
    name: 'Coastal Tool Library Network',
    nation: 'Haida',
    region: 'British Columbia, Canada',
    verified: true,
    verificationTier: 'silver',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
    cover: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1400&h=700&fit=crop',
    specialties: ['Tool rental', 'Repair services', 'Studio equipment'],
    bio: 'Shared equipment and maker support hubs giving artists access to expensive tools without full ownership costs.',
    responseTime: 'Responds in 1-2 business days',
    fulfillmentScore: 91
  }
];

export const products: MaterialProduct[] = [
  {
    id: 'mt-101',
    title: 'Ceremonial Ochre Pigment Set',
    supplierId: 'sup-1',
    supplierName: 'Red Ochre Materials Collective',
    nation: 'Pitjantjatjara',
    category: 'natural-pigments-dyes',
    kind: 'material',
    price: 42,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200&h=900&fit=crop',
    stockLabel: 'In Stock',
    leadTime: 'Ships in 3-5 days',
    verified: true,
    verificationTier: 'platinum',
    summary: 'Three natural ochre pigments with harvest story, safety notes, and mixing guidance.',
    traceability: {
      originRegion: 'Mimili Ridge Country',
      harvestDate: '2026-02-08',
      method: 'Low-impact hand harvest under community permit',
      qrLabel: 'Scan origin story'
    },
    certifications: ['Community Verified', 'Low-impact Harvest'],
    moqLabel: 'MOQ 1 set'
  },
  {
    id: 'mt-102',
    title: 'Harakeke Fibre Preparation Bundle',
    supplierId: 'sup-2',
    supplierName: 'Awa Fibre House',
    nation: 'Maori',
    category: 'fibers-textile-materials',
    kind: 'material',
    price: 58,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=1200&h=900&fit=crop',
    stockLabel: 'Limited',
    leadTime: 'Ships in 7 days',
    verified: true,
    verificationTier: 'gold',
    summary: 'Prepared flax fibre bundle with cutting protocol notes and dye pairing guide.',
    traceability: {
      originRegion: 'Waikato Wetland Gardens',
      harvestDate: '2026-01-28',
      method: 'Selective blade harvest with rotational replanting',
      qrLabel: 'Scan harvester profile'
    },
    certifications: ['Kaitiakitanga Certified', 'Community Verified'],
    moqLabel: 'MOQ 5 bundles'
  },
  {
    id: 'mt-103',
    title: 'Brain-Tanned Hide Panel',
    supplierId: 'sup-3',
    supplierName: 'Prairie Bead & Hide Exchange',
    nation: 'Lakota',
    category: 'hides-feathers-quills',
    kind: 'material',
    price: 145,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=1200&h=900&fit=crop',
    stockLabel: 'Small Batch',
    leadTime: 'Ships in 5-8 days',
    verified: true,
    verificationTier: 'gold',
    summary: 'Soft-finished hide panel suitable for regalia, quillwork, and cultural crafts.',
    traceability: {
      originRegion: 'Prairie Plains Cooperative Range',
      harvestDate: '2026-02-02',
      method: 'Ethical sourcing + brain tan + smoke finish',
      qrLabel: 'Scan tanning log'
    },
    certifications: ['Ethical Sourcing', 'Traditional Tanning'],
    moqLabel: 'MOQ 1 panel'
  },
  {
    id: 'mt-104',
    title: 'Soapstone Carving Block Pack',
    supplierId: 'sup-1',
    supplierName: 'Red Ochre Materials Collective',
    nation: 'Pitjantjatjara',
    category: 'woods-carving-materials',
    kind: 'material',
    price: 64,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&h=900&fit=crop',
    stockLabel: 'In Stock',
    leadTime: 'Ships in 4 days',
    verified: true,
    verificationTier: 'platinum',
    summary: 'Small-format carving blocks selected for education programs and fine carving practice.',
    traceability: {
      originRegion: 'Anangu Quarry Line',
      harvestDate: '2026-01-18',
      method: 'Community-managed extraction and shaping',
      qrLabel: 'Scan quarry record'
    },
    certifications: ['Traceable Quarry', 'Community Verified'],
    moqLabel: 'MOQ 3 blocks'
  },
  {
    id: 'mt-105',
    title: 'Regalia Bead Spectrum Kit',
    supplierId: 'sup-3',
    supplierName: 'Prairie Bead & Hide Exchange',
    nation: 'Lakota',
    category: 'beads-findings',
    kind: 'bulk-supply',
    price: 33,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&h=900&fit=crop',
    stockLabel: 'In Stock',
    leadTime: 'Ships in 2-4 days',
    verified: true,
    verificationTier: 'gold',
    summary: 'Curated seed bead colourway pack with shell discs and pattern planning cards.',
    traceability: {
      originRegion: 'Prairie Bead Studio',
      harvestDate: '2026-02-10',
      method: 'Studio-packed supply bundle',
      qrLabel: 'Scan packing notes'
    },
    certifications: ['Artist Packed', 'Community Verified'],
    moqLabel: 'MOQ 10 kits'
  },
  {
    id: 'mt-106',
    title: 'Backstrap Loom Starter Set',
    supplierId: 'sup-2',
    supplierName: 'Awa Fibre House',
    nation: 'Maori',
    category: 'textile-weaving-tools',
    kind: 'tool',
    price: 210,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=1200&h=900&fit=crop',
    stockLabel: 'Made to Order',
    leadTime: 'Ships in 12 days',
    verified: true,
    verificationTier: 'gold',
    summary: 'Compact loom set with weaving sword, heddles, setup guide, and maintenance notes.',
    traceability: {
      originRegion: 'Waikato Workshop Bench',
      harvestDate: '2026-02-05',
      method: 'Bench-built tool kit with native timber offcuts',
      qrLabel: 'Scan maker story'
    },
    certifications: ['Community Built', 'Low-waste Production'],
    moqLabel: 'MOQ 1 kit'
  },
  {
    id: 'mt-107',
    title: 'Studio Capture Tablet Bundle',
    supplierId: 'sup-4',
    supplierName: 'Coastal Tool Library Network',
    nation: 'Haida',
    category: 'digital-equipment',
    kind: 'equipment',
    price: 720,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=900&fit=crop',
    stockLabel: 'Hub Stock',
    leadTime: 'Reserve now',
    verified: true,
    verificationTier: 'silver',
    summary: 'Tablet, stylus, colour-calibrated display setup, and carry case for hybrid studios.',
    traceability: {
      originRegion: 'North Coast Tool Hub',
      harvestDate: '2026-02-12',
      method: 'Shared-pool equipment refurbishment + QA',
      qrLabel: 'Scan hub lifecycle'
    },
    certifications: ['Refurbished & Tested', 'Hub Verified'],
    moqLabel: 'MOQ 1 bundle'
  },
  {
    id: 'mt-108',
    title: 'Archival Crate & Tube Fulfillment Pack',
    supplierId: 'sup-4',
    supplierName: 'Coastal Tool Library Network',
    nation: 'Haida',
    category: 'packaging-shipping-supplies',
    kind: 'bulk-supply',
    price: 86,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&h=900&fit=crop',
    stockLabel: 'In Stock',
    leadTime: 'Ships in 2 days',
    verified: true,
    verificationTier: 'silver',
    summary: 'Mixed-pack shipping kit for fragile artworks, rolled pieces, and wholesale dispatch.',
    traceability: {
      originRegion: 'Coastal Fulfillment Hub',
      harvestDate: '2026-02-09',
      method: 'Bulk-packed and warehouse tested',
      qrLabel: 'Scan pack spec'
    },
    certifications: ['Warehouse Tested', 'Artist-safe Packaging'],
    moqLabel: 'MOQ 5 packs'
  }
];

export const rentals: ToolRental[] = [
  {
    id: 'rental-1',
    title: 'Community Kiln Access Pass',
    hubName: 'Coastal Tool Library Network',
    nation: 'Haida',
    location: 'Prince Rupert, BC',
    dailyRateLabel: '$48 / firing slot',
    image: 'https://images.unsplash.com/photo-1517685352821-92cf88aee5a5?w=1200&h=900&fit=crop',
    summary: 'Book kiln time with glazing bench access, loading support, and safety orientation.',
    availability: 'Open next 14 days',
    equipmentType: 'Ceramics'
  },
  {
    id: 'rental-2',
    title: 'Flex Shaft Jewelry Bench Bundle',
    hubName: 'Prairie Bead & Hide Exchange',
    nation: 'Lakota',
    location: 'Rapid City, SD',
    dailyRateLabel: '$35 / day',
    image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=1200&h=900&fit=crop',
    summary: 'Bench station with flex shaft, forming tools, torch space, and shared solder setup.',
    availability: 'Booked weekends',
    equipmentType: 'Jewelry'
  },
  {
    id: 'rental-3',
    title: 'Large-format Scanner + Photo Tent',
    hubName: 'Coastal Tool Library Network',
    nation: 'Haida',
    location: 'Prince Rupert, BC',
    dailyRateLabel: '$60 / day',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=900&fit=crop',
    summary: 'Shared digitization rig for portfolios, archives, cataloguing, and print prep.',
    availability: 'Reserve 5 days ahead',
    equipmentType: 'Digital'
  }
];

export const services: SupplyService[] = [
  {
    id: 'svc-1',
    title: 'Equipment Repair & Maintenance',
    provider: 'Coastal Tool Library Network',
    nation: 'Haida',
    rateLabel: '$95/hr',
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200&h=900&fit=crop',
    summary: 'Repair for looms, carving tools, flex shafts, and studio gear with parts sourcing support.',
    serviceType: 'repair'
  },
  {
    id: 'svc-2',
    title: 'Material Sourcing Consultation',
    provider: 'Red Ochre Materials Collective',
    nation: 'Pitjantjatjara',
    rateLabel: '$140/session',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&h=900&fit=crop',
    summary: 'Get sourcing help for pigments, carving materials, and culturally appropriate substitutions.',
    serviceType: 'sourcing'
  },
  {
    id: 'svc-3',
    title: 'Bulk Buying Co-op Facilitation',
    provider: 'Awa Fibre House',
    nation: 'Maori',
    rateLabel: '2% co-op admin',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=900&fit=crop',
    summary: 'Coordinate group orders, supplier matching, and consolidated freight for artist cohorts.',
    serviceType: 'co-op'
  },
  {
    id: 'svc-4',
    title: 'Surplus Materials Brokerage',
    provider: 'Prairie Bead & Hide Exchange',
    nation: 'Lakota',
    rateLabel: '$20 listing fee',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&h=900&fit=crop',
    summary: 'Help artists re-home surplus stock, studio equipment, and unopened supply runs.',
    serviceType: 'surplus'
  }
];

export const coopOrders: CoopOrder[] = [
  {
    id: 'coop-1',
    title: 'Bulk Seed Bead Colorway Run',
    summary: 'Collective order for beadwork studios seeking shared discounts on regalia palettes.',
    targetUnits: 120,
    committedUnits: 84,
    closeDate: '2026-04-02',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&h=900&fit=crop',
    preferredCategory: 'beads-findings'
  },
  {
    id: 'coop-2',
    title: 'Shared Loom Hardware Refill',
    summary: 'Regional co-op for heddles, beams, tie cords, and textile tool replacement parts.',
    targetUnits: 80,
    committedUnits: 37,
    closeDate: '2026-03-28',
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=1200&h=900&fit=crop',
    preferredCategory: 'textile-weaving-tools'
  },
  {
    id: 'coop-3',
    title: 'Archival Shipping Material Pool',
    summary: 'Joint order for crates, tubes, foam inserts, and labels for gallery season.',
    targetUnits: 200,
    committedUnits: 142,
    closeDate: '2026-04-11',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&h=900&fit=crop',
    preferredCategory: 'packaging-shipping-supplies'
  }
];

export const materialsToolsOrders: MaterialsToolsOrder[] = [
  {
    id: 'order-1',
    actorId: '0xstudioalpha',
    walletAddress: '0xstudioalpha',
    productId: 'mt-101',
    productTitle: 'Ceremonial Ochre Pigment Set',
    supplierId: 'sup-1',
    supplierName: 'Red Ochre Materials Collective',
    quantity: 3,
    unitPrice: 42,
    currency: 'USD',
    shippingRegion: 'Adelaide Studio',
    deliveryMode: 'freight-consolidated',
    fulfillmentStatus: 'packing',
    paymentStatus: 'deposit-captured',
    traceabilityStatus: 'origin-complete',
    estimatedShipDate: '2026-03-18',
    reorderReady: true,
    receiptId: 'mt-receipt-1001',
    paymentIntentId: 'mtpi-order-1',
    processorEventId: 'mt-event-settled-1',
    amountPaid: 126,
    reconciledAt: '2026-03-11T12:15:00.000Z',
    notes: 'Packed against gallery workshop run with batch-matched pigment cards.',
    createdAt: '2026-03-10T10:30:00.000Z'
  },
  {
    id: 'order-2',
    actorId: '0xstudioalpha',
    walletAddress: '0xstudioalpha',
    productId: 'mt-108',
    productTitle: 'Archival Crate & Tube Fulfillment Pack',
    supplierId: 'sup-4',
    supplierName: 'Coastal Tool Library Network',
    quantity: 5,
    unitPrice: 86,
    currency: 'USD',
    shippingRegion: 'Regional Tool Hub',
    deliveryMode: 'tool-hub-pickup',
    fulfillmentStatus: 'queued',
    paymentStatus: 'intent-created',
    traceabilityStatus: 'batch-linked',
    estimatedShipDate: '2026-03-20',
    reorderReady: false,
    paymentIntentId: 'mtpi-order-2',
    notes: 'Waiting on co-packed label set before dispatch.',
    createdAt: '2026-03-12T09:00:00.000Z'
  },
  {
    id: 'order-3',
    actorId: '0xcollectivebeta',
    walletAddress: '0xcollectivebeta',
    productId: 'mt-106',
    productTitle: 'Backstrap Loom Starter Set',
    supplierId: 'sup-2',
    supplierName: 'Awa Fibre House',
    quantity: 1,
    unitPrice: 210,
    currency: 'USD',
    shippingRegion: 'Waikato training site',
    deliveryMode: 'studio-direct',
    fulfillmentStatus: 'in-transit',
    paymentStatus: 'settled',
    traceabilityStatus: 'origin-complete',
    estimatedShipDate: '2026-03-14',
    reorderReady: false,
    receiptId: 'mt-receipt-1002',
    paymentIntentId: 'mtpi-order-3',
    processorEventId: 'mt-event-settled-3',
    amountPaid: 210,
    reconciledAt: '2026-03-06T09:00:00.000Z',
    notes: 'Apprenticeship delivery with maintenance guide attached.',
    createdAt: '2026-03-05T08:15:00.000Z'
  }
];

export const rentalBookings: RentalBooking[] = [
  {
    id: 'booking-1',
    actorId: '0xstudioalpha',
    walletAddress: '0xstudioalpha',
    rentalId: 'rental-1',
    rentalTitle: 'Community Kiln Access Pass',
    hubName: 'Coastal Tool Library Network',
    bookingDate: '2026-03-22',
    sessionWindow: 'Morning firing lane',
    depositLabel: '$48 deposit captured',
    accessStatus: 'confirmed',
    returnProtocol: 'Unload with kiln steward, sign glaze residue log, and complete safety reset.',
    stewardStatus: 'approved',
    checkedOutAt: '2026-03-22T08:30:00.000Z',
    conditionStatus: 'in-use',
    createdAt: '2026-03-11T14:20:00.000Z'
  },
  {
    id: 'booking-2',
    actorId: '0xcollectivebeta',
    walletAddress: '0xcollectivebeta',
    rentalId: 'rental-3',
    rentalTitle: 'Large-format Scanner + Photo Tent',
    hubName: 'Coastal Tool Library Network',
    bookingDate: '2026-03-19',
    sessionWindow: 'Afternoon capture block',
    depositLabel: '$60 deposit pending approval',
    accessStatus: 'pending-review',
    returnProtocol: 'Return lenses to locked case and upload asset folder to shared drive.',
    stewardStatus: 'pending',
    conditionStatus: 'not-started',
    createdAt: '2026-03-12T07:45:00.000Z'
  }
];

export const coopCommitments: CoopCommitment[] = [
  {
    id: 'commit-1',
    actorId: '0xstudioalpha',
    walletAddress: '0xstudioalpha',
    orderId: 'coop-1',
    orderTitle: 'Bulk Seed Bead Colorway Run',
    units: 14,
    contributionStatus: 'invoice-settled',
    paymentWindow: 'Deposit due by 2026-03-22',
    freightLane: 'South Pacific consolidated lane',
    invoiceId: 'mt-invoice-101',
    invoiceArtifactUrl: '/materials-tools/coop/coop-1?invoice=mt-invoice-101',
    settledAt: '2026-03-12T09:10:00.000Z',
    dispatchStatus: 'ready',
    createdAt: '2026-03-11T12:00:00.000Z'
  },
  {
    id: 'commit-2',
    actorId: '0xstudioalpha',
    walletAddress: '0xstudioalpha',
    orderId: 'coop-3',
    orderTitle: 'Archival Shipping Material Pool',
    units: 24,
    contributionStatus: 'invoice-issued',
    paymentWindow: 'Final invoice releases 2026-03-19',
    freightLane: 'Gallery season freight bundle',
    invoiceId: 'mt-invoice-102',
    invoiceArtifactUrl: '/materials-tools/coop/coop-3?invoice=mt-invoice-102',
    dispatchStatus: 'not-started',
    createdAt: '2026-03-12T15:10:00.000Z'
  }
];

export const originStories: OriginStory[] = [
  {
    productId: 'mt-101',
    batchCode: 'OR-260208-A',
    stewardName: 'Mimili Ridge harvest crew',
    originTitle: 'Ochre lifted under ridge-country permit and mapped to studio-safe batch cards.',
    originSummary: 'This batch was hand-lifted from a permitted ochre face, sieved on-site, and matched into a three-tone set for studios needing reliable ceremonial colour continuity.',
    stewardshipProtocol: 'Harvest windows close after rainfall, every extraction point is logged, and remaining earth is backfilled before the permit closes.',
    chainOfCustody: [
      'Harvest crew logged extraction zone and batch weight.',
      'Community workshop milled and carded pigments by tone band.',
      'Supplier packed sets with studio safety and mixing notes.'
    ],
    proofDocuments: [
      { id: 'proof-1', label: 'Permit excerpt', fileName: 'permit-excerpt.pdf', mimeType: 'application/pdf', sizeBytes: 182440, downloadPath: '/materials-tools/origin/mt-101', createdAt: '2026-02-09T09:00:00.000Z' },
      { id: 'proof-2', label: 'Harvest log sheet', fileName: 'harvest-log-sheet.pdf', mimeType: 'application/pdf', sizeBytes: 223110, downloadPath: '/materials-tools/origin/mt-101', createdAt: '2026-02-09T09:10:00.000Z' },
      { id: 'proof-3', label: 'Pigment QA card', fileName: 'pigment-qa-card.pdf', mimeType: 'application/pdf', sizeBytes: 80440, downloadPath: '/materials-tools/origin/mt-101', createdAt: '2026-02-09T09:20:00.000Z' }
    ],
    qrDestinationLabel: 'Open ridge-country origin story'
  },
  {
    productId: 'mt-102',
    batchCode: 'HK-260128-B',
    stewardName: 'Awa Fibre House preparation bench',
    originTitle: 'Harakeke bundles cut in rotation, scraped by hand, and matched to dye-ready fibre grades.',
    originSummary: 'This fibre batch was selected from rotational wetland plots, stripped with blade-safe cutting notes, and dried into weaving-ready grades for schools and studio practice.',
    stewardshipProtocol: 'Only mature leaves are cut, the centre fan is left intact, and fibre lots are tracked back to the cutting lane before packing.',
    chainOfCustody: [
      'Harvester logged the wetland plot and rotational cutting lane.',
      'Preparation bench scraped and sorted fibres by teaching-grade length.',
      'Supplier packed bundles with dye pairing and care notes.'
    ],
    proofDocuments: [
      { id: 'proof-10', label: 'Wetland harvest register', fileName: 'wetland-harvest-register.pdf', mimeType: 'application/pdf', sizeBytes: 142220, downloadPath: '/materials-tools/origin/mt-102', createdAt: '2026-01-29T07:45:00.000Z' },
      { id: 'proof-11', label: 'Preparation bench log', fileName: 'preparation-bench-log.pdf', mimeType: 'application/pdf', sizeBytes: 186430, downloadPath: '/materials-tools/origin/mt-102', createdAt: '2026-01-29T08:05:00.000Z' },
      { id: 'proof-12', label: 'Dye pairing guide', fileName: 'dye-pairing-guide.pdf', mimeType: 'application/pdf', sizeBytes: 74420, downloadPath: '/materials-tools/origin/mt-102', createdAt: '2026-01-29T08:20:00.000Z' }
    ],
    qrDestinationLabel: 'Open harakeke fibre origin story'
  },
  {
    productId: 'mt-103',
    batchCode: 'BH-260202-C',
    stewardName: 'Prairie Plains tanning team',
    originTitle: 'Hide panel finished through smoke, stretch, and beadwork-ready surface checks.',
    originSummary: 'The panel moved from ethical hide intake to traditional brain tan, smoke finish, and softness testing so regalia makers receive a stable, stitch-ready surface.',
    stewardshipProtocol: 'Tanning notes record hide source, smoke sequence, and every finishing oil used before release.',
    chainOfCustody: [
      'Ethical intake logged against cooperative range records.',
      'Hide was tanned, smoked, and conditioned by the finishing bench.',
      'Surface was checked for stitch tension before panel trimming.'
    ],
    proofDocuments: [
      { id: 'proof-4', label: 'Ethical intake note', fileName: 'ethical-intake-note.pdf', mimeType: 'application/pdf', sizeBytes: 101120, downloadPath: '/materials-tools/origin/mt-103', createdAt: '2026-02-03T10:00:00.000Z' },
      { id: 'proof-5', label: 'Tanning log', fileName: 'tanning-log.pdf', mimeType: 'application/pdf', sizeBytes: 206880, downloadPath: '/materials-tools/origin/mt-103', createdAt: '2026-02-03T10:10:00.000Z' },
      { id: 'proof-6', label: 'Surface QA checklist', fileName: 'surface-qa-checklist.pdf', mimeType: 'application/pdf', sizeBytes: 66520, downloadPath: '/materials-tools/origin/mt-103', createdAt: '2026-02-03T10:20:00.000Z' }
    ],
    qrDestinationLabel: 'Open tanning and finish record'
  },
  {
    productId: 'mt-104',
    batchCode: 'SQ-260118-D',
    stewardName: 'Anangu quarry shaping team',
    originTitle: 'Soapstone blocks trimmed from community-managed quarry runs and staged for education-safe carving lots.',
    originSummary: 'Each carving block is cut from a monitored quarry line, edge-finished for classroom handling, and checked for fracture patterns before release into the maker supply lane.',
    stewardshipProtocol: 'Extraction stays inside approved quarry windows, offcuts are logged for reuse, and every classroom lot is checked for dust and fracture safety notes.',
    chainOfCustody: [
      'Quarry steward recorded extraction segment and block weight.',
      'Shaping team trimmed blocks into education and studio sizes.',
      'Supplier QA logged fracture pattern checks before packing.'
    ],
    proofDocuments: [
      { id: 'proof-13', label: 'Quarry release sheet', fileName: 'quarry-release-sheet.pdf', mimeType: 'application/pdf', sizeBytes: 151280, downloadPath: '/materials-tools/origin/mt-104', createdAt: '2026-01-19T11:00:00.000Z' },
      { id: 'proof-14', label: 'Dust safety card', fileName: 'dust-safety-card.pdf', mimeType: 'application/pdf', sizeBytes: 62310, downloadPath: '/materials-tools/origin/mt-104', createdAt: '2026-01-19T11:10:00.000Z' },
      { id: 'proof-15', label: 'Studio sizing checklist', fileName: 'studio-sizing-checklist.pdf', mimeType: 'application/pdf', sizeBytes: 93240, downloadPath: '/materials-tools/origin/mt-104', createdAt: '2026-01-19T11:20:00.000Z' }
    ],
    qrDestinationLabel: 'Open quarry and shaping record'
  },
  {
    productId: 'mt-106',
    batchCode: 'LOOM-260205-B',
    stewardName: 'Awa Fibre tool makers bench',
    originTitle: 'Loom kit built from workshop timber offcuts and tested with a live warp setup.',
    originSummary: 'Each starter set is assembled in a teaching workshop so the finished kit arrives with heddles aligned, beams sealed, and setup notes already matched to first-time learners.',
    stewardshipProtocol: 'Native timber offcuts are selected after community review and every loom is warped for a dry run before packing.',
    chainOfCustody: [
      'Workshop selected approved timber offcuts.',
      'Maker bench assembled loom hardware and weaving sword.',
      'Learning team dry-ran warp setup and packed guidance cards.'
    ],
    proofDocuments: [
      { id: 'proof-7', label: 'Workshop materials log', fileName: 'workshop-materials-log.pdf', mimeType: 'application/pdf', sizeBytes: 99020, downloadPath: '/materials-tools/origin/mt-106', createdAt: '2026-02-06T08:00:00.000Z' },
      { id: 'proof-8', label: 'Maker bench checklist', fileName: 'maker-bench-checklist.pdf', mimeType: 'application/pdf', sizeBytes: 110020, downloadPath: '/materials-tools/origin/mt-106', createdAt: '2026-02-06T08:10:00.000Z' },
      { id: 'proof-9', label: 'Warp test card', fileName: 'warp-test-card.pdf', mimeType: 'application/pdf', sizeBytes: 55200, downloadPath: '/materials-tools/origin/mt-106', createdAt: '2026-02-06T08:20:00.000Z' }
    ],
    qrDestinationLabel: 'Open maker bench origin story'
  },
  {
    productId: 'mt-105',
    batchCode: 'RB-260210-E',
    stewardName: 'Prairie Bead Studio packing bench',
    originTitle: 'Colour-matched bead kits packed for regalia work with shell discs, planning cards, and shade consistency notes.',
    originSummary: 'Each bead spectrum kit is sorted from studio stock into regalia-ready colour families, paired with shell discs, and packed with pattern planning cards for teaching and custom order work.',
    stewardshipProtocol: 'Packing notes track colour lot blending, shell disc counts, and any substitutions before kits leave the studio bench.',
    chainOfCustody: [
      'Studio selected bead lots by regalia colourway and finish.',
      'Packing bench paired shell discs and planning cards with each kit.',
      'Final QA checked colour consistency and sealed bundle counts before dispatch.'
    ],
    proofDocuments: [
      { id: 'proof-16', label: 'Packing bench sheet', fileName: 'packing-bench-sheet.pdf', mimeType: 'application/pdf', sizeBytes: 118240, downloadPath: '/materials-tools/origin/mt-105', createdAt: '2026-02-10T09:00:00.000Z' },
      { id: 'proof-17', label: 'Colour lot card', fileName: 'colour-lot-card.pdf', mimeType: 'application/pdf', sizeBytes: 92410, downloadPath: '/materials-tools/origin/mt-105', createdAt: '2026-02-10T09:10:00.000Z' },
      { id: 'proof-18', label: 'Kit count checklist', fileName: 'kit-count-checklist.pdf', mimeType: 'application/pdf', sizeBytes: 64220, downloadPath: '/materials-tools/origin/mt-105', createdAt: '2026-02-10T09:20:00.000Z' }
    ],
    qrDestinationLabel: 'Open regalia kit packing record'
  },
  {
    productId: 'mt-107',
    batchCode: 'TAB-260212-F',
    stewardName: 'North Coast tool hub refurbishment team',
    originTitle: 'Studio capture bundles refurbished, colour-calibrated, and staged for creator loan or purchase lanes.',
    originSummary: 'This tablet bundle moved through device refurbishment, stylus pressure testing, display calibration, and carrying-case checks before it entered the hub stock pool.',
    stewardshipProtocol: 'Every shared-pool device must pass calibration, battery health, and stylus sensitivity review before release to creators.',
    chainOfCustody: [
      'Hub intake logged serial numbers and refurbishment history.',
      'Calibration bench tested display balance and stylus response.',
      'Tool hub packed the bundle with charging kit, carry case, and usage notes.'
    ],
    proofDocuments: [
      { id: 'proof-19', label: 'Refurbishment log', fileName: 'refurbishment-log.pdf', mimeType: 'application/pdf', sizeBytes: 154880, downloadPath: '/materials-tools/origin/mt-107', createdAt: '2026-02-12T14:00:00.000Z' },
      { id: 'proof-20', label: 'Calibration report', fileName: 'calibration-report.pdf', mimeType: 'application/pdf', sizeBytes: 102440, downloadPath: '/materials-tools/origin/mt-107', createdAt: '2026-02-12T14:15:00.000Z' },
      { id: 'proof-21', label: 'Accessory pack checklist', fileName: 'accessory-pack-checklist.pdf', mimeType: 'application/pdf', sizeBytes: 58420, downloadPath: '/materials-tools/origin/mt-107', createdAt: '2026-02-12T14:30:00.000Z' }
    ],
    qrDestinationLabel: 'Open tool hub lifecycle record'
  },
  {
    productId: 'mt-108',
    batchCode: 'FUL-260209-G',
    stewardName: 'Coastal fulfillment packaging lane',
    originTitle: 'Archival crate and tube kits packed, compression tested, and matched to artwork-safe dispatch standards.',
    originSummary: 'The fulfillment team assembled this packaging pack from archival crates, crush-resistant tubes, corner protectors, and handling labels tested against fragile art dispatch rules.',
    stewardshipProtocol: 'Every fulfillment pack is staged against crush tests, moisture barriers, and fragile handling labels before release.',
    chainOfCustody: [
      'Warehouse lane counted crate, tube, and insert stock for each pack.',
      'Compression and corner-protection checks were logged against dispatch standards.',
      'Fulfillment bench sealed the mixed pack with handling labels and packing notes.'
    ],
    proofDocuments: [
      { id: 'proof-22', label: 'Compression test card', fileName: 'compression-test-card.pdf', mimeType: 'application/pdf', sizeBytes: 78420, downloadPath: '/materials-tools/origin/mt-108', createdAt: '2026-02-09T11:00:00.000Z' },
      { id: 'proof-23', label: 'Packaging lane manifest', fileName: 'packaging-lane-manifest.pdf', mimeType: 'application/pdf', sizeBytes: 129740, downloadPath: '/materials-tools/origin/mt-108', createdAt: '2026-02-09T11:10:00.000Z' },
      { id: 'proof-24', label: 'Fragile dispatch note', fileName: 'fragile-dispatch-note.pdf', mimeType: 'application/pdf', sizeBytes: 56310, downloadPath: '/materials-tools/origin/mt-108', createdAt: '2026-02-09T11:20:00.000Z' }
    ],
    qrDestinationLabel: 'Open fulfillment packaging record'
  }
];

export const MATERIALS_TOOLS_PREMIUM_PLACEMENTS = [
  { id: 'materials_sticky_banner', title: 'Workshop Season Announcement', slotLabel: 'Sticky Banner', cta: 'View' },
  { id: 'materials_hero_banner', title: 'Hero Supplier Campaign', slotLabel: 'Hero Banner', cta: 'View' },
  { id: 'materials_supplier_spotlight', title: 'Featured Supplier Spotlight', slotLabel: 'Supplier Spotlight', cta: 'View' },
  { id: 'materials_trending_strip', title: 'Trending Materials Strip', slotLabel: 'Trending Strip', cta: 'View' },
  { id: 'materials_sponsored_listing', title: 'Sponsored Listing Card', slotLabel: 'Sponsored slot', cta: 'View' },
  { id: 'materials_tool_library_banner', title: 'Tool Library Banner', slotLabel: 'Tool Rental Banner', cta: 'View' },
  { id: 'materials_coop_spotlight', title: 'Co-op Spotlight', slotLabel: 'Bulk Co-op Spotlight', cta: 'View' }
] as const;

export function materialsToolsSummary() {
  return {
    suppliers: suppliers.length,
    products: products.length,
    rentals: rentals.length,
    services: services.length,
    avgFulfillment: Math.round(suppliers.reduce((sum, item) => sum + item.fulfillmentScore, 0) / suppliers.length),
    categories: Object.keys(categoryMeta).length
  };
}

export function getProductById(productId: string) {
  return products.find((item) => item.id === productId);
}

export function getSupplierById(supplierId: string) {
  return suppliers.find((item) => item.id === supplierId);
}

export function getRentalById(rentalId: string) {
  return rentals.find((item) => item.id === rentalId);
}

export function getCoopOrderById(orderId: string) {
  return coopOrders.find((item) => item.id === orderId);
}

export function getProductsForCategory(categoryId: MaterialsToolsCategoryId) {
  return products.filter((item) => item.category === categoryId);
}

export function getOriginStoryByProductId(productId: string) {
  return originStories.find((item) => item.productId === productId);
}

export function getMaterialsToolsOrderById(orderId: string) {
  return materialsToolsOrders.find((item) => item.id === orderId);
}

export function listOrdersForActor(actorId?: string, walletAddress?: string) {
  const actor = (actorId || walletAddress || '').trim().toLowerCase();
  if (!actor) return materialsToolsOrders.slice(0, 2);
  return materialsToolsOrders.filter((item) => item.actorId === actor || item.walletAddress === actor);
}

export function listRentalBookingsForActor(actorId?: string, walletAddress?: string) {
  const actor = (actorId || walletAddress || '').trim().toLowerCase();
  if (!actor) return rentalBookings.slice(0, 1);
  return rentalBookings.filter((item) => item.actorId === actor || item.walletAddress === actor);
}

export function listCoopCommitmentsForActor(actorId?: string, walletAddress?: string) {
  const actor = (actorId || walletAddress || '').trim().toLowerCase();
  if (!actor) return coopCommitments.slice(0, 1);
  return coopCommitments.filter((item) => item.actorId === actor || item.walletAddress === actor);
}


