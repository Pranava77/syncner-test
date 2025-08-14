# 🎨 Theme System Audit Plan

## 🎯 **Objective**
Systematically audit all pages, components, and UI elements to ensure they are properly bound to the theme system (light/dark mode) and contain no hardcoded colors.

## 📋 **Audit Categories**

### 1. **Pages (src/pages/)**
- [ ] LandingPage.tsx
- [ ] LoginPage.tsx
- [ ] RegisterPage.tsx
- [ ] OnboardingFlow.tsx
- [ ] StudentDashboard.tsx
- [ ] TrainingLevels.tsx
- [ ] LevelLearnPage.tsx
- [ ] LevelTestPage.tsx
- [ ] LevelExercisePage.tsx
- [ ] ProjectsPage.tsx
- [ ] StudentProfile.tsx
- [ ] AdminDashboard.tsx
- [ ] AdminAnalytics.tsx
- [ ] AdminCurriculum.tsx
- [ ] AdminAdmin.tsx
- [ ] AdminStaff.tsx
- [ ] AdminSettings.tsx
- [ ] AdminUsers.tsx
- [ ] AdminProfile.tsx
- [ ] StaffDashboard.tsx
- [ ] TrainingLevelDetail.tsx

### 2. **Components (src/components/)**
- [ ] Layout.tsx
- [ ] StudentLayout.tsx
- [ ] ErrorBoundary.tsx
- [ ] LoadingScreen.tsx
- [ ] LevelProgressChart.tsx
- [ ] LevelStatus.tsx
- [ ] LevelsSidebar.tsx
- [ ] ResetPasswordModal.tsx
- [ ] TaskSubmissionModal.tsx
- [ ] AIChat.tsx
- [ ] ThemeSwitcher.tsx
- [ ] ThemeText.tsx
- [ ] ThemeContainer.tsx
- [ ] ProtectedRoute.tsx
- [ ] AttendanceHeatmap.tsx

### 3. **UI Element Types to Check**
- [ ] **Backgrounds**: `bg-*` classes and inline styles
- [ ] **Text Colors**: `text-*` classes and inline styles
- [ ] **Borders**: `border-*` classes and inline styles
- [ ] **Shadows**: `shadow-*` classes and inline styles
- [ ] **Buttons**: All button elements and their states
- [ ] **Form Elements**: Inputs, selects, checkboxes, etc.
- [ ] **Cards/Containers**: All container elements
- [ ] **Icons**: Icon colors and backgrounds
- [ ] **Progress Bars**: Progress indicators and bars
- [ ] **Modals**: Modal backgrounds, overlays, and content
- [ ] **Tables**: Table headers, rows, and cells
- [ ] **Navigation**: Sidebar, header, and navigation elements

## 🔍 **Hardcoded Color Patterns to Find**

### **Tailwind Classes (Hardcoded)**
- `bg-offblack`, `bg-trueturquoise`, `bg-teallight`, `bg-paperwhite`, `bg-rust`, `bg-soft-gray`
- `text-offblack`, `text-teallight`, `text-trueturquoise`, `text-paperwhite`
- `border-offblack`, `border-trueturquoise`, `border-teallight`, `border-paperwhite`
- `shadow-*` (if not using theme variables)

### **Inline Styles (Hardcoded)**
- `backgroundColor: '#...'`, `color: '#...'`, `borderColor: '#...'`
- `rgba(...)` values that should use theme variables
- Any hex color codes

### **CSS Variables (Should Use)**
- `var(--color-primary-bg)`, `var(--color-secondary-bg)`, `var(--color-tertiary-bg)`
- `var(--color-text-primary)`, `var(--color-text-secondary)`, `var(--color-text-tertiary)`
- `var(--color-accent-primary)`, `var(--color-accent-secondary)`, `var(--color-accent-tertiary)`
- `var(--color-border)`, `var(--color-border-subtle)`
- `var(--shadow-sm)`, `var(--shadow-md)`, `var(--shadow-lg)`

## 📊 **Audit Status Tracking**

### **Phase 1: Initial Scan (Current)**
- [x] LandingPage.tsx - ✅ Complete
- [x] LevelLearnPage.tsx - ✅ Complete
- [x] AdminAnalytics.tsx - ✅ Complete
- [x] TrainingLevels.tsx - ✅ Complete
- [x] StudentDashboard.tsx - ✅ Complete
- [x] LevelTestPage.tsx - ✅ Complete
- [x] LevelExercisePage.tsx - ✅ Complete
- [x] AdminDashboard.tsx - ✅ Complete
- [x] OnboardingFlow.tsx - ✅ Complete

### **Phase 2: Remaining Pages**
- [ ] AdminCurriculum.tsx
- [ ] AdminAdmin.tsx
- [ ] AdminStaff.tsx
- [ ] AdminSettings.tsx
- [ ] AdminUsers.tsx
- [ ] AdminProfile.tsx
- [ ] ProjectsPage.tsx
- [ ] StudentProfile.tsx
- [ ] StaffDashboard.tsx
- [ ] TrainingLevelDetail.tsx
- [ ] LoginPage.tsx
- [ ] RegisterPage.tsx

### **Phase 3: Component Audit**
- [ ] Layout.tsx
- [ ] StudentLayout.tsx
- [ ] ErrorBoundary.tsx
- [ ] LoadingScreen.tsx
- [ ] LevelProgressChart.tsx
- [ ] LevelStatus.tsx
- [ ] LevelsSidebar.tsx
- [ ] ResetPasswordModal.tsx
- [ ] TaskSubmissionModal.tsx
- [ ] AIChat.tsx
- [ ] ProtectedRoute.tsx
- [ ] AttendanceHeatmap.tsx

## 🛠️ **Implementation Strategy**

### **Step 1: Automated Scanning**
1. Use grep to find all hardcoded color patterns
2. Create a comprehensive list of files and line numbers
3. Categorize by severity (critical, moderate, minor)

### **Step 2: Manual Review**
1. Review each file systematically
2. Check for context and proper theme variable usage
3. Update components to use theme variables
4. Test in both light and dark modes

### **Step 3: Testing & Validation**
1. Test all components in both themes
2. Verify color consistency and accessibility
3. Check for any visual regressions
4. Validate theme switching functionality

## 📈 **Success Metrics**
- [ ] 0 hardcoded colors in pages
- [ ] 0 hardcoded colors in components
- [ ] 100% theme variable usage
- [ ] Consistent visual experience across themes
- [ ] Proper contrast ratios maintained
- [ ] Smooth theme switching without flicker

## 🚀 **Next Actions**
1. **Run automated scan** to identify all hardcoded colors
2. **Prioritize critical components** (user-facing pages first)
3. **Systematically update** each component
4. **Test thoroughly** in both themes
5. **Document any edge cases** or special considerations

---

**Status**: 🚧 Audit Planning Phase - Ready to begin systematic review
**Estimated Time**: 2-3 hours for complete audit and implementation
**Priority**: High - Critical for production readiness
