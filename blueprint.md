# MarketPulse: Next.js Application Blueprint

## 1. Overview

This document outlines the architectural and feature blueprint for the MarketPulse Next.js frontend. The application serves as a client to the NestJS MarketPulse backend, providing a rich, interactive user interface for fetching, analyzing, and visualizing daily data from the National Stock Exchange of India (NSE). It aims to deliver a seamless user experience for traders, developers, and financial analysts.

## 2. Design and UX Philosophy

The application will adhere to modern design principles to ensure a beautiful, intuitive, and accessible user experience.

- **Aesthetics**: Create a visually engaging interface using modern components, a balanced layout, clean spacing, and polished styles. The design will incorporate a vibrant color palette, expressive typography, and subtle textures to create a premium feel.
- **Iconography & Visuals**: Use meaningful icons and visuals from the `lucide-react` library to enhance user understanding and navigation. All visuals, including placeholder images, will be relevant and high-quality.
- **Interactivity**: All interactive elements (buttons, forms, charts) will provide clear visual feedback, including loading states and smooth transitions to create a dynamic user experience.
- **Responsiveness**: The application will be fully responsive, ensuring a seamless experience across mobile, tablet, and desktop devices.
- **Accessibility (A11Y)**: Implement a11y best practices to empower all users, regardless of ability.

## 3. System Architecture

The frontend is a Next.js application using the App Router, with a clear and scalable project structure.

- **/src/app**: Houses the file-based routing, including pages, layouts, and loading/error components.
- **/src/components**: Contains reusable UI components, organized by feature.
- **/src/lib**: Includes utility functions (`/utils`) and the API service layer (`/api`) for communicating with the backend.
- **/src/context**: Manages global state, such as the download progress, using React Context.

## 4. Code Refactoring: Removal of Tailwind CSS

This section documents the recent refactoring to remove Tailwind CSS and its related dependencies from the project.

- **Styling Strategy**: The project has transitioned from Tailwind CSS to **CSS Modules**. Each component now has a corresponding `.css` or `.module.css` file, ensuring styles are scoped and preventing global style conflicts.
- **Dependency Removal**: The following dependencies have been removed:
    - `tailwindcss`
    - `postcss`
    - `autoprefixer`
    - `shadcn/ui` components
- **Component Refactoring**: All components, including `DownloadClient` and the main `Home` page, have been refactored to use the new CSS Module-based styling approach instead of Tailwind's utility classes. The `ui` directory containing `shadcn/ui` components has been deleted.

## 5. Current Implementation & Features

This section documents the features that have already been implemented.

- **Foundational Setup**:
  - **Next.js**: Project initialized with the App Router.
  - **Styling**: **CSS Modules** for component-level styling.
- **Core Layout (`/src/components/layout`)**:
  - The root layout is a three-column grid defined in `Home.module.css`.
  - **`Sidebar.tsx`**: A persistent left sidebar for navigation, using `lucide-react` for icons.
  - **Main Content**: A central, scrollable area for page content.
  - **`Aside.tsx`**: A right-hand aside for displaying supplementary information like recent activity and quick links.
- **Global Download Management**:
  - **`DownloadContext`**: A global React context (`/src/context/DownloadContext.tsx`) manages the state of file downloads across the entire application.
  - **`DownloadProvider`**: Wraps the root layout to provide download state and functions to all components.
  - **Persistent Progress**: Users can navigate away from the download page without interrupting the download process.
  - **Sidebar Indicator**: The sidebar displays an indicator when downloads are in progress, providing global feedback.
- **Download Page (`/app/download`)**:
  - **`DownloadClient.tsx`**: A client component that provides the full UI and logic for downloads.
  - **Date Selection**: Users can select a single date or a date range. Weekends are disabled.
  - **Selected Dates List**: A dynamic list shows currently selected dates, with the option to remove them individually.
  - **Progress Visualization**: Once a download is initiated, a progress section appears, showing a distinct progress bar for each file.
  - **Status Updates**: Each file's status is indicated with an icon (in-progress, success, or error).
- **Dashboard / Home Page (`/app/page.tsx`)**:
  - Provides a high-level "Market Overview."
  - Displays the top 5 Nifty 50 gainers and losers.
  - Displays the top 5 gaining and losing sectors.
  - Data is presented in clean, easy-to-read cards.
- **Sectors Page (`/app/sectors`)**:
  - A dedicated page for in-depth sector analysis.
  - **Sector Performance**: A date picker allows users to select a date and view the top 5 gaining and losing sectors in a table.
  - **Sector Volume Analysis**: A date range picker allows users to select a date range and view the top 5 sectors with the highest and lowest volume ratios in bar charts.
- **Stocks Page (`/app/stocks`)**:
  - A dedicated page for Nifty 50 stock analysis.
  - **Stock Performance**: A date picker allows users to fetch and display the top 5 Nifty 50 gainers and losers.
  - **Stock Volume Analysis**: A date range picker allows users to fetch and display the volume differences for Nifty 50 stocks in a data table.

## 6. Deployment

The application is now feature-complete and ready for deployment.

- **Build**: The Next.js application will be built for production using `npm run build`.
- **Deploy**: The application will be deployed to Firebase Hosting.
