
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ShoppingCart, ExternalLink, Search, Euro, Package, TrendingDown } from "lucide-react";
import { WebshopService, WebshopSearchResult, WebshopPrice } from "@/services/webshopService";
import { Material } from "@/pages/Index";
import { useToast } from "@/hooks/use-toast";

interface WebshopPriceComparisonProps {
  material: Material;
}

export function WebshopPriceComparison({ material }: WebshopPriceComparisonProps) {
  const [searchResult, setSearchResult] = useState<WebshopSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    setLoading(true);
    try {
      const result = await WebshopService.searchMaterial(material.name);
      setSearchResult(result);
      
      toast({
        title: "Prijzen gevonden",
        description: `${result.prices.length} webshops doorzoeken voor ${material.name}`,
      });
    } catch (error) {
      console.error('Error searching material:', error);
      toast({
        title: "Zoek fout",
        description: "Kon prijzen niet ophalen van webshops",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !searchResult) {
      handleSearch();
    }
  }, [isOpen]);

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'in_stock':
        return 'bg-green-100 text-green-800';
      case 'limited':
        return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case 'in_stock':
        return 'Op voorraad';
      case 'limited':
        return 'Beperkt voorraad';
      case 'out_of_stock':
        return 'Uitverkocht';
      default:
        return 'Onbekend';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <ShoppingCart className="w-4 h-4 mr-1" />
          Vergelijk prijzen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Prijsvergelijking: {material.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Webshops doorzoeken...</p>
            </div>
          ) : searchResult ? (
            <>
              {/* Best deal highlight */}
              {searchResult.cheapestPrice && (
                <Card className="bg-green-50 border-green-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingDown className="w-5 h-5 text-green-600" />
                      Beste Deal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-lg">{searchResult.cheapestPrice.webshop}</p>
                        <p className="text-sm text-gray-600">{searchResult.cheapestPrice.productName}</p>
                        <Badge className={getAvailabilityColor(searchResult.cheapestPrice.availability)}>
                          {getAvailabilityText(searchResult.cheapestPrice.availability)}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          €{searchResult.cheapestPrice.price.toFixed(2)}
                        </p>
                        <Button 
                          className="mt-2"
                          onClick={() => window.open(searchResult.cheapestPrice.url, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Bestel nu
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* All prices */}
              <div>
                <h4 className="font-semibold mb-3">Alle prijzen ({searchResult.prices.length} webshops)</h4>
                <div className="space-y-3">
                  {searchResult.prices
                    .sort((a, b) => a.price - b.price)
                    .map((price, index) => (
                      <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Package className="w-8 h-8 text-gray-400" />
                              </div>
                              <div>
                                <h5 className="font-semibold">{price.webshop}</h5>
                                <p className="text-sm text-gray-600">{price.productName}</p>
                                <Badge className={`mt-1 ${getAvailabilityColor(price.availability)}`}>
                                  {getAvailabilityText(price.availability)}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-2 mb-2">
                                <Euro className="w-4 h-4 text-gray-500" />
                                <span className="text-xl font-bold">€{price.price.toFixed(2)}</span>
                                {price === searchResult.cheapestPrice && (
                                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                                    Goedkoopst
                                  </Badge>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => window.open(price.url, '_blank')}
                                >
                                  <Search className="w-4 h-4 mr-1" />
                                  Bekijk
                                </Button>
                                <Button 
                                  size="sm"
                                  onClick={() => window.open(price.url, '_blank')}
                                  disabled={price.availability === 'out_of_stock'}
                                >
                                  <ShoppingCart className="w-4 h-4 mr-1" />
                                  Bestel
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>

              {/* Summary */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Laagste prijs</p>
                      <p className="text-lg font-bold text-blue-900">
                        €{Math.min(...searchResult.prices.map(p => p.price)).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Hoogste prijs</p>
                      <p className="text-lg font-bold text-blue-900">
                        €{Math.max(...searchResult.prices.map(p => p.price)).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Potentiële besparing</p>
                      <p className="text-lg font-bold text-green-600">
                        €{(Math.max(...searchResult.prices.map(p => p.price)) - Math.min(...searchResult.prices.map(p => p.price))).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-8">
              <Button onClick={handleSearch} disabled={loading}>
                <Search className="w-4 h-4 mr-2" />
                Zoek in webshops
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
