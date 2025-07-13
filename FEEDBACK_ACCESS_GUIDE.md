# User Feedback Access Guide

This guide provides multiple methods to access and analyze user feedback data collected by the CNA Incident Report Generator.

## Method 1: Admin Dashboard (Web Interface)

### Access the Dashboard
1. Navigate to: `https://your-app-url.replit.app/admin/feedback`
2. Enter admin access key: `admin123`
3. View comprehensive feedback analytics

### Dashboard Features
- **Overview**: Summary statistics and rating distributions
- **All Responses**: Individual feedback entries with ratings and comments
- **Text Analysis**: Common themes in helpful features and suggestions
- **CSV Export**: Download all feedback data for external analysis

## Method 2: Direct Database Access (PostgreSQL)

### Using Replit Database Tab
1. Open your Replit project
2. Go to the "Database" tab in the sidebar
3. Click "Open Database" to access PostgreSQL console
4. Run SQL queries directly

### Useful SQL Queries

#### Get all feedback data:
```sql
SELECT * FROM feedback ORDER BY submitted_at DESC;
```

#### Average ratings by category:
```sql
SELECT 
  ROUND(AVG(usefulness), 2) as avg_usefulness,
  ROUND(AVG(ease_of_use), 2) as avg_ease_of_use,
  ROUND(AVG(overall_satisfaction), 2) as avg_satisfaction,
  COUNT(*) as total_responses
FROM feedback;
```

#### Rating distribution:
```sql
SELECT 
  overall_satisfaction as rating,
  COUNT(*) as count
FROM feedback 
GROUP BY overall_satisfaction 
ORDER BY overall_satisfaction;
```

#### Recent feedback (last 7 days):
```sql
SELECT 
  submitted_at,
  usefulness,
  ease_of_use,
  overall_satisfaction,
  most_helpful_feature,
  suggested_improvements
FROM feedback 
WHERE submitted_at >= NOW() - INTERVAL '7 days'
ORDER BY submitted_at DESC;
```

#### Most mentioned helpful features:
```sql
SELECT 
  most_helpful_feature,
  COUNT(*) as mentions
FROM feedback 
GROUP BY most_helpful_feature 
ORDER BY mentions DESC 
LIMIT 10;
```

#### Export feedback as CSV-like format:
```sql
SELECT 
  id,
  TO_CHAR(submitted_at, 'YYYY-MM-DD HH24:MI:SS') as submission_date,
  usefulness,
  ease_of_use,
  overall_satisfaction,
  most_helpful_feature,
  suggested_improvements,
  additional_comments
FROM feedback 
ORDER BY submitted_at DESC;
```

## Method 3: API Access (For Developers)

### Authentication
Use the admin API key: `admin123`

### Endpoints

#### Get all feedback:
```bash
curl -H "Authorization: Bearer admin123" \
     https://your-app-url.replit.app/api/admin/feedback
```

#### Get feedback statistics:
```bash
curl -H "Authorization: Bearer admin123" \
     https://your-app-url.replit.app/api/admin/feedback/stats
```

### Response Format
```json
{
  "totalResponses": 25,
  "averageUsefulness": 4.2,
  "averageEaseOfUse": 4.5,
  "averageSatisfaction": 4.3,
  "ratingDistribution": [
    {"rating": 1, "count": 0},
    {"rating": 2, "count": 1},
    {"rating": 3, "count": 3},
    {"rating": 4, "count": 8},
    {"rating": 5, "count": 13}
  ],
  "topFeatures": [
    {"feature": "multilingual", "count": 15},
    {"feature": "step-by-step", "count": 12}
  ],
  "commonSuggestions": [
    {"suggestion": "faster", "count": 8},
    {"suggestion": "mobile", "count": 6}
  ]
}
```

## Method 4: Database Connection String

### Environment Variables
Your database connection details are available in these environment variables:
- `DATABASE_URL`: Full connection string
- `PGHOST`: Database host
- `PGPORT`: Database port
- `PGUSER`: Username
- `PGPASSWORD`: Password
- `PGDATABASE`: Database name

### Connect with psql:
```bash
psql $DATABASE_URL
```

### Connect with any PostgreSQL client:
Use the individual environment variables to connect with tools like:
- pgAdmin
- DBeaver
- DataGrip
- TablePlus

## Method 5: Programmatic Analysis

### Python Example:
```python
import psycopg2
import pandas as pd
import os

# Connect to database
conn = psycopg2.connect(os.environ['DATABASE_URL'])

# Load feedback data
df = pd.read_sql_query("""
    SELECT * FROM feedback 
    ORDER BY submitted_at DESC
""", conn)

# Basic analysis
print(f"Total responses: {len(df)}")
print(f"Average satisfaction: {df['overall_satisfaction'].mean():.2f}")
print(f"Rating distribution:\n{df['overall_satisfaction'].value_counts().sort_index()}")

conn.close()
```

## Security Notes

1. **Admin Access Key**: Change `admin123` to a secure key in production
2. **Database Access**: Database credentials are sensitive - keep them secure
3. **IP Tracking**: Feedback includes IP addresses for analytics (anonymize if needed)

## Analytics Suggestions

### Key Metrics to Track:
1. **Satisfaction Trends**: Monitor overall satisfaction over time
2. **Feature Popularity**: Track which features users find most helpful
3. **Improvement Requests**: Analyze suggestions for product roadmap
4. **Usage Patterns**: Identify peak usage times and user behavior

### Regular Reports:
- Weekly satisfaction summary
- Monthly feature feedback analysis
- Quarterly improvement suggestion review
- User experience trend analysis

## Feedback Schema

```sql
CREATE TABLE feedback (
  id SERIAL PRIMARY KEY,
  usefulness INTEGER NOT NULL,
  ease_of_use INTEGER NOT NULL,
  overall_satisfaction INTEGER NOT NULL,
  most_helpful_feature TEXT NOT NULL,
  suggested_improvements TEXT NOT NULL,
  additional_comments TEXT,
  ip_address TEXT NOT NULL,
  submitted_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

## Support

For technical issues accessing feedback data:
1. Check database connection status
2. Verify admin credentials
3. Review API endpoint URLs
4. Check Replit deployment status

---

*This guide covers all major methods for accessing user feedback. Choose the method that best fits your workflow and technical requirements.*