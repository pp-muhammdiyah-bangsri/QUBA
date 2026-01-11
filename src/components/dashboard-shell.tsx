"use client";

import { MobileSidebarProvider, MobileHeader, MobileOverlay } from "@/components/mobile-sidebar";
import { Sidebar } from "@/components/sidebar";
import { Role } from "@/types/database.types";
import { InstallPrompt } from "@/components/install-prompt";

interface DashboardShellProps {
    children: React.ReactNode;
    userRole: Role;
    userName: string;
}

export function DashboardShell({ children, userRole, userName }: DashboardShellProps) {
    return (
        <MobileSidebarProvider>
            <div className="flex h-screen bg-slate-50 dark:bg-gray-950 transition-colors duration-300">
                {/* Mobile Header */}
                <MobileHeader />

                {/* Mobile Overlay */}
                <MobileOverlay />

                <InstallPrompt />

                {/* Sidebar */}
                <Sidebar userRole={userRole} userName={userName} />

                {/* Main Content */}
                <main className="flex-1 overflow-auto md:ml-0">
                    {/* Add top padding on mobile for the fixed header */}
                    <div className="p-2 sm:p-4 md:p-6 pt-16 md:pt-6">
                        {children}
                    </div>
                </main>
            </div>
        </MobileSidebarProvider>
    );
}
