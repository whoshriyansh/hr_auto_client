"use client";

import * as React from "react";
import Script from "next/script";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Rocket,
  CreditCard,
  Calendar,
  CheckCircle2,
  Loader2,
  ExternalLink,
  PartyPopper,
} from "lucide-react";
import { waitlistServices } from "@/lib/services/Waitlist.services";
import { toast } from "sonner";

type EarlyAccessDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  name: string;
  phone: string;
  price: number | null;
};

export function EarlyAccessDialog({
  open,
  onOpenChange,
  email,
  name,
  phone,
  price,
}: EarlyAccessDialogProps) {
  const [step, setStep] = React.useState<"offer" | "processing" | "success">(
    "offer",
  );
  const [calBookingUrl, setCalBookingUrl] = React.useState("");
  const [razorpayLoaded, setRazorpayLoaded] = React.useState(false);

  const handlePayment = async () => {
    if (!razorpayLoaded || !window.Razorpay) {
      toast.error("Payment gateway is loading. Please try again in a moment.");
      return;
    }

    try {
      setStep("processing");

      // Check if already paid before creating order
      try {
        const checkRes = await waitlistServices.checkEmail(email);
        if (
          checkRes.data.entry &&
          (checkRes.data.entry.status === "paid" ||
            checkRes.data.entry.status === "approved")
        ) {
          // Already paid — go straight to success
          const configRes = await waitlistServices.getPlatformConfig();
          setCalBookingUrl(configRes.data.calBookingUrl);
          setStep("success");
          toast.success("You already have early access!");
          return;
        }
      } catch {
        // Check failed — continue with payment
      }

      const orderRes = await waitlistServices.createPaymentOrder(email);
      const { orderId, amount, currency, keyId } = orderRes.data;

      const options: RazorpayOptions = {
        key: keyId,
        amount,
        currency,
        name: "HR Auto",
        description: "Early Access — HR Auto Platform",
        order_id: orderId,
        handler: async (response) => {
          try {
            const verifyRes = await waitlistServices.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            const bookingUrl = verifyRes.data.calBookingUrl;
            setCalBookingUrl(bookingUrl);
            setStep("success");
            toast.success("Payment successful! Welcome aboard.");
          } catch {
            toast.error("Payment verification failed. Please contact support.");
            setStep("offer");
          }
        },
        prefill: {
          name,
          email,
          contact: phone,
        },
        theme: {
          color: "#7c3aed",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        toast.error("Payment failed. Please try again.");
        setStep("offer");
      });
      rzp.open();
    } catch (err: unknown) {
      // Handle 400 — likely already paid
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        (err as { response?: { status?: number } }).response?.status === 400
      ) {
        try {
          const configRes = await waitlistServices.getPlatformConfig();
          setCalBookingUrl(configRes.data.calBookingUrl);
          setStep("success");
          toast.info("You already have early access!");
          return;
        } catch {
          // fallthrough
        }
      }
      toast.error("Could not initiate payment. Please try again.");
      setStep("offer");
    }
  };

  const earlyAccessPerks = [
    "Full platform access before public launch",
    "1-on-1 onboarding call with the founding team",
    "Priority support & feature requests",
    "Locked-in founding member pricing forever",
    "Shape the product with direct feedback",
  ];

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
      />
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          {step === "offer" && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-center mb-2">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Rocket className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <DialogTitle className="text-center text-xl">
                  Get Early Access
                </DialogTitle>
                <DialogDescription className="text-center">
                  You&apos;re on the waitlist! Skip the line and get instant
                  access.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div className="rounded-lg border bg-card p-4 text-center">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold">
                      ₹{price ?? "..."}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      one-time
                    </span>
                  </div>
                  <Badge variant="secondary" className="mt-2">
                    Limited spots available
                  </Badge>
                </div>

                <ul className="space-y-2.5">
                  {earlyAccessPerks.map((perk, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col gap-2 pt-2">
                  <Button onClick={handlePayment} size="lg" className="w-full">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay ₹{price ?? "..."} & Get Access
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onOpenChange(false)}
                    className="text-muted-foreground"
                  >
                    I&apos;ll wait for the public launch
                  </Button>
                </div>
              </div>
            </>
          )}

          {step === "processing" && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">
                Initiating payment gateway...
              </p>
            </div>
          )}

          {step === "success" && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-center mb-2">
                  <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <PartyPopper className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <DialogTitle className="text-center text-xl">
                  Welcome to HR Auto!
                </DialogTitle>
                <DialogDescription className="text-center">
                  Payment successful. Book your onboarding call to get started.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-3 mt-4">
                {calBookingUrl && (
                  <Button size="lg" className="w-full" asChild>
                    <a
                      href={calBookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Your Onboarding Call
                      <ExternalLink className="h-3 w-3 ml-2" />
                    </a>
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    onOpenChange(false);
                    setStep("offer");
                  }}
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
