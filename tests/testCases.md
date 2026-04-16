# Engineering Insights Dashboard - Manual Test Cases

## Overview
This document contains structured manual test cases for the Engineering Insights Dashboard application to ensure quality assurance and proper functionality.

---

## Test Case Categories

### 1. Input Validation Tests

#### Test Case 1: Valid GitHub Repository Input
**Test Case Name**: TC001_ValidRepositoryInput  
**Input**: `https://github.com/facebook/react`  
**Expected Output**: 
- Repository data displayed successfully
- Metrics cards show stars, issues, PRs, contributors
- Commit chart displays 7-day activity
- No error messages shown
- Loading state appears then resolves

#### Test Case 2: Invalid Repository Input - Non-existent
**Test Case Name**: TC002_InvalidRepositoryInput  
**Input**: `https://github.com/nonexistent/repo123`  
**Expected Output**: 
- Error message: "Repository not found. Please check the owner and repository name."
- No repository data displayed
- Error state shown in user-friendly format
- Application remains responsive

#### Test Case 3: Invalid Repository Input - Wrong Format
**Test Case Name**: TC003_InvalidFormatInput  
**Input**: `https://google.com/not-github`  
**Expected Output**: 
- Error message: "Invalid GitHub URL. Please use format: https://github.com/owner/repo"
- Input field highlighted with error
- No API calls made
- Clear validation feedback

#### Test Case 4: Empty Input Validation
**Test Case Name**: TC004_EmptyInput  
**Input**: Empty string or whitespace only  
**Expected Output**: 
- Validation error: "Please enter a valid GitHub repository URL"
- Submit button disabled or validation message shown
- No API calls attempted
- Focus remains on input field

---

### 2. API Failure Scenario Tests

#### Test Case 5: GitHub API Rate Limit
**Test Case Name**: TC005_APIRateLimit  
**Input**: Multiple rapid repository requests  
**Expected Output**: 
- Rate limit alert displayed with countdown timer
- Clear message about reset time
- Graceful degradation to cached data if available
- Application remains functional

#### Test Case 6: Network Connection Failure
**Test Case Name**: TC006_NetworkFailure  
**Input**: Repository request with network disconnected  
**Expected Output**: 
- Error message: "Network error. Please check your internet connection."
- Loading state stops appropriately
- Retry option available
- No application crash

#### Test Case 7: Slow Network Response
**Test Case Name**: TC007_SlowNetwork  
**Input**: Repository request under slow network conditions  
**Expected Output**: 
- Loading skeleton displayed immediately
- Timeout handling after reasonable time
- Cancel request option available
- Progress indication for user

---

### 3. Component Functionality Tests

#### Test Case 8: Metrics Cards Display
**Test Case Name**: TC008_MetricsCardsDisplay  
**Input**: Valid repository loaded  
**Expected Output**: 
- All metric cards displayed (Stars, Issues, PRs, Contributors)
- Numbers formatted correctly (commas for thousands)
- Icons displayed properly
- Responsive layout on mobile/desktop

#### Test Case 9: Commit Chart Rendering
**Test Case Name**: TC009_CommitChartRendering  
**Input**: Repository with commit activity  
**Expected Output**: 
- Line chart displays 7-day data
- X-axis shows dates
- Y-axis shows commit counts
- Interactive tooltips on hover
- Responsive sizing

#### Test Case 10: Contributors List
**Test Case Name**: TC010_ContributorsList  
**Input**: Repository with multiple contributors  
**Expected Output**: 
- Top 5 contributors displayed
- Avatar images loaded correctly
- Contribution counts accurate
- Links to GitHub profiles functional

---

### 4. Enhanced Features Tests

#### Test Case 11: Repository Comparison
**Test Case Name**: TC011_RepositoryComparison  
**Input**: Two valid repositories for comparison  
**Expected Output**: 
- Side-by-side comparison displayed
- Winner badge shown for higher-scoring repo
- Advantages and similarities listed
- Comparison scores calculated correctly

#### Test Case 12: AI Assistant Questions
**Test Case Name**: TC012_AIAssistant  
**Input**: Question about repository maintenance  
**Expected Output**: 
- Context-aware response provided
- Response based on actual repository data
- Conversation history maintained
- Loading state during processing

