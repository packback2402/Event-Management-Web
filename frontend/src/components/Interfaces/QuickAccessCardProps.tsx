import type { LucideIcon } from "lucide-react";

// QuickAccessCard
export interface QuickAccessCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    buttonText: string;
    to: string;

}