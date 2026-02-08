/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: "class",
    content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
    prefix: "",
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            fontFamily: {
                fredoka: ["Fredoka", "sans-serif"],
            },
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                sidebar: {
                    DEFAULT: "hsl(var(--sidebar-background))",
                    foreground: "hsl(var(--sidebar-foreground))",
                    primary: "hsl(var(--sidebar-primary))",
                    "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
                    accent: "hsl(var(--sidebar-accent))",
                    "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
                    border: "hsl(var(--sidebar-border))",
                    ring: "hsl(var(--sidebar-ring))",
                },
                // LoopLearn custom colors
                loop: {
                    blue: "hsl(var(--loop-blue))",
                    green: "hsl(var(--loop-green))",
                    yellow: "hsl(var(--loop-yellow))",
                    purple: "hsl(var(--loop-purple))",
                    pink: "hsl(var(--loop-pink))",
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
                "2xl": "1.5rem",
                "3xl": "2rem",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
                float: {
                    "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
                    "25%": { transform: "translateY(-10px) rotate(2deg)" },
                    "50%": { transform: "translateY(-5px) rotate(0deg)" },
                    "75%": { transform: "translateY(-15px) rotate(-2deg)" },
                },
                "bounce-slow": {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-20px)" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                float: "float 6s ease-in-out infinite",
                "float-delayed": "float 6s ease-in-out infinite 1.5s",
                "float-delayed-2": "float 6s ease-in-out infinite 3s",
                "float-delayed-3": "float 6s ease-in-out infinite 4.5s",
                "bounce-slow": "bounce-slow 3s ease-in-out infinite",
            },
            boxShadow: {
                'glow-green': '0 0 40px hsl(142 71% 58% / 0.3)',
                'glow-blue': '0 0 40px hsl(217 91% 53% / 0.3)',
                'glow-yellow': '0 0 40px hsl(48 96% 53% / 0.3)',
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
