import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface SendWhatsAppButtonProps {
  to: string;
  className?: string;
  children?: React.ReactNode;
}

interface WhatsAppResponse {
  messaging_product: string;
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string;
  }>;
}

export function SendWhatsAppButton({ 
  to, 
  className = "", 
  children 
}: SendWhatsAppButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleSendWhatsApp = async () => {
    if (!to) {
      toast({
        title: "Fout",
        description: "Geen telefoonnummer opgegeven",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: { to }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      const response = data as WhatsAppResponse;
      
      if (response?.messages?.length > 0) {
        toast({
          title: "Succes",
          description: "WhatsApp bericht succesvol verzonden",
        });
      } else {
        throw new Error("Geen bericht ID ontvangen");
      }

    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      toast({
        title: "Fout",
        description: "Kon WhatsApp bericht niet verzenden. Probeer opnieuw.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSendWhatsApp}
      disabled={isLoading || !to}
      className={`bg-green-600 hover:bg-green-700 text-white ${isMobile ? 'min-h-[44px]' : ''} ${className}`}
      size={isMobile ? "default" : "sm"}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <MessageCircle className="w-4 h-4 mr-2" />
      )}
      {children || (isMobile ? "WhatsApp" : "Verzend WhatsApp")}
    </Button>
  );
}