#### Test Case 13: Health Score Calculation
**Test Case Name**: TC013_HealthScore  
**Input**: Repository with various metrics  
**Expected Output**: 
- Health score displayed (0-100 scale)
- Score calculation uses all factors
- Visual indicator (color coding)
- Score explanation available

---

### 5. Error Handling Tests

#### Test Case 14: 404 Error Handling
**Test Case Name**: TC014_NotFoundError  
**Input**: Invalid repository endpoint  
**Expected Output**: 
- 404 error page or message
- Clear explanation of error
- Option to return to main page
- No application crash

#### Test Case 15: 500 Error Handling
**Test Case Name**: TC015_ServerError  
**Input**: Repository causing server error  
**Expected Output**: 
- Generic error message displayed
- Error logged for debugging
- User-friendly error presentation
- Recovery options available

---

### 6. Performance Tests

#### Test Case 16: Large Repository Loading
**Test Case Name**: TC016_LargeRepository  
**Input**: Repository with high star count and many contributors  
**Expected Output**: 
- Loading states shown appropriately
- Data loads within reasonable time
- Memory usage remains stable
- No UI freezing

#### Test Case 17: Multiple Rapid Requests
**Test Case Name**: TC017_RapidRequests  
**Input**: Quick successive repository analyses  
**Expected Output**: 
- Previous requests cancelled properly
- Loading states managed correctly
- No memory leaks
- Final request completes successfully

---

### 7. Responsive Design Tests

#### Test Case 18: Mobile Viewport
**Test Case Name**: TC018_MobileView  
**Input**: Application viewed on mobile device  
**Expected Output**: 
- All elements fit screen width
- Touch-friendly interface
- Readable text sizes
- Functional navigation

#### Test Case 19: Tablet Viewport
**Test Case Name**: TC019_TabletView  
**Input**: Application viewed on tablet device  
**Expected Output**: 
- Optimized layout for tablet
- Proper element spacing
- Accessible touch targets
- Consistent functionality

---

### 8. Accessibility Tests

#### Test Case 20: Keyboard Navigation
**Test Case Name**: TC020_KeyboardNavigation  
**Input**: Navigation using keyboard only  
**Expected Output**: 
- All interactive elements reachable via Tab
- Focus indicators visible
- Enter/Space keys activate elements
- Logical tab order

#### Test Case 21: Screen Reader Compatibility
**Test Case Name**: TC021_ScreenReader  
**Input**: Application used with screen reader  
**Expected Output**: 
- Alt text for images
- Semantic HTML structure
- Form labels properly associated
- Announcements for dynamic content

---

## Test Execution Guidelines

### Pre-Test Setup
1. Clear browser cache and cookies
2. Ensure stable internet connection
3. Open developer tools for network monitoring
4. Document browser and OS version

### Test Execution
1. Follow each test case step-by-step
2. Record actual vs expected results
3. Note any deviations or issues
4. Capture screenshots for visual tests
5. Test on multiple browsers (Chrome, Firefox, Safari)

### Post-Test Documentation
1. Document test results in test report
2. Capture any bugs or issues found
3. Note performance observations
4. Record browser compatibility issues
5. Provide recommendations for fixes

---

## Test Environment

### Recommended Browsers
- Chrome (Latest version)
- Firefox (Latest version)
- Safari (Latest version)
- Edge (Latest version)

### Viewport Sizes
- Desktop: 1920x1080
- Tablet: 768x1024
- Mobile: 375x667

### Network Conditions
- Fast: >10 Mbps
- Slow: <1 Mbps
- Offline: No connection

---

## Quality Criteria

### Functional Requirements
- ✅ All features work as specified
- ✅ No JavaScript errors in console
- ✅ Proper error handling and recovery
- ✅ Data accuracy and consistency

### Performance Requirements
- ✅ Page load time <3 seconds
- ✅ API response time <5 seconds
- ✅ Smooth animations and transitions
- ✅ Responsive under load

### Usability Requirements
- ✅ Intuitive user interface
- ✅ Clear error messages
- ✅ Consistent design patterns
- ✅ Accessible to all users
