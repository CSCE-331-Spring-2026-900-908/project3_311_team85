# System Architecture Diagram

```mermaid
graph TB
    %% User Layer
    User[User/Client] --> Browser[Web Browser]
    
    %% Frontend Layer
    Browser --> Frontend[Frontend - React App]
    Frontend --> |Vite Dev Server| Frontend
    Frontend --> |React Router DOM| Pages[React Pages]
    
    Pages --> Portal[Portal.jsx]
    Pages --> ManagerView[ManagerView.jsx]
    Pages --> CashierView[CashierView.jsx]
    Pages --> CustomerKiosk[CustomerKiosk.jsx]
    Pages --> MenuBoard[MenuBoard.jsx]
    Pages --> LoginView[LoginView.jsx]
    
    %% Backend Layer
    Frontend --> |HTTP Requests| Backend[Backend - Express Server]
    Backend --> |Express 5.2.1| Backend
    
    %% Authentication Layer
    Backend --> Auth[Authentication Layer]
    Auth --> |Passport 0.7.0| Passport
    Auth --> |Express Session| Session[Session Management]
    Auth --> |Google OAuth20| GoogleOAuth[Google OAuth 2.0]
    
    GoogleOAuth --> Google[Google OAuth Provider]
    
    %% API Layer
    Backend --> API[RESTful API Endpoints]
    API --> |GET/POST| AuthRoutes[/auth/* routes]
    API --> |GET/POST| MenuRoutes[/api/menu, /api/inventory]
    API --> |GET| StatusRoute[/api/auth/status]
    
    %% Database Layer
    Backend --> |pg 8.20.0| DB[(PostgreSQL Database)]
    DB --> TAMU_DB[TAMU Database Server<br/>csce-315-db.engr.tamu.edu:5432]
    
    %% Database Tables
    TAMU_DB --> Tables[Database Tables]
    Tables --> Inventory[Inventory Table]
    Tables --> Menu[Menu Table]
    
    %% External Services
    Backend --> |Axios 1.14.0| External[External Services]
    External --> |@google/generative-ai| AI[Google Generative AI<br/>Chatbot API]
    
    %% Development Tools
    DevTools[Development Tools]
    DevTools --> Vite[Vite 8.0.1<br/>Build Tool]
    DevTools --> ESLint[ESLint<br/>Code Linting]
    DevTools --> Concurrently[Concurrently 9.2.1<br/>Run Multiple Scripts]
    DevTools --> Dotenv[Dotenv 17.4.1<br/>Environment Variables]
    
    %% Styling
    classDef frontend fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef backend fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef database fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef external fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    classDef devtools fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    
    class Frontend,Pages,Portal,ManagerView,CashierView,CustomerKiosk,MenuBoard,LoginView frontend
    class Backend,Auth,Passport,Session,GoogleOAuth,API,AuthRoutes,MenuRoutes,StatusRoute backend
    class DB,TAMU_DB,Tables,Inventory,Menu database
    class Google,AI,External external
    class DevTools,Vite,ESLint,Concurrently,Dotenv devtools
```

## Data Flow

### 1. **User Authentication Flow**
```
User Browser -> React LoginView -> Google OAuth -> Backend Auth -> Session Management -> Authorized Pages
```

### 2. **Data Access Flow**
```
React Pages -> API Endpoints -> Express Server -> PostgreSQL Database -> Return Data
```

### 3. **AI Chatbot Flow**
```
React Pages -> Backend API -> Google Generative AI -> Response -> Frontend
```

## Key Components

### **Frontend Stack**
- **React 19.2.4** - Component-based UI framework
- **React Router DOM 7.13.2** - Client-side routing
- **Vite 8.0.1** - Fast development server and build tool

### **Backend Stack**
- **Node.js + Express 5.2.1** - RESTful API server
- **Passport 0.7.0** - Authentication middleware
- **Express Session 1.19.0** - Session management

### **Database**
- **PostgreSQL (pg 8.20.0)** - Primary database
- **TAMU Database Server** - Hosted at `csce-315-db.engr.tamu.edu:5432`
- **Tables**: `inventory`, `menu`

### **Authentication**
- **Google OAuth 2.0** - Third-party authentication
- **Authorized Users List** - Email-based access control
- **Session-based Auth** - Persistent user sessions

### **External Services**
- **Google Generative AI** - AI chatbot functionality
- **Google OAuth Provider** - User authentication

### **Development Tools**
- **Concurrently** - Run frontend and backend together
- **ESLint** - Code quality and consistency
- **Dotenv** - Environment variable management
