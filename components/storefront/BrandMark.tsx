import { cn } from "@/lib/cn";

type BrandMarkProps = {
  size?: "sm" | "md" | "lg" | "splash";
  showSubtitle?: boolean;
  subtitle?: string;
  className?: string;
  subtitleClassName?: string;
};

const sizeClasses: Record<NonNullable<BrandMarkProps["size"]>, string> = {
  sm: "text-[1.35rem]",
  md: "text-[1.65rem]",
  lg: "text-[clamp(2rem,1.5rem+2vw,3rem)]",
  splash: "text-[clamp(2.4rem,9vw,3.4rem)]"
};

export default function BrandMark({
  size = "md",
  showSubtitle = true,
  subtitle = "WAHAJ",
  className,
  subtitleClassName
}: BrandMarkProps) {
  return (
    <div className={cn("inline-flex flex-col items-center text-center", className)}>
      <span className="shine-sweep-wrap">
        <span className={cn("wahaj-brand-wordmark font-thmanyah-display leading-none", sizeClasses[size])}>وهاج</span>
      </span>
      {showSubtitle ? (
        <span className={cn("wahaj-brand-subtitle font-thmanyah-text mt-1.5", subtitleClassName)}>{subtitle}</span>
      ) : null}
    </div>
  );
}
