# CNA Incident Report Generator

A professional web application designed for Certified Nursing Assistants (CNAs) to create comprehensive incident reports with AI-powered assistance and multi-language support.

## 🚀 Features

- **Multi-Step Form Interface**: Intuitive step-by-step data collection
- **AI-Powered Report Generation**: Uses OpenAI GPT-4o to create grammatically correct, professional incident reports
- **Multi-Language Support**: Generate and translate reports in 6 languages:
  - English
  - Spanish (Español)
  - French (Français)
  - Chinese (中文)
  - Haitian Kreyol (Kreyòl Ayisyen)
  - Tagalog
- **Automatic Date/Time**: Automatically includes current date and time based on device settings
- **Database Persistence**: PostgreSQL storage for all incident reports
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Form Validation**: Comprehensive validation with error handling

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Shadcn/UI** for component library
- **TanStack Query** for state management
- **Wouter** for routing

### Backend
- **Express.js** with TypeScript
- **Drizzle ORM** for database operations
- **PostgreSQL** database
- **OpenAI API** integration

## 📋 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- OpenAI API key

### Environment Variables
Create a `.env` file with the following variables:
```env
DATABASE_URL=your_postgresql_connection_string
OPENAI_API_KEY=your_openai_api_key
NODE_ENV=development
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/cna-incident-report.git
cd cna-incident-report
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npm run db:push
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 🔧 Usage

### Creating an Incident Report

1. **CNA Information**: Enter your name, shift details, floor, and supervisor
2. **Patient Information**: Record patient name and room number
3. **Incident Details**: Specify time, nature, and description of the incident
4. **Patient Response**: Document if the patient was able to provide a statement
5. **Actions Taken**: Record your actions and supervisor notification status
6. **Review & Generate**: Review all information and generate the professional report

### Language Translation

After generating a report, use the language selector to translate the report into any of the supported languages while maintaining professional medical terminology.

## 📁 Project Structure

```
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/           # Utility libraries
│   │   ├── pages/         # Page components
│   │   └── utils/         # Helper functions and i18n
├── server/                # Express backend
│   ├── db.ts             # Database connection
│   ├── index.ts          # Main server file
│   ├── openai.ts         # AI integration
│   ├── routes.ts         # API route definitions
│   ├── storage.ts        # Data access layer
│   └── vite.ts           # Vite integration
├── shared/               # Shared types and schemas
│   └── schema.ts        # Database schema definitions
└── package.json         # Project dependencies
```

## 🚀 Deployment

### Replit (Recommended)
1. Import your GitHub repository to Replit
2. Set environment variables in the Secrets tab
3. Use the built-in deployment feature

### Vercel
1. Connect your GitHub repository
2. Set environment variables
3. Deploy with automatic PostgreSQL database

### Railway
1. Connect GitHub repository
2. Add PostgreSQL addon
3. Set environment variables and deploy

## 🔐 Security & Privacy

- All sensitive data is stored securely in environment variables
- Patient information is handled according to healthcare privacy standards
- API keys are never exposed to the client-side
- Database connections use secure SSL connections

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check the deployment guide: `DEPLOYMENT_GUIDE.md`
2. Review error logs for troubleshooting
3. Ensure all environment variables are properly configured

## 🔄 Recent Updates

- ✅ Simplified report format to single paragraph narrative
- ✅ Added automatic date/time insertion
- ✅ Updated supervisor notification to radio selection
- ✅ Enhanced multi-language translation capabilities
- ✅ Improved form validation and user experience