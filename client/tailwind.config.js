/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // "Time Tailor" palette - inspired by a tailor's workroom:
        // ink charcoal, brass hardware, chalk cream, and thread-red for alerts.
        ink: {
          950: "#15171C",
          900: "#1C1F26",
          800: "#262A33",
          700: "#343943",
          600: "#4A505C",
        },
        brass: {
          400: "#D9B978",
          500: "#C9A15A",
          600: "#AE8646",
        },
        chalk: {
          50: "#FAF8F4",
          100: "#F3EFE7",
          200: "#E8E1D3",
        },
        thread: {
          500: "#C1553D",
          600: "#A8432E",
        },
        moss: {
          500: "#5C7A5E",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        sans: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        soft: "0 2px 12px rgba(21, 23, 28, 0.06)",
        card: "0 1px 3px rgba(21, 23, 28, 0.08), 0 1px 2px rgba(21,23,28,0.04)",
      },
    },
  },
  plugins: [],
};
