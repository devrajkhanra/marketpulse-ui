# MarketPulse: Next.js Application Blueprint

## 1. Overview

This document outlines the architectural and feature blueprint for the MarketPulse Next.js frontend. The application serves as a client to the NestJS MarketPulse backend, providing a rich, interactive user interface for fetching, analyzing, and visualizing daily data from the National Stock Exchange of India (NSE). It aims to deliver a seamless user experience for traders, developers, and financial analysts.

## 2. Design and UX Philosophy

The application will adhere to modern design principles to ensure a beautiful, intuitive, and accessible user experience.

- **Aesthetics**: Create a visually engaging interface using a modern component library, a balanced layout, clean spacing, and polished styles. The design will incorporate a vibrant color palette, expressive typography, and subtle textures to create a premium feel.
- **Iconography & Visuals**: Use meaningful and interactive icons (`lucide-react`) to enhance user understanding and navigation. All visuals, including placeholder images, will be relevant and high-quality.
- **Interactivity**: All interactive elements (buttons, forms, charts) will provide clear visual feedback, including loading states, "glow" effects, and smooth animations to create a dynamic user experience.
- **Responsiveness**: The application will be fully responsive, ensuring a seamless experience across mobile, tablet, and desktop devices.
- **Accessibility (A11Y)**: Implement a11y best practices to empower all users, regardless of ability.

## 3. System Architecture

The frontend is a Next.js application using the App Router, with a clear and scalable project structure.

- **/src/app**: Houses the file-based routing, including pages, layouts, and loading/error components.
- **/src/components**: Contains reusable UI components, organized by feature (`/charts`, `/layout`) and type (`/ui`).
- **/src/lib**: Includes utility functions (`/utils`) and the API service layer (`/api`) for communicating with the backend.
- **/src/context**: Manages global state, such as the download progress, using React Context.

## 4. Current Implementation & Features

This section documents the features that have already been implemented.

- **Foundational Setup**:
  - **Next.js**: Project initialized with the App Router.
  - **Styling**: Tailwind CSS for styling, with `shadcn/ui` for the component library (`Card`, `Button`, `Calendar`, `Progress`, `Toast`).
  - **Icons**: `lucide-react` for iconography.
- **Core Layout (`/src/components/layout`)**:
  - A persistent `Sidebar` for navigation between application pages.
  - The root `layout.tsx` integrates the sidebar, main content area, and global providers.
- **Global Download Management**:
  - **`DownloadContext`**: A global React context (`/src/context/DownloadContext.tsx`) manages the state of file downloads across the entire application.
  - **`DownloadProvider`**: Wraps the root layout to provide download state and functions to all components.
  - **Persistent Progress**: Users can navigate away from the download page without interrupting the download process.
  - **Sidebar Indicator**: The sidebar displays an animated loader icon when downloads are in progress, providing global feedback.
- **Download Page (`/app/download`)**:
  - **`DownloadClient.tsx`**: A client component that provides the full UI and logic for downloads.
  - **Date Selection**: Users can select a single date or a date range. Weekends are disabled.
  - **Selected Dates List**: A dynamic list shows currently selected dates, with the option to remove them individually.
  - **Progress Visualization**: Once a download is initiated, a progress section appears, showing a distinct progress bar for each file.
  - **Status Updates**: Each file's status is indicated with an icon (in-progress, success, or error).
  - **Toast Notifications**: A toast message appears for each successfully completed download.

## 5. Future Plan & Next Steps

This section outlines the plan for implementing the remaining features based on the backend's capabilities.

- **API Service Layer (`/src/lib/api.ts`)**:
  - Finalize the API service to include functions for all backend endpoints:
    - `getSectorPerformance(date: string)`
    - `getSectorVolumeRatio(currentDate: string, previousDate: string)`
    - `getTopGainersLosers(date?: string)`
    - `getStockVolumeDifferences(dates: string[])`
- **Dashboard / Home Page (`/app/page.tsx`)**:
  - Create a main dashboard that provides a high-level "Market Overview."
  - **Implementation**:
    - Fetch and display the top 5 Nifty 50 gainers and losers using the `getTopGainersLosers` endpoint.
    - Fetch and display the top 5 gaining and losing sectors using the `getSectorPerformance` endpoint.
    - Present this data in clean, easy-to-read cards.
- **Sectors Page (`/app/sectors/page.tsx`)**:
  - Develop a dedicated page for in-depth sector analysis.
  - **Implementation**:
    - **Sector Performance**: Add a date picker to allow users to select a date. Fetch and display the top 5 gaining and losing sectors for that date in a table.
    - **Sector Volume Analysis**: Add a date range picker. Fetch and display the top 5 sectors with the highest and lowest volume ratios using bar charts for clear visualization.
- **Stocks Page (`/app/stocks/page.tsx`)**:
  - Develop a dedicated page for Nifty 50 stock analysis.
  - **Implementation**:
    - **Stock Performance**: Add a date picker to fetch and display the top 5 Nifty 50 gainers and losers.
    - **Stock Volume Analysis**: Add a date range picker. Fetch and display the volume differences for Nifty 50 stocks in a data table.
