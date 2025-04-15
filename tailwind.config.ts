import { type Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ["Degular Variable", "sans-serif"], // For headings
        sans: ["IBM Plex Sans", "sans-serif"], // For body text
      },
      fontWeight: {
        bold: "700",
        semibold: "600",
        regular: "400",
        lightItalic: "300 italic",
      },
      fontSize: {
        "2xs": "0.5rem",
        xs: "0.75rem",
        sm: "0.875rem",
        base: "1rem",
        lg: "1.125rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem",
        "4xl": "2.25rem",
        "5xl": "3rem",
        "6xl": "4rem",
        header: "4.2rem",
      },
      colors: {
        primary: {
          100: "#ffffff", // Pure white (lighter than #f2f2f2)
          200: "#fcfcfc", // Very light gray
          300: "#f9f9f9", // Lighter gray
          400: "#f5f5f5", // Light gray
          500: "#f2f2f2", // Your primary color
          600: "#e6e6e6", // Slightly darker
          700: "#cccccc", // Medium gray
          800: "#b3b3b3", // Darker gray
          900: "#999999", // Dark gray
          950: "#666666", // Very dark gray
        },
        secondary: {
          50: "#e5e5f2", // Very light version of the primary color
          100: "#ccccea", // Lighter
          200: "#b3b3e0", // Light
          300: "#9999d6", // Soft light
          400: "#8080cc", // Slightly lighter than base
          500: "#6666b3", // Base tone
          600: "#3A397E", // Your primary color
          700: "#2e2d66", // Darker
          800: "#22224d", // Even darker
          900: "#171733", // Very dark
          950: "#0b0b1a", // Near black
        },
        highlight: {
          50: "#efefff", // Very light version of the highlight color
          100: "#dfdfff", // Lighter
          200: "#bfbffc", // Light
          300: "#9f9ffc", // Soft light
          400: "#8080fc", // Slightly lighter than base
          500: "#5f5ffc", // Base tone
          600: "#7371fc", // Your primary highlight color
          700: "#5b5bcc", // Darker
          800: "#454599", // Even darker
          900: "#303066", // Very dark
          950: "#1a1a33", // Near black
        },
        neutral: {
          50: "#fcfaff", // Very light version of the highlight color
          100: "#faf5ff", // Lighter
          200: "#f0eaff", // Light
          300: "#e0d5ff", // Soft light
          400: "#d0bfff", // Slightly lighter than base
          500: "#c0aaff", // Base tone
          600: "#f5efff", // Your primary highlight color
          700: "#b090ff", // Darker
          800: "#8a66cc", // Even darker
          900: "#654c99", // Very dark
          950: "#403266", // Near black
        },
        success: {
          50: "#defff5",
          100: "#b4fae3",
          200: "#88f5d1",
          300: "#5bf1bf",
          400: "#31edad",
          500: "#1bd393",
          600: "#0ea473",
          700: "#037552",
          800: "#004730",
          900: "#00190e",
        },
        danger: {
          50: "#ffeedc",
          100: "#ffd1af",
          200: "#feb381",
          300: "#fc9650",
          400: "#f9791f",
          500: "#e05f06",
          600: "#af4a02",
          700: "#7d3400",
          800: "#4d1f00",
          900: "#1f0800",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
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
      },
      boxShadow: {
        "custom-bottom-right": "4px 4px 8px rgba(0, 0, 0, 0.25)",
        "custom-bottom-left": "-4px 8px 8px rgba(0, 0, 0, 0.25)",
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0", overflow: "hidden" },
          to: {
            height: "var(--radix-accordion-content-height)",
            overflow: "visible",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
            overflow: "visible",
          },
          to: { height: "0", overflow: "hidden" },
        },
        slideDownAndFade: {
          from: { opacity: "0", transform: "translateY(-2px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideLeftAndFade: {
          from: { opacity: "0", transform: "translateX(2px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        slideUpAndFade: {
          from: { opacity: "0", transform: "translateY(2px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideRightAndFade: {
          from: { opacity: "0", transform: "translateX(2px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        slideDownAndFade:
          "slideDownAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)",
        slideLeftAndFade:
          "slideLeftAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)",
        slideUpAndFade: "slideUpAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)",
        slideRightAndFade:
          "slideRightAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("tailwindcss-animate")],
} satisfies Config;
