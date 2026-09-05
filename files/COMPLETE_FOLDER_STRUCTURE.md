# Complete MERN Project Folder Structure

```
dr-shivalika-platform/
│
├── 📁 client/                                  # Frontend React Application
│   ├── 📁 public/
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   └── manifest.json
│   │
│   ├── 📁 src/
│   │   ├── 📁 components/                      # Reusable Components
│   │   │   ├── 📁 common/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Button.jsx
│   │   │   │   └── Modal.jsx
│   │   │   │
│   │   │   ├── 📁 hero/
│   │   │   │   ├── HeroSection.jsx            # 3D Hero with Three.js
│   │   │   │   ├── ParticleEffect.jsx
│   │   │   │   └── ScrollIndicator.jsx
│   │   │   │
│   │   │   ├── 📁 profile/
│   │   │   │   ├── ProfileHeader.jsx
│   │   │   │   ├── ProfileAbout.jsx
│   │   │   │   ├── QualificationCard.jsx
│   │   │   │   └── StatsSection.jsx
│   │   │   │
│   │   │   ├── 📁 reviews/
│   │   │   │   ├── ReviewsSection.jsx
│   │   │   │   ├── ReviewCard.jsx
│   │   │   │   ├── RatingFilter.jsx
│   │   │   │   ├── ReviewModal.jsx
│   │   │   │   └── StarRating.jsx
│   │   │   │
│   │   │   ├── 📁 testimonials/
│   │   │   │   ├── TestimonialCarousel.jsx
│   │   │   │   ├── VideoPlayer.jsx
│   │   │   │   ├── TestimonialCard.jsx
│   │   │   │   ├── VideoUploadForm.jsx
│   │   │   │   └── ReviewSubmitModal.jsx
│   │   │   │
│   │   │   ├── 📁 experience/
│   │   │   │   ├── TimelineSection.jsx
│   │   │   │   ├── TimelineItem.jsx
│   │   │   │   ├── ExperienceCard.jsx
│   │   │   │   └── AchievementsBadge.jsx
│   │   │   │
│   │   │   ├── 📁 booking/
│   │   │   │   ├── BookingSection.jsx
│   │   │   │   ├── SlotSelector.jsx
│   │   │   │   ├── CalendarPicker.jsx
│   │   │   │   ├── ServiceSelector.jsx
│   │   │   │   ├── PatientForm.jsx
│   │   │   │   ├── OTPVerification.jsx
│   │   │   │   ├── BookingConfirmation.jsx
│   │   │   │   └── BookingStatusTracker.jsx
│   │   │   │
│   │   │   └── 📁 loading/
│   │   │       ├── Skeleton.jsx
│   │   │       ├── LoadingSpinner.jsx
│   │   │       └── ProgressBar.jsx
│   │   │
│   │   ├── 📁 pages/                          # Page Components
│   │   │   ├── HomePage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── BookingPage.jsx
│   │   │   ├── SuccessPage.jsx
│   │   │   ├── ErrorPage.jsx
│   │   │   ├── PrivacyPage.jsx
│   │   │   └── TermsPage.jsx
│   │   │
│   │   ├── 📁 hooks/                          # Custom React Hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useBooking.js
│   │   │   ├── useReviews.js
│   │   │   ├── useFetch.js
│   │   │   ├── useLocalStorage.js
│   │   │   ├── useInView.js
│   │   │   └── useMediaQuery.js
│   │   │
│   │   ├── 📁 context/                        # Context API
│   │   │   ├── AuthContext.jsx
│   │   │   ├── BookingContext.jsx
│   │   │   ├── ThemeContext.jsx
│   │   │   └── NotificationContext.jsx
│   │   │
│   │   ├── 📁 services/                       # API Services
│   │   │   ├── api.js                         # Axios instance & config
│   │   │   ├── authService.js
│   │   │   ├── profileService.js
│   │   │   ├── bookingService.js
│   │   │   ├── reviewService.js
│   │   │   ├── testimonialService.js
│   │   │   ├── uploadService.js
│   │   │   └── googleService.js               # Google Reviews API
│   │   │
│   │   ├── 📁 utils/                          # Utility Functions
│   │   │   ├── validators.js
│   │   │   ├── formatters.js
│   │   │   ├── constants.js
│   │   │   ├── helpers.js
│   │   │   ├── localStorage.js
│   │   │   ├── analytics.js
│   │   │   └── errorHandler.js
│   │   │
│   │   ├── 📁 styles/                         # Global Styles
│   │   │   ├── globals.css
│   │   │   ├── tailwind.config.js
│   │   │   ├── animations.css
│   │   │   └── themes.css
│   │   │
│   │   ├── 📁 assets/
│   │   │   ├── 📁 images/
│   │   │   ├── 📁 icons/
│   │   │   ├── 📁 videos/
│   │   │   └── 📁 animations/
│   │   │
│   │   ├── App.jsx                            # Main App Component
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   │
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js (if using Vite)
│   ├── README.md
│   └── .eslintrc.json
│
├── 📁 admin/                                   # Admin Dashboard (React)
│   ├── 📁 public/
│   ├── 📁 src/
│   │   ├── 📁 components/
│   │   │   ├── 📁 sidebar/
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── NavItem.jsx
│   │   │   │   └── ProfileWidget.jsx
│   │   │   │
│   │   │   ├── 📁 dashboard/
│   │   │   │   ├── StatCard.jsx
│   │   │   │   ├── ChartComponent.jsx
│   │   │   │   ├── RecentBookings.jsx
│   │   │   │   └── MetricsOverview.jsx
│   │   │   │
│   │   │   ├── 📁 tables/
│   │   │   │   ├── BookingsTable.jsx
│   │   │   │   ├── ReviewsTable.jsx
│   │   │   │   ├── PatientsTable.jsx
│   │   │   │   └── SlotsTable.jsx
│   │   │   │
│   │   │   ├── 📁 modals/
│   │   │   │   ├── EditProfileModal.jsx
│   │   │   │   ├── ApproveReviewModal.jsx
│   │   │   │   ├── ManageSlotsModal.jsx
│   │   │   │   └── UserPermissionsModal.jsx
│   │   │   │
│   │   │   ├── 📁 forms/
│   │   │   │   ├── ProfileForm.jsx
│   │   │   │   ├── ServiceForm.jsx
│   │   │   │   ├── SlotForm.jsx
│   │   │   │   └── AdminAccessForm.jsx
│   │   │   │
│   │   │   └── 📁 charts/
│   │   │       ├── RevenueChart.jsx
│   │   │       ├── BookingTrendChart.jsx
│   │   │       ├── RatingChart.jsx
│   │   │       └── PatientsChart.jsx
│   │   │
│   │   ├── 📁 pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ProfileManagement.jsx
│   │   │   ├── BookingManagement.jsx
│   │   │   ├── ReviewModeration.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── UserManagement.jsx
│   │   │   ├── ContentManagement.jsx
│   │   │   └── Settings.jsx
│   │   │
│   │   ├── 📁 hooks/
│   │   │   ├── useAdmin.js
│   │   │   ├── useDashboardData.js
│   │   │   └── useTablePagination.js
│   │   │
│   │   ├── 📁 context/
│   │   │   └── AdminContext.jsx
│   │   │
│   │   ├── 📁 services/
│   │   │   ├── adminService.js
│   │   │   ├── analyticsService.js
│   │   │   ├── moderationService.js
│   │   │   └── userService.js
│   │   │
│   │   ├── 📁 utils/
│   │   │   ├── dashboardHelpers.js
│   │   │   ├── reportGenerators.js
│   │   │   └── adminValidators.js
│   │   │
│   │   ├── 📁 styles/
│   │   │   ├── admin-globals.css
│   │   │   └── admin-theme.css
│   │   │
│   │   ├── App.jsx
│   │   └── index.js
│   │
│   ├── .env.example
│   ├── package.json
│   ├── README.md
│   └── .eslintrc.json
│
├── 📁 server/                                  # Backend Express Server
│   ├── 📁 config/
│   │   ├── database.js                        # MongoDB connection
│   │   ├── constants.js
│   │   ├── logger.js
│   │   └── env.js
│   │
│   ├── 📁 models/                             # Mongoose Schemas
│   │   ├── User.js
│   │   ├── DoctorProfile.js
│   │   ├── Booking.js
│   │   ├── Testimonial.js
│   │   ├── GoogleReview.js
│   │   ├── OTP.js
│   │   ├── AdminAccess.js
│   │   ├── AuditLog.js
│   │   ├── PaymentTransaction.js
│   │   └── SystemLog.js
│   │
│   ├── 📁 controllers/                        # Route Controllers
│   │   ├── authController.js
│   │   ├── profileController.js
│   │   ├── bookingController.js
│   │   ├── reviewController.js
│   │   ├── testimonialController.js
│   │   ├── uploadController.js
│   │   ├── adminController.js
│   │   ├── analyticsController.js
│   │   ├── googleReviewController.js
│   │   └── paymentController.js
│   │
│   ├── 📁 routes/                             # API Routes
│   │   ├── auth.routes.js
│   │   ├── profile.routes.js
│   │   ├── bookings.routes.js
│   │   ├── reviews.routes.js
│   │   ├── testimonials.routes.js
│   │   ├── upload.routes.js
│   │   ├── admin.routes.js
│   │   ├── analytics.routes.js
│   │   ├── googleReviews.routes.js
│   │   └── payments.routes.js
│   │
│   ├── 📁 middleware/                        # Custom Middleware
│   │   ├── auth.middleware.js
│   │   ├── validation.middleware.js
│   │   ├── errorHandler.middleware.js
│   │   ├── rateLimit.middleware.js
│   │   ├── audit.middleware.js
│   │   ├── cors.middleware.js
│   │   ├── compression.middleware.js
│   │   └── requestLogger.middleware.js
│   │
│   ├── 📁 services/                          # Business Logic
│   │   ├── authService.js
│   │   ├── bookingService.js
│   │   ├── emailService.js
│   │   ├── smsService.js
│   │   ├── uploadService.js
│   │   ├── paymentService.js
│   │   ├── moderationService.js
│   │   ├── googleReviewService.js
│   │   ├── analyticsService.js
│   │   └── notificationService.js
│   │
│   ├── 📁 utils/
│   │   ├── validators.js
│   │   ├── formatters.js
│   │   ├── errorHandler.js
│   │   ├── tokenManager.js
│   │   ├── otpManager.js
│   │   ├── encryptionUtils.js
│   │   ├── constants.js
│   │   └── helpers.js
│   │
│   ├── 📁 scripts/                           # Helper Scripts
│   │   ├── seedDatabase.js
│   │   ├── migrateData.js
│   │   ├── generateReports.js
│   │   └── maintenance.js
│   │
│   ├── 📁 tests/                             # Jest Test Files
│   │   ├── 📁 unit/
│   │   │   ├── auth.test.js
│   │   │   ├── booking.test.js
│   │   │   └── validation.test.js
│   │   │
│   │   ├── 📁 integration/
│   │   │   ├── auth.integration.test.js
│   │   │   ├── booking.integration.test.js
│   │   │   └── payment.integration.test.js
│   │   │
│   │   └── 📁 e2e/
│   │       ├── booking.e2e.test.js
│   │       └── payment.e2e.test.js
│   │
│   ├── 📁 logs/                              # Log Files
│   │   ├── error.log
│   │   ├── access.log
│   │   └── combined.log
│   │
│   ├── .env.example
│   ├── .gitignore
│   ├── server.js                             # Entry Point
│   ├── package.json
│   ├── package-lock.json
│   ├── jest.config.js
│   ├── .eslintrc.json
│   ├── README.md
│   └── ARCHITECTURE.md
│
├── 📁 docs/                                  # Documentation
│   ├── API.md                                # API Documentation
│   ├── DEPLOYMENT.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE_DESIGN.md
│   ├── SECURITY.md
│   ├── TESTING.md
│   ├── CONTRIBUTING.md
│   └── CHANGELOG.md
│
├── 📁 scripts/                               # Root Scripts
│   ├── setup.sh
│   ├── start-dev.sh
│   ├── start-prod.sh
│   ├── deploy.sh
│   └── backup.sh
│
├── 📁 docker/                                # Docker Configuration
│   ├── Dockerfile.client
│   ├── Dockerfile.admin
│   ├── Dockerfile.server
│   ├── docker-compose.yml
│   ├── docker-compose.prod.yml
│   └── .dockerignore
│
├── 📁 nginx/                                 # Nginx Configuration
│   ├── nginx.conf
│   ├── ssl.conf
│   └── gzip.conf
│
├── .github/                                  # GitHub Workflows
│   ├── 📁 workflows/
│   │   ├── test.yml
│   │   ├── deploy-client.yml
│   │   ├── deploy-server.yml
│   │   └── security-audit.yml
│
├── .gitignore
├── .prettierrc
├── .eslintrc.json
├── LICENSE
├── README.md
├── CONTRIBUTING.md
├── .env.example
└── docker-compose.yml
```

