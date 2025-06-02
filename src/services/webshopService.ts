
export interface WebshopPrice {
  webshop: string;
  price: number;
  availability: 'in_stock' | 'limited' | 'out_of_stock';
  url: string;
  productName: string;
  productImage?: string;
}

export interface WebshopSearchResult {
  materialName: string;
  prices: WebshopPrice[];
  cheapestPrice?: WebshopPrice;
}

export class WebshopService {
  private static webshops = [
    {
      name: 'Hornbach',
      baseUrl: 'https://www.hornbach.nl',
      searchUrl: 'https://www.hornbach.nl/shop/zoeken/sortiment/',
      logo: '/hornbach-logo.png'
    },
    {
      name: 'Bouwmaat',
      baseUrl: 'https://www.bouwmaat.nl',
      searchUrl: 'https://www.bouwmaat.nl/zoeken?q=',
      logo: '/bouwmaat-logo.png'
    },
    {
      name: 'Online Bouwmaterialen',
      baseUrl: 'https://www.online-bouwmaterialen.nl',
      searchUrl: 'https://www.online-bouwmaterialen.nl/zoeken?q=',
      logo: '/online-bouwmaterialen-logo.png'
    }
  ];

  static async searchMaterial(materialName: string): Promise<WebshopSearchResult> {
    console.log(`Searching for material: ${materialName}`);
    
    // In een echte implementatie zou dit API calls naar de webshops maken
    // Voor nu simuleren we de resultaten
    const mockPrices: WebshopPrice[] = await this.getMockPrices(materialName);
    
    const cheapestPrice = mockPrices.reduce((prev, current) => 
      prev.price < current.price ? prev : current
    );

    return {
      materialName,
      prices: mockPrices,
      cheapestPrice
    };
  }

  private static async getMockPrices(materialName: string): Promise<WebshopPrice[]> {
    // Simuleer verschillende prijzen voor demonstratie
    const basePrice = Math.random() * 100 + 10;
    
    return [
      {
        webshop: 'Hornbach',
        price: basePrice * (0.9 + Math.random() * 0.2),
        availability: 'in_stock',
        url: `https://www.hornbach.nl/shop/zoeken/sortiment/?q=${encodeURIComponent(materialName)}`,
        productName: materialName,
        productImage: 'https://via.placeholder.com/100x100'
      },
      {
        webshop: 'Bouwmaat',
        price: basePrice * (0.85 + Math.random() * 0.3),
        availability: Math.random() > 0.8 ? 'limited' : 'in_stock',
        url: `https://www.bouwmaat.nl/zoeken?q=${encodeURIComponent(materialName)}`,
        productName: materialName,
        productImage: 'https://via.placeholder.com/100x100'
      },
      {
        webshop: 'Online Bouwmaterialen',
        price: basePrice * (0.95 + Math.random() * 0.15),
        availability: Math.random() > 0.9 ? 'out_of_stock' : 'in_stock',
        url: `https://www.online-bouwmaterialen.nl/zoeken?q=${encodeURIComponent(materialName)}`,
        productName: materialName,
        productImage: 'https://via.placeholder.com/100x100'
      }
    ];
  }

  static getWebshops() {
    return this.webshops;
  }

  static createDirectOrderUrl(webshop: string, materialName: string): string {
    const shop = this.webshops.find(w => w.name === webshop);
    if (!shop) return '#';
    
    return `${shop.searchUrl}${encodeURIComponent(materialName)}`;
  }
}
