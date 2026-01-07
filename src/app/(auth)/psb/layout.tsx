import { PSBSidebar } from "@/components/psb-sidebar";

export default function PSBLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-background text-foreground relative overflow-x-hidden">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-50 via-transparent to-teal-50/30 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900" />
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-normal" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-teal-500/10 dark:bg-teal-500/5 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-normal" />
            </div>

            <PSBSidebar />
            <div className="flex-1 md:ml-64 transition-all duration-300 ease-in-out relative z-10">
                <main className="p-4 md:p-8 pt-16 md:pt-8 min-h-screen max-w-7xl mx-auto animate-in fade-in duration-500">
                    {children}
                </main>
            </div>
        </div>
    );
}