---

## 📋 Quick Reference

### Frontend Technologies
- **Framework**: React 18+
- **Styling**: Tailwind CSS + Custom CSS
- **Animation**: Framer Motion + Lottie
- **3D Graphics**: Three.js + React Three Fiber
- **State Management**: Zustand / React Context
- **Data Fetching**: React Query + Axios
- **Forms**: React Hook Form
- **UI Components**: Material-UI / Custom

### Backend Technologies
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + OTP
- **File Upload**: Cloudinary
- **Email**: Nodemailer
- **SMS**: Twilio
- **Payments**: Razorpay
- **Testing**: Jest + Supertest

### DevOps
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel/Netlify (Frontend), Render/Heroku (Backend)
- **Database**: MongoDB Atlas
- **CDN**: Cloudinary / CloudFlare
- **Monitoring**: Sentry + Google Analytics

---

## 🚀 Development Workflow

1. **Setup**
   ```bash
   git clone <repository>
   cd dr-shivalika-platform
   
   # Setup backend
   cd server
   npm install
   cp .env.example .env
   
   # Setup frontend
   cd ../client
   npm install
   cp .env.example .env
   
   # Setup admin
   cd ../admin
   npm install
   cp .env.example .env
   ```

2. **Development**
   ```bash
   # Terminal 1: Backend
   cd server && npm run dev
   
   # Terminal 2: Frontend
   cd client && npm run dev
   
   # Terminal 3: Admin
   cd admin && npm run dev
   ```

3. **Build & Deploy**
   ```bash
   # Production build
   npm run build
   
   # Deploy
   npm run deploy
   ```

