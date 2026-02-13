/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enable class-based dark mode for light/dark theme switching
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}", // Include src directory if using components inside src
    // Add other directories if necessary
  ],
  theme: {
    extend: {
      colors: {
        // **Light Mode Background Color**
        // Used as the primary background color in light mode across the site, notably in globals.css
        // as the default body background and in ProductPage.module.css for the main container.
        // Provides a warm, off-white tone that complements the orange accents.
        'background-light': '#fefaf0',

        // **Primary Orange Color**
        // The main orange shade used extensively for text, buttons, borders, and accents across
        // multiple components like PromotionBanner.module.css (background), ProductWidget.module.css
        // (buttons and text), and globals.css (as --orange). Slightly different from the original
        // 'orange-500' (#F56600), this is the project's core branding color.
        'orange-500': '#fe5100',

        // **Darker Orange for Accents**
        // A darker orange shade used for hover states and darker accents, such as buttons in
        // ProductWidget.module.css on active states and in checkout.module.css for hover effects.
        // Previously defined as 'orange-600', retained here for consistency with existing usage.
        'orange-600': '#c85200',

        // **Orange for Hover Effects**
        // Specifically used in PromotionBanner.module.css for the hover state background,
        // providing a distinct darker orange for interactive feedback. Slightly lighter than
        // 'orange-600', it’s tailored for hover transitions.
        'orange-700': '#d86100',

        // **Light Orange for Gradients**
        // Appears in conic gradients across button hover effects (e.g., ProductWidget.module.css,
        // Navbar.module.css) and sale bubbles (ProductCard.module.css, ProductPage.module.css).
        // Adds a vibrant, medium-light orange to animated borders and decorative elements.
        'orange-light': '#ff7637',

        // **Lighter Orange for Gradients**
        // The lightest orange in conic gradients, used alongside 'orange-light' and 'orange-500'
        // in buttons (e.g., cartButton in ProductWidget.module.css) and sale bubbles
        // (ProductPage.module.css). Provides a subtle, pastel-like contrast in animations.
        'orange-lighter': '#ffceb7',

        // **Very Light Gray for Backgrounds**
        // Used for subtle background sections like the summary in page.module.css and
        // costBreakdown in checkout.module.css. Offers a clean, near-white backdrop for content.
        'gray-100': '#f9f9f9',

        // **Light Gray for Form Inputs and Backgrounds**
        // Applied to form input backgrounds in checkout.module.css and as a fallback for
        // read-only fields. Also matches var(--light-gray) in checkoutPage background,
        // providing a soft, neutral tone for interactive elements.
        'gray-200': '#f5f5f5',

        // **Light Gray for Scrollbars**
        // Used as the scrollbar track color in checkout.module.css and cart.module.css,
        // ensuring a consistent, unobtrusive scrollbar design across scrollable containers.
        'gray-300': '#f1f1f1',

        // **Light Gray for Color Bubbles**
        // Serves as the default background for color bubbles in page.module.css,
        // representing unselected or placeholder color options in the cart and checkout.
        'gray-400': '#f0f0f0',

        // **Light Gray for Borders**
        // A common border color for widgets and cards (e.g., ProductWidget.module.css,
        // ProductCard.module.css) and separators (e.g., orderItem in OrderConfirmation.module.css).
        // Provides a subtle outline for components.
        'gray-500': '#ddd',

        // **Another Light Gray for Borders**
        // Used for secondary borders and tooltips (e.g., colorTooltip in multiple files like
        // ProductPage.module.css), offering a slightly darker gray for additional contrast.
        'gray-600': '#ccc',

        // **Medium Gray for Strikethrough Text**
        // Applied to strikethrough prices in ProductWidget.module.css, ProductCard.module.css,
        // and page.module.css, indicating original prices before discounts with a muted tone.
        'gray-700': '#888',

        // **Dark Gray for Text**
        // Used for secondary text like offerEnds in ProductPage.module.css and partDescription,
        // providing a softer alternative to black for less prominent information.
        'gray-800': '#555',

        // **Darker Gray for Text**
        // A dark gray for primary text content, such as termsText in TermsAndConditionsPopup.module.css,
        // product descriptions in ProductPage.module.css, and confirmDialog text in multiple files.
        // Balances readability with a non-black aesthetic.
        'gray-900': '#333',

        // **Blue for Text and Accents**
        // Defined as var(--blue) in checkout.module.css, used for headers, labels, and total displays.
        // A standard, vibrant blue that contrasts with orange for key informational elements.
        'text-blue': '#007bff',

        // **Red for Error Messages**
        // Used for error messages (e.g., error class in page.module.css, checkout.module.css)
        // and debugging borders (colorBubble in page.module.css). A classic red for alerts and emphasis.
        'error-red': '#dc3545',

        // **Gray for Disabled States**
        // Represents disabled buttons in checkout.module.css (e.g., checkoutPrimaryButton:disabled),
        // providing a muted, neutral gray to indicate inactivity.
        'gray-disabled': '#6c757d',

        // **Dark Mode Background Color**
        // The primary background color in dark mode, used for the overall site background and
        // darker highlights, offering a deep, rich navy tone for contrast with lighter elements.
        'dark-navy': '#1A1A2E',

        // **Popup and Button Background in Dark Mode**
        // Used for popup backgrounds and button backgrounds in dark mode, providing a slightly
        // lighter navy-purple shade that pairs with 'dark-navy' for depth.
        'popup-bg': '#30306e',

        // **Accent Blue for Dark Mode**
        // Applied to button borders and some text in dark mode, this bright blue adds a pop of color
        // for interactive elements against the darker background.
        'accent-blue': '#24b6ff',

        // **Highlight Blue for Dark Mode**
        // A lighter blue for highlights in dark mode, used to draw attention to specific areas
        // with a soft, glowing effect.
        'highlight-blue': '#73d3fa',

        // **Border Blue for Dark Mode**
        // Used for borders and text in dark mode, this medium blue provides a distinct outline
        // and readability against dark backgrounds.
        'border-blue': '#5a7dff',

        // **Standard White**
        // Commonly used for text (e.g., buttons in ProductWidget.module.css, backgrounds in
        // ProductCard.module.css) and in gradients. As a standard color, it’s included for completeness.
        'white': '#ffffff',

        // **Standard Black**
        // Used for text (e.g., #000 in some files) and borders (e.g., colorBubble in
        // ProductPage.module.css). Included as a standard color for flexibility.
        'black': '#000000',
      },
      fontFamily: {
        'geist-sans': ['"Geist Sans"', 'Arial', 'sans-serif'],
        'geist-mono': ['"Geist Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};