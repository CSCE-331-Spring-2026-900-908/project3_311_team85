# Octagon Restaurant Management System

A modern React-based restaurant management system with multiple user interfaces for different roles including managers, cashiers, customers, and digital menu displays.

## Overview

Octagon is a comprehensive restaurant management solution built with React and Vite, featuring:

- **Manager Dashboard**: Inventory management and system administration
- **Cashier Terminal**: Point-of-sale interface for order processing
- **Customer Kiosk**: Self-service ordering interface for customers
- **Menu Board**: Digital display for menu items and weather information
- **Portal**: Central navigation hub for all interfaces

## Features

### User Interfaces
- **Responsive Design**: Optimized for different screen sizes and devices
- **Touch-Friendly**: Large buttons and intuitive navigation for touchscreen use
- **Real-time Updates**: Dynamic cart management and order processing
- **Weather Integration**: Live weather display on menu boards

### Technical Features
- **React Router**: Client-side navigation between interfaces
- **State Management**: Local state for carts and inventory
- **Modern Styling**: Clean, professional design with consistent theming
- **Component Architecture**: Modular, reusable components

## Project Structure

```
src/
|-- App.jsx              # Main application component with routing
|-- main.jsx             # Application entry point
|-- pages/
|   |-- Portal.jsx       # Navigation hub for all interfaces
|   |-- ManagerView.jsx  # Inventory management dashboard
|   |-- CashierView.jsx  # POS interface for order processing
|   |-- CustomerKiosk.jsx # Self-service ordering interface
|   |-- MenuBoard.jsx    # Digital menu display with weather
|-- services/
|   |-- weatherService.js # Weather API integration
|-- assets/              # Static assets and images
```

## Getting Started

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd octagon
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint for code quality checks

## Usage

### Accessing Different Interfaces

1. **Portal Page** (`/`) - Main entry point with navigation cards
2. **Manager Interface** (`/manager`) - Inventory management dashboard
3. **Cashier Terminal** (`/cashier`) - POS system for order processing
4. **Customer Kiosk** (`/customer`) - Self-service ordering
5. **Menu Board** (`/menu-board`) - Digital menu display

### Interface Features

#### Manager Dashboard
- View inventory levels and stock status
- Monitor item availability
- Update inventory information
- Color-coded status indicators (Good, Low, Reorder)

#### Cashier Terminal
- Quick-add menu buttons for fast ordering
- Real-time order ticket management
- Order total calculation
- Void and submit order functionality

#### Customer Kiosk
- Touch-friendly menu grid layout
- Shopping cart management
- Order summary and checkout
- Large buttons for easy touchscreen use

#### Menu Board
- Featured menu items display
- Real-time weather information
- High contrast design for visibility
- Automatic weather refresh every 10 minutes

## Technology Stack

- **React 19** - Modern React with latest features
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing
- **Axios** - HTTP client for API requests
- **ESLint** - Code quality and style enforcement

## Development

### Code Style
- Comprehensive comments and documentation
- Component-based architecture
- Consistent naming conventions
- Modern JavaScript/ES6+ features

### Contributing
1. Follow existing code style and patterns
2. Add appropriate comments for new components
3. Test all interfaces before submitting changes
4. Ensure responsive design principles

## Future Enhancements

- Database integration for persistent data
- User authentication system
- Advanced inventory management features
- Payment processing integration
- Multi-language support
- Analytics and reporting dashboard

## License

This project is part of the CSCE 331 Spring 2026 course project.
