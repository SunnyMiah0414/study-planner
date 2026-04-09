import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, BookOpen, Calendar, Target, Bell, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Subjects", href: "/subjects", icon: BookOpen },
  { name: "Sessions", href: "/sessions", icon: Calendar },
  { name: "Goals", href: "/goals", icon: Target },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex items-center w-14 h-7 rounded-full p-1 transition-colors duration-300 focus:outline-none"
      style={{ backgroundColor: isDark ? "#2563eb" : "#e2e8f0" }}
      aria-label="Toggle dark mode"
    >
      <motion.div
        className="w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center"
        animate={{ x: isDark ? 28 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.span
              key="moon"
              initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
              transition={{ duration: 0.15 }}
            >
              <Moon className="w-3 h-3 text-primary" />
            </motion.span>
          ) : (
            <motion.span
              key="sun"
              initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
              transition={{ duration: 0.15 }}
            >
              <Sun className="w-3 h-3 text-yellow-500" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </button>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border/60 bg-card/50 backdrop-blur-xl shrink-0 fixed h-full z-10">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-3 font-display font-bold text-xl text-primary cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white shadow-md shadow-primary/20">
              <BookOpen className="w-4 h-4" />
            </div>
            Planner
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href} className="block">
                <div className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer relative group
                  ${isActive ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'}
                `}>
                  {isActive && (
                    <motion.div
                      layoutId="active-nav"
                      className="absolute inset-0 bg-primary/10 rounded-xl"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                  <item.icon className={`w-5 h-5 z-10 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                  <span className="z-10">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-secondary border-2 border-white dark:border-card flex items-center justify-center shadow-sm">
              <span className="font-semibold text-sm text-foreground">SU</span>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground leading-none">Sunny</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:ml-64 min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-20 flex items-center justify-between p-4 bg-background/80 backdrop-blur-md border-b border-border/50">
          <Link href="/" className="flex items-center gap-2 font-display font-bold text-lg text-primary">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white">
              <BookOpen className="w-3 h-3" />
            </div>
            Planner
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex h-16 items-center justify-end gap-3 px-8 sticky top-0 z-20 bg-background/50 backdrop-blur-sm">
           <ThemeToggle />
           <Button variant="ghost" size="icon" className="rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
           </Button>
        </header>

        <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full pb-24 md:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border/50 px-6 py-3 flex justify-between items-center z-50 safe-area-bottom shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div className="flex flex-col items-center gap-1 cursor-pointer">
                <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}