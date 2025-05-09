/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{html,tsx}"],
  theme: {
    extend: {
      keyframes: {
        slideIn: {
          "0%": { transform: "translateX(100px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "toast-in": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "toast-out": {
          "0%": { transform: "translateY(0)", opacity: "1" },
          "100%": { transform: "translateY(-100%)", opacity: "0" },
        },
        panLeft: {
          "0%": { objectPosition: "0px 0px" },
          "100%": { objectPosition: "-200px 0px" },
        },
        panRight: {
          "0%": { objectPosition: "-200px 0px" },
          "100%": { objectPosition: "0px 0px" },
        },
        panCenterFromLeft: {
          "0%": { objectPosition: "-200px 0" },
          "100%": { objectPosition: "0 0" },
        },
        panCenterFromRight: {
          "0%": { objectPosition: "200px 0" },
          "100%": { objectPosition: "0 0" },
        },
      },
      animation: {
        "slide-in": "slideIn 0.5s ease-out forwards",
        "toast-in": "toast-in 0.5s ease-out forwards",
        "toast-out": "toast-out 0.5s ease-in forwards",
        panLeft: "panLeft 0.5s ease-in-out forwards",
        panRight: "panRight 0.5s ease-in-out forwards",
        centerL: "panCenterFromLeft  0.5s ease-out forwards",
        centerR: "panCenterFromRight 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
};
