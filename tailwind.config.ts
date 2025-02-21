import {nextui} from '@nextui-org/theme';
import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/components/modal.js"
  ],
  theme: {
    extend: {
      colors: {
        base: "#FAFAFA",
        light: "#ECECEC",
        dark: "#1D1D21",
        gray: "#DBDBDB",
        road: "#424242",
        roadLine: "#C7C7C7",
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        default: "IaCartoonerie",
      },
    },
  },
  plugins: [nextui()],
} satisfies Config;